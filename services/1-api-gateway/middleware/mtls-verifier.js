// services/1-api-gateway/middleware/mtls-verifier.js

const mtlsVerifier = (req, res, next) => {
    // In a production environment, the edge proxy (like Cloudflare) or the internal network
    // will pass the client certificate details in the headers, or Node will handle it natively via req.client.
    
    const clientCert = req.socket.getPeerCertificate ? req.socket.getPeerCertificate() : null;

    if (req.client && req.client.authorized) {
        // Client has a valid certificate signed by our internal Certificate Authority (CA)
        next();
    } else if (process.env.NODE_ENV === 'development') {
        // Bypass for local Codespace testing
        console.warn("[SECURITY] mTLS bypassed for local development.");
        next();
    } else {
        console.error(`[SECURITY BLOCK] mTLS Handshake failed for IP: ${req.ip}`);
        return res.status(403).json({ error: 'Access Denied. Invalid or missing client certificate.' });
    }
};

module.exports = mtlsVerifier;