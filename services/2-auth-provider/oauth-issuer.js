// services/2-auth-provider/oauth-issuer.js
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = 4000;
// CRITICAL: This secret MUST exactly match the one in your Gateway!
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev'; 

// Simulated User Database
const users = {
    'admin': 'cybersec2026'
};

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username] === password) {
        // Issue a short-lived JWT (Zero-Trust best practice)
        const token = jwt.sign(
            { user: username, role: 'administrator' }, 
            JWT_SECRET, 
            { expiresIn: '15m' } 
        );
        console.log(`[AUTH] Issued new token for user: ${username}`);
        return res.json({ token });
    }

    console.warn(`[AUTH] Failed login attempt for user: ${username}`);
    return res.status(401).json({ error: 'Invalid credentials' });
});

app.listen(PORT, () => {
    console.log(`🔑 Identity Provider running on port ${PORT}`);
});