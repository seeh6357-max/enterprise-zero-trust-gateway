// services/1-api-gateway/ingress-router.js
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:10000';

// 1. Basic Security Headers (Defense in Depth)
app.use(helmet());

// 2. Global Rate Limiting (Prevents DoS and Brute Force attacks)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// 3. Zero-Trust Middleware: Verify Identity (JWT)
const verifyToken = (req, res, next) => {
    // In a true Zero-Trust model, we assume the network is hostile.
    // Every single request must have a valid cryptographic token.
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        console.warn(`[SECURITY ALERT] Unauthorized access attempt from IP: ${req.ip}`);
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. Malformed token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-local-dev');
        req.user = decoded;
        next(); // Token is valid, proceed to the proxy
    } catch (err) {
        console.warn(`[SECURITY ALERT] Invalid token attempt from IP: ${req.ip}`);
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// 4. The Reverse Proxy (Routing traffic to the isolated backend)
// Notice how the proxy is ONLY applied AFTER the verifyToken middleware passes.
app.use('/api/v1/secure-data', verifyToken, createProxyMiddleware({ 
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/secure-data': '', // rewrite path before sending to backend
    },
}));

// Health check endpoint for Render/GitHub Actions
app.get('/health', (req, res) => res.status(200).send('Gateway is operational.'));

app.listen(PORT, () => {
    console.log(`🛡️  Zero-Trust Gateway running on port ${PORT}`);
    console.log(`🔗 Proxying validated traffic to: ${BACKEND_URL}`);
});