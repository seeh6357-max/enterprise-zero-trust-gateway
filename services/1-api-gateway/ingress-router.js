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
 * 1. BACKEND TARGET CONFIGURATION
 * This is where the bouncer sends the traffic after checking the ID.
 */
const BACKEND_URL = process.env.BACKEND_URL || 'https://three-resource-server.onrender.com';

// Enable CORS so your Dashboard can communicate with this Gateway
app.use(cors({
    origin: '*', // For production, replace '*' with your specific dashboard URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json()); 
app.use(sanitizePayload);

// 2. RATE LIMITING
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

/**
 * 3. ZERO-TRUST TOKEN VERIFICATION
 * The "Bouncer" logic.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn(`[SEC_ALERT] Missing/Invalid Header from IP: ${req.ip}`);
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; 

    try {
        /**
         * CRITICAL: The secret MUST match between IdP and Gateway.
         * We check the Render Environment Variable first.
         */
        const secret = process.env.JWT_SECRET || 'cybersec-secret-2026';
        const decoded = jwt.verify(token, secret);
        
        console.log(`[SEC_LOG] Authorized access for user: ${decoded.username || 'unknown'}`);
        req.user = decoded;
        next(); 
    } catch (err) {
        console.error(`[SEC_ALERT] Token Verification Failed: ${err.message}`);
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

/**
 * 4. REVERSE PROXY WITH ERROR HANDLING
 */
app.use('/api/v1/secure-data', verifyToken, createProxyMiddleware({ 
    target: BACKEND_URL,
    changeOrigin: true,
    // Prevents the gateway from hanging if the resource server is asleep/spinning up
    proxyTimeout: 10000, 
    timeout: 10000,
    pathRewrite: {
        '^/api/v1/secure-data': '', 
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXY_LOG] Forwarding request to: ${BACKEND_URL}${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('[PROXY_ERR] Connection to Resource Server failed:', err.message);
        res.status(504).json({ error: 'Gateway timeout: Resource Server is unreachable or asleep.' });
    }
}));

app.get('/health', (req, res) => res.status(200).send('Gateway is operational.'));

app.listen(PORT, () => {
    console.log(`🛡️  Zero-Trust Gateway active on port ${PORT}`);
    console.log(`🔗 Target Resource Server: ${BACKEND_URL}`);
});