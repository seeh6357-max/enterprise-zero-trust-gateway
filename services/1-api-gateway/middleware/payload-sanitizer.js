// services/1-api-gateway/middleware/payload-sanitizer.js

const sanitizePayload = (req, res, next) => {
    // A strict enterprise gateway blocks malicious patterns before they reach the backend.
    const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b)|(['"])/i;
    const xssPattern = /(<script.*?>.*?<\/script>)|(<.*?on\w+?=.*?>)/i;

    const checkObject = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                if (sqlInjectionPattern.test(obj[key])) {
                    throw new Error(`Potential SQLi detected in field: ${key}`);
                }
                if (xssPattern.test(obj[key])) {
                    throw new Error(`Potential XSS detected in field: ${key}`);
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                checkObject(obj[key]); // Recursively check nested JSON
            }
        }
    };

    try {
        if (req.body) checkObject(req.body);
        if (req.query) checkObject(req.query);
        next();
    } catch (error) {
        console.warn(`[SECURITY BLOCK] Malicious payload dropped from IP: ${req.ip}. Reason: ${error.message}`);
        return res.status(400).json({ error: 'Bad Request: Invalid characters detected in payload.' });
    }
};

module.exports = sanitizePayload;