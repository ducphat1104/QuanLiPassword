const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const cors = require('cors');
const logger = require('../utils/logger');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: message,
            retryAfter: Math.ceil(windowMs / 1000)
        },
        skipSuccessfulRequests,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            const ip = req.ip || req.connection.remoteAddress;
            logger.security.suspiciousActivity(
                req.user?.id || null,
                'rate_limit_exceeded',
                ip,
                { endpoint: req.originalUrl, method: req.method }
            );
            
            res.status(429).json({
                error: message,
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

// General rate limiting
const generalLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for auth endpoints
const authLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // limit each IP to 5 requests per windowMs
    'Too many authentication attempts, please try again later.',
    true // skip successful requests
);

// Very strict rate limiting for password operations
const passwordLimiter = createRateLimit(
    1 * 60 * 1000, // 1 minute
    20, // limit each IP to 20 requests per minute
    'Too many password operations, please slow down.'
);

// Slow down middleware for repeated requests
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per windowMs without delay
    delayMs: 500, // add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // maximum delay of 20 seconds
    skipSuccessfulRequests: true
});

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            process.env.FRONTEND_URL,
            process.env.PRODUCTION_URL
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.security.suspiciousActivity(
                null,
                'cors_violation',
                origin,
                { origin, allowedOrigins }
            );
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'x-auth-token'
    ],
    exposedHeaders: ['x-auth-token'],
    maxAge: 86400 // 24 hours
};

// Helmet configuration for security headers
const helmetConfig = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"]
        }
    },
    
    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    
    // X-Frame-Options
    frameguard: {
        action: 'deny'
    },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // X-XSS-Protection
    xssFilter: true,
    
    // Referrer Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
    
    // Permissions Policy
    permissionsPolicy: {
        features: {
            camera: [],
            microphone: [],
            geolocation: [],
            payment: [],
            usb: [],
            magnetometer: [],
            gyroscope: [],
            accelerometer: []
        }
    }
});

// Custom security headers middleware
const customSecurityHeaders = (req, res, next) => {
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    next();
};

// IP whitelist middleware (for admin endpoints)
const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress;
        
        if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
            next();
        } else {
            logger.security.suspiciousActivity(
                req.user?.id || null,
                'ip_not_whitelisted',
                clientIP,
                { endpoint: req.originalUrl, allowedIPs }
            );
            
            res.status(403).json({
                error: 'Access denied from this IP address'
            });
        }
    };
};

// Request size limiter
const requestSizeLimiter = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('content-length'));
        const maxSizeBytes = parseInt(maxSize) * 1024 * 1024; // Convert MB to bytes
        
        if (contentLength > maxSizeBytes) {
            logger.security.suspiciousActivity(
                req.user?.id || null,
                'request_too_large',
                req.ip,
                { contentLength, maxSize, endpoint: req.originalUrl }
            );
            
            return res.status(413).json({
                error: 'Request entity too large'
            });
        }
        
        next();
    };
};

module.exports = {
    generalLimiter,
    authLimiter,
    passwordLimiter,
    speedLimiter,
    corsOptions,
    helmetConfig,
    customSecurityHeaders,
    ipWhitelist,
    requestSizeLimiter
};
