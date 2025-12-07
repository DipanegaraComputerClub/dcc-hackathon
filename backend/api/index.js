/**
 * Vercel Serverless Function Handler for Hono
 * This is the entry point for all API requests on Vercel
 */

const path = require('path');
const fs = require('fs');

// We'll import the compiled app from the build output
let app;

module.exports = async (req, res) => {
  try {
    // Lazy load the app
    if (!app) {
      try {
        // Debug: Check if file exists in different locations
        const possiblePaths = [
          path.join(__dirname, '../dist/index.js'),
          path.join(process.cwd(), 'backend/dist/index.js'),
          path.join(process.cwd(), 'dist/index.js'),
          '/var/task/backend/dist/index.js'
        ];
        
        let foundPath = null;
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            foundPath = testPath;
            break;
          }
        }
        
        if (!foundPath) {
          return res.status(500).json({ 
            error: 'Build not found',
            message: 'dist/index.js not found in any expected location',
            debug: {
              cwd: process.cwd(),
              dirname: __dirname,
              testedPaths: possiblePaths,
              dirContents: {
                cwd: fs.readdirSync(process.cwd()),
                backend: fs.existsSync(path.join(process.cwd(), 'backend')) 
                  ? fs.readdirSync(path.join(process.cwd(), 'backend'))
                  : 'not found'
              }
            }
          });
        }
        
        // Try to require the found path
        const honoApp = require(foundPath);
        app = honoApp.default || honoApp;
      } catch (err) {
        console.error('Failed to load Hono app:', err);
        console.error('Current directory:', process.cwd());
        console.error('Dirname:', __dirname);
        
        return res.status(500).json({ 
          error: 'Failed to load app',
          message: 'Error loading dist/index.js',
          debug: {
            cwd: process.cwd(),
            dirname: __dirname,
            error: err.message,
            stack: err.stack
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
