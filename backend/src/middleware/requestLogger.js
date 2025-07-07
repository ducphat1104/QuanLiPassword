const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom token for response time
morgan.token('response-time-ms', (req, res) => {
    if (!req._startTime) return '-';
    const diff = process.hrtime(req._startTime);
    return (diff[0] * 1000 + diff[1] * 1e-6).toFixed(2);
});

// Custom token for user ID
morgan.token('user-id', (req) => {
    return req.user?.id || 'anonymous';
});

// Custom token for real IP (considering proxies)
morgan.token('real-ip', (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           'unknown';
});

// Custom format for detailed logging
const detailedFormat = ':real-ip - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms ms';

// Create morgan middleware with custom stream
const requestLogger = morgan(detailedFormat, {
    stream: {
        write: (message) => {
            // Parse the log message to extract useful information
            const logData = message.trim();
            
            // Extract status code to determine log level
            const statusMatch = logData.match(/HTTP\/[\d.]+"\s(\d{3})/);
            const statusCode = statusMatch ? parseInt(statusMatch[1]) : 0;
            
            // Log at appropriate level based on status code
            if (statusCode >= 500) {
                logger.error('HTTP Request', { message: logData });
            } else if (statusCode >= 400) {
                logger.warn('HTTP Request', { message: logData });
            } else {
                logger.info('HTTP Request', { message: logData });
            }
        }
    },
    // Skip logging for health check endpoints
    skip: (req) => {
        return req.url === '/health' || req.url === '/ping';
    }
});

// Enhanced request logger middleware
const enhancedRequestLogger = (req, res, next) => {
    // Record start time
    req._startTime = process.hrtime();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to log response
    res.end = function(chunk, encoding) {
        // Calculate response time
        const diff = process.hrtime(req._startTime);
        const responseTime = (diff[0] * 1000 + diff[1] * 1e-6).toFixed(2);
        
        // Log the request using our custom logger
        logger.request(req, res, responseTime);
        
        // Call original end function
        originalEnd.call(this, chunk, encoding);
    };
    
    next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
    // Log the error with context
    logger.error('Request Error', {
        error: {
            message: err.message,
            stack: err.stack,
            name: err.name
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            body: req.method !== 'GET' ? req.body : undefined,
            params: req.params,
            query: req.query
        },
        timestamp: new Date().toISOString()
    });
    
    next(err);
};

// Security event logger middleware
const securityLogger = {
    // Log authentication attempts
    loginAttempt: (req, res, next) => {
        const originalSend = res.send;
        res.send = function(data) {
            const success = res.statusCode === 200;
            const ip = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');
            
            if (success && data && typeof data === 'object' && data.token) {
                // Successful login - we'll log this in the auth controller
            } else {
                // Failed login
                logger.security.login(null, ip, userAgent, false);
            }
            
            originalSend.call(this, data);
        };
        next();
    },
    
    // Log password access
    passwordAccess: (req, res, next) => {
        const originalSend = res.send;
        res.send = function(data) {
            if (res.statusCode === 200 && req.user) {
                const ip = req.ip || req.connection.remoteAddress;
                logger.security.passwordAccess(req.user.id, req.params.id, ip);
            }
            originalSend.call(this, data);
        };
        next();
    }
};

module.exports = {
    requestLogger,
    enhancedRequestLogger,
    errorLogger,
    securityLogger
};
