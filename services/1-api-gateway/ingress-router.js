// services/1-api-gateway/ingress-router.js
const sanitizePayload = require('./middleware/payload-sanitizer');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * FIX: Updated BACKEND_URL to use the environment variable from Render.
 * If the environment variable is missing, it defaults to your deployed Resource Server.
 */
const BACKEND_URL = process.env.BACKEND_URL || 'https://three-resource-server.onrender.com';

// CORS Middleware (Ensures the dashboard can talk to the gateway)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 1. Basic Security Headers
app.use(helmet());
app.use(express.json()); 
app.use(sanitizePayload);

// 2. Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// 3. Zero-Trust Middleware: Verify Identity (JWT)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        console.warn(`[SECURITY ALERT] Unauthorized access attempt from IP: ${req.ip}`);
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. Malformed token.' });
    }

    try {
        // Use the same secret as the Auth Provider
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cybersec-secret-2026');
        req.user = decoded;
        next(); 
    } catch (err) {
        console.warn(`[SECURITY ALERT] Invalid token attempt from IP: ${req.ip}`);
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// 4. The Reverse Proxy
// This forwards authorized requests to the BACKEND_URL defined above
app.use('/api/v1/secure-data', verifyToken, createProxyMiddleware({ 
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/v1/secure-data': '', 
    },
    // Error handler to prevent the gateway from crashing if the backend is asleep
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(504).json({ error: 'Gateway timeout: Resource Server is unreachable.' });
    }
}));

// Health check endpoint
app.get('/health', (req, res) => res.status(200).send('Gateway is operational.'));

app.listen(PORT, () => {
    console.log(`🛡️  Zero-Trust Gateway running on port ${PORT}`);
    console.log(`🔗 Proxying validated traffic to: ${BACKEND_URL}`);
});