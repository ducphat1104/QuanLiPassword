const express = require('express');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json(healthCheck);
});

// Detailed health check with dependencies
router.get('/health/detailed', async (req, res) => {
    const startTime = Date.now();

    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {}
    };

    try {
        // Check database connection
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        healthCheck.services.database = {
            status: dbState === 1 ? 'healthy' : 'unhealthy',
            state: dbStatus[dbState],
            responseTime: null
        };

        if (dbState === 1) {
            // Test database with a simple query
            const dbStart = Date.now();
            await mongoose.connection.db.admin().ping();
            healthCheck.services.database.responseTime = `${Date.now() - dbStart}ms`;
        }

        // Check memory usage
        const memUsage = process.memoryUsage();
        healthCheck.system = {
            memory: {
                used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
                total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
                external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
            },
            cpu: {
                usage: process.cpuUsage()
            }
        };

        // Overall health status
        const allServicesHealthy = Object.values(healthCheck.services)
            .every(service => service.status === 'healthy');

        if (!allServicesHealthy) {
            healthCheck.status = 'DEGRADED';
        }

        healthCheck.responseTime = `${Date.now() - startTime}ms`;

        const statusCode = healthCheck.status === 'OK' ? 200 : 503;
        res.status(statusCode).json(healthCheck);

    } catch (error) {
        logger.error('Health check failed', { error: error.message });

        healthCheck.status = 'ERROR';
        healthCheck.error = error.message;
        healthCheck.responseTime = `${Date.now() - startTime}ms`;

        res.status(503).json(healthCheck);
    }
});

// Ultra-lightweight ping endpoint for cron monitoring
router.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Minimal alive endpoint (smallest possible)
router.get('/alive', (req, res) => {
    res.status(200).send('ok');
});

// Tiny status endpoint
router.get('/status', (req, res) => {
    res.status(200).json({ status: 'up' });
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
    try {
        // Check if database is ready
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not ready');
        }

        // Test database connection
        await mongoose.connection.db.admin().ping();

        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.warn('Readiness check failed', { error: error.message });
        res.status(503).json({
            status: 'not ready',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;
