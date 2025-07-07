const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create daily rotate file transport for all logs
const allLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
});

// Create daily rotate file transport for error logs
const errorLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat
});

// Create daily rotate file transport for security logs
const securityLogsTransport = new DailyRotateFile({
    filename: path.join(logDir, 'security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '90d',
    format: logFormat
});

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'password-vault-api' },
    transports: [
        allLogsTransport,
        errorLogsTransport
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'exceptions.log'),
            format: logFormat
        })
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'rejections.log'),
            format: logFormat
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Security logger for sensitive operations
const securityLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'password-vault-security' },
    transports: [securityLogsTransport]
});

// Helper functions for different log types
const loggers = {
    // General application logs
    info: (message, meta = {}) => logger.info(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    error: (message, meta = {}) => logger.error(message, meta),
    debug: (message, meta = {}) => logger.debug(message, meta),

    // Security-specific logs
    security: {
        login: (userId, ip, userAgent, success = true) => {
            securityLogger.info('User login attempt', {
                event: 'login',
                userId,
                ip,
                userAgent,
                success,
                timestamp: new Date().toISOString()
            });
        },
        logout: (userId, ip) => {
            securityLogger.info('User logout', {
                event: 'logout',
                userId,
                ip,
                timestamp: new Date().toISOString()
            });
        },
        passwordAccess: (userId, passwordId, ip) => {
            securityLogger.info('Password accessed', {
                event: 'password_access',
                userId,
                passwordId,
                ip,
                timestamp: new Date().toISOString()
            });
        },
        passwordCreate: (userId, serviceName, ip) => {
            securityLogger.info('Password created', {
                event: 'password_create',
                userId,
                serviceName,
                ip,
                timestamp: new Date().toISOString()
            });
        },
        passwordUpdate: (userId, passwordId, ip) => {
            securityLogger.info('Password updated', {
                event: 'password_update',
                userId,
                passwordId,
                ip,
                timestamp: new Date().toISOString()
            });
        },
        passwordDelete: (userId, passwordId, ip) => {
            securityLogger.info('Password deleted', {
                event: 'password_delete',
                userId,
                passwordId,
                ip,
                timestamp: new Date().toISOString()
            });
        },
        suspiciousActivity: (userId, activity, ip, details = {}) => {
            securityLogger.warn('Suspicious activity detected', {
                event: 'suspicious_activity',
                userId,
                activity,
                ip,
                details,
                timestamp: new Date().toISOString()
            });
        }
    },

    // API request logs
    request: (req, res, responseTime) => {
        logger.info('API Request', {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = loggers;
