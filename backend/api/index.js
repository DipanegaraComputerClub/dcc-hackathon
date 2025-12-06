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
        // Try to load from dist first (after build)
        const { default: honoApp } = require('../dist/index.js');
        app = honoApp;
      } catch (err) {
        console.error('Failed to load from dist/, trying direct import:', err.message);
        // Fallback: try to import directly (won't work on Vercel but helps debug)
        return res.status(500).json({ 
          error: 'Build not found',
          message: 'Backend build output missing. Run "bun run build" first.',
          hint: 'Make sure dist/index.js exists after build'
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
    
    // Send response back to Vercel
    const responseBody = await response.text();
    
    // Set response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Send response
    res.status(response.status).send(responseBody);
    
  } catch (error) {
    console.error('❌ Vercel handler error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
