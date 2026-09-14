const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 200, keepAliveMsecs: 5000 });

const app = express();
app.use(cors());
const path = require('path');
app.use(express.static(path.join(__dirname, '../../public')));

const jwt = require('jsonwebtoken');

// Real Auth Middleware for Supabase Auth JWTs
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.GOTRUE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long');
    // GoTrue stores the user id in the 'sub' claim
    req.user = { id: decoded.sub };
    
    // Inject the verified user ID into the headers so downstream services don't need to parse JWTs
    req.headers['x-user-id'] = decoded.sub;
    next();
  } catch (err) {
    console.error('[API Gateway] JWT Verification Failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[API Gateway] ${req.method} ${req.url}`);
  next();
});

const proxyOptions = (targetUrl) => ({
  target: targetUrl,
  changeOrigin: true,
  agent: httpAgent,
  pathRewrite: (path, req) => req.originalUrl,
  onError: (err, req, res) => {
    console.error(`[API Gateway] Proxy Error to ${targetUrl}:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad Gateway: Service Unavailable' });
    }
  }
});

// Protected Routes
app.use('/api/orders', requireAuth, createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL || 'http://localhost:3001')));
app.use('/api/users', requireAuth, createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL || 'http://localhost:3012')));
app.use('/api/ledger', requireAuth, createProxyMiddleware(proxyOptions(process.env.LEDGER_SERVICE_URL || 'http://localhost:3006')));
app.use('/api/pricing', requireAuth, createProxyMiddleware(proxyOptions(process.env.PRICING_SERVICE_URL || 'http://localhost:3007')));
app.use('/api/kyc', requireAuth, createProxyMiddleware(proxyOptions(process.env.KYC_SERVICE_URL || 'http://localhost:3008')));
app.use('/api/reviews', requireAuth, createProxyMiddleware(proxyOptions(process.env.REVIEW_SERVICE_URL || 'http://localhost:3010')));
app.use('/api/dispatch', requireAuth, createProxyMiddleware(proxyOptions(process.env.DISPATCH_SERVICE_URL || 'http://localhost:3004')));
app.use('/api/admin', requireAuth, createProxyMiddleware(proxyOptions(process.env.ADMIN_SERVICE_URL || 'http://localhost:3013')));

// Public Routes
app.use('/api/catalog', createProxyMiddleware(proxyOptions(process.env.CATALOG_SERVICE_URL || 'http://localhost:3003')));
app.use('/api/inventory', createProxyMiddleware(proxyOptions(process.env.CATALOG_SERVICE_URL || 'http://localhost:3003')));
app.use('/api/payments', createProxyMiddleware(proxyOptions(process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002')));

// Auth Route (proxies directly to GoTrue)
app.use('/auth', async (req, res) => {
  const targetUrl = (process.env.GOTRUE_URL || 'http://gotrue:9999') + req.url;
  console.log(`[API Gateway] Manual Proxying GoTrue request to: ${targetUrl}`);
  
  try {
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers, host: new URL(targetUrl).host }
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      // Need to stream the body
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        fetchOptions.body = Buffer.concat(chunks);
      }
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.status(response.status);
    
    // Pipe response body
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      res.end();
    }
  } catch (err) {
    console.error(`[API Gateway] GoTrue Proxy Error:`, err.message);
    res.status(502).json({ error: 'GoTrue Unavailable' });
  }
});

app.listen(3000, () => {
  console.log('[API Gateway] Listening on port 3000');
});
