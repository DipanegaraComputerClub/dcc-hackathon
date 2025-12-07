/**
 * Vercel Serverless Function Handler for Hono
 * This is the entry point for all API requests on Vercel
 */

const path = require('path');

// We'll import the compiled app from the build output
let app;

module.exports = async (req, res) => {
  try {
    // Lazy load the app
    if (!app) {
      try {
        // Try multiple paths for Vercel compatibility (monorepo structure)
        let honoApp;
        try {
          // Try relative path from api/ (works locally and on Vercel)
          honoApp = require('../dist/index.js');
        } catch (e1) {
          try {
            // Try absolute path for Vercel monorepo (backend subfolder)
            honoApp = require('/var/task/backend/dist/index.js');
          } catch (e2) {
            // Try from root with backend prefix
            honoApp = require('./backend/dist/index.js');
          }
        }
        app = honoApp.default || honoApp;
      } catch (err) {
        console.error('Failed to load Hono app:', err);
        console.error('Current directory:', process.cwd());
        console.error('Dirname:', __dirname);
        
        return res.status(500).json({ 
          error: 'Build not found',
          message: 'Backend build output missing.',
          hint: 'dist/index.js cannot be loaded',
          debug: {
            cwd: process.cwd(),
            dirname: __dirname,
            error: err.message,
            attemptedPaths: [
              path.join(__dirname, '../dist/index.js'),
              '/var/task/backend/dist/index.js',
              './backend/dist/index.js'
            ]
          }
        });
      }
    }

    // Build Web API Request from Vercel request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || req.headers['x-forwarded-host'];
    const url = `${protocol}://${host}${req.url}`;
    
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
    });

    // Get body for POST/PUT/PATCH
    let body = undefined;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body
    });

    // Call Hono app
    const response = await app.fetch(request);
    
    // Set status
    res.status(response.status);
    
    // Copy all headers from Hono response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Handle different content types properly
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // JSON response
      const data = await response.json();
      res.json(data);
    } else if (contentType.includes('text/')) {
      // Text response
      const text = await response.text();
      res.send(text);
    } else {
      // Binary/other response
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
    
  } catch (error) {
    console.error('❌ Vercel handler error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
