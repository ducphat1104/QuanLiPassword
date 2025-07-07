require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passwordRoutes = require('./src/routes/passwordRoutes');
const authRoutes = require('./src/routes/auth');
const secondaryPasswordRoutes = require('./routes/secondaryPassword');

// Import security middleware
const {
  generalLimiter,
  authLimiter,
  passwordLimiter,
  speedLimiter,
  corsOptions,
  helmetConfig,
  customSecurityHeaders,
  requestSizeLimiter
} = require('./src/middleware/security');

// Import logging middleware
const {
  enhancedRequestLogger,
  errorLogger
} = require('./src/middleware/requestLogger');

// Import health check routes
const healthRoutes = require('./src/routes/health');

// Import logger
const logger = require('./src/utils/logger');

const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('MongoDB Connected successfully', {
      database: process.env.MONGO_URI?.split('@')[1]?.split('/')[0] || 'unknown'
    });
  } catch (err) {
    logger.error('MongoDB Connection failed', {
      error: err.message,
      stack: err.stack
    });
    // Exit process with failure
    process.exit(1);
  }
};

// Database event listeners
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

connectDB();

// --- Security Middleware (order matters!) ---
app.use(helmetConfig); // Security headers
app.use(customSecurityHeaders); // Additional security headers
app.use(cors(corsOptions)); // CORS with strict configuration
app.use(speedLimiter); // Slow down repeated requests
app.use(generalLimiter); // General rate limiting
app.use(requestSizeLimiter('10mb')); // Limit request size

// --- Body Parsing Middleware ---
app.use(express.json({ limit: '10mb' })); // Body parser for JSON format
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL encoded data

// --- Request Logging ---
app.use(enhancedRequestLogger);

// --- Health Check Routes (no rate limiting) ---
app.use('/', healthRoutes);

// --- API Routes with Rate Limiting ---
app.get('/api', (req, res) => {
  res.json({
    message: 'Password Vault API is running!',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Auth routes with strict rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth/secondary-password', authLimiter, secondaryPasswordRoutes);

// Password routes with moderate rate limiting
app.use('/api/passwords', passwordLimiter, passwordRoutes);

// --- Error Handling Middleware (must be last) ---
app.use(errorLogger);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    }
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully`);

  server.close(() => {
    logger.info('HTTP server closed');

    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
