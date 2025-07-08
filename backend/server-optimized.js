require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passwordRoutes = require('./src/routes/passwordRoutes');
const authRoutes = require('./src/routes/auth');
const secondaryPasswordRoutes = require('./routes/secondaryPassword');

const app = express();

// Tin tưởng proxy để phát hiện IP và giới hạn tốc độ
app.set('trust proxy', 1);

// Middleware bảo mật cơ bản
const securityHeaders = (req, res, next) => {
    // Các header bảo mật
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Xóa thông tin server
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
};

// Giới hạn tốc độ đơn giản
const rateLimitMap = new Map();
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Dọn dẹp các entry cũ
        if (rateLimitMap.has(ip)) {
            const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
            rateLimitMap.set(ip, requests);
        } else {
            rateLimitMap.set(ip, []);
        }

        const requests = rateLimitMap.get(ip);

        if (requests.length >= maxRequests) {
            console.log(`⚠️ Rate limit exceeded cho IP: ${ip}, endpoint: ${req.originalUrl}, requests: ${requests.length}/${maxRequests}`);
            return res.status(429).json({
                error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
                retryAfter: Math.ceil(windowMs / 1000),
                currentRequests: requests.length,
                maxRequests: maxRequests
            });
        }

        requests.push(now);
        next();
    };
};

// Ghi log yêu cầu đơn giản
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;

    res.send = function (data) {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();
        const ip = req.ip || req.connection.remoteAddress;

        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${ip}`);

        originalSend.call(this, data);
    };

    next();
};

// Cấu hình CORS cho multiple environments
const corsOptions = {
    origin: function (origin, callback) {
        // Development origins
        const developmentOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3002',
            'http://127.0.0.1:3003'
        ];

        // Production origins từ environment variables (remove trailing slash)
        const productionOrigins = [
            process.env.FRONTEND_URL,
            process.env.CORS_ORIGIN
        ].filter(Boolean).map(url => url.replace(/\/$/, ''));

        // Combine all allowed origins
        const allowedOrigins = [
            ...developmentOrigins,
            ...productionOrigins
        ];

        console.log('🌐 CORS check - Origin:', origin, 'Allowed:', allowedOrigins);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Không được phép bởi CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth-token']
};

// Kết nối cơ sở dữ liệu với ghi log
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`[${new Date().toISOString()}] 🟢 Kết nối MongoDB thành công`);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] 🔴 Kết nối MongoDB thất bại:`, err.message);
        process.exit(1);
    }
};

// Lắng nghe sự kiện cơ sở dữ liệu
mongoose.connection.on('connected', () => {
    console.log(`[${new Date().toISOString()}] 🔗 Mongoose đã kết nối với MongoDB`);
});

mongoose.connection.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] ❌ Lỗi kết nối Mongoose:`, err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log(`[${new Date().toISOString()}] 🔌 Mongoose đã ngắt kết nối khỏi MongoDB`);
});

connectDB();

// Middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(rateLimit(100, 15 * 60 * 1000)); // 100 yêu cầu mỗi 15 phút
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Ultra-lightweight endpoints for cron monitoring (no duplicates)

// Minimal keep-alive endpoint (smallest possible response)
app.get('/alive', (req, res) => {
    res.status(200).send('ok');
});

// Tiny JSON response for monitoring
app.get('/status', (req, res) => {
    res.status(200).json({ status: 'up' });
});

app.get('/wake', (req, res) => {
    res.status(200).json({
        status: 'awake',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Các route API với giới hạn tốc độ cụ thể
app.get('/api', (req, res) => {
    res.json({
        message: 'API Kho Mật Khẩu đang chạy!',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Route xác thực với giới hạn tốc độ vừa phải (tăng từ 10 lên 50 cho development)
app.use('/api/auth', rateLimit(50, 15 * 60 * 1000), authRoutes);
app.use('/api/auth/secondary-password', rateLimit(50, 15 * 60 * 1000), secondaryPasswordRoutes);

// Route mật khẩu với giới hạn tốc độ vừa phải
app.use('/api/passwords', rateLimit(50, 15 * 60 * 1000), passwordRoutes);

// Xử lý 404
app.use('*', (req, res) => {
    console.log(`[${new Date().toISOString()}] 🔍 404 Không tìm thấy: ${req.method} ${req.originalUrl} - ${req.ip}`);
    res.status(404).json({
        error: 'Không tìm thấy endpoint',
        message: `Không thể ${req.method} ${req.originalUrl}`
    });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ❌ Lỗi:`, {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Lỗi máy chủ nội bộ'
            : err.message
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] 🚀 Server khởi động thành công trên port ${PORT}`);
    console.log(`[${new Date().toISOString()}] 🌍 Môi trường: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[${new Date().toISOString()}] 📦 Phiên bản Node.js: ${process.version}`);
});

// Tắt máy chủ một cách nhẹ nhàng
const gracefulShutdown = (signal) => {
    console.log(`[${new Date().toISOString()}] 📨 Nhận tín hiệu ${signal}, đang tắt máy chủ nhẹ nhàng`);

    server.close(() => {
        console.log(`[${new Date().toISOString()}] 🔒 HTTP server đã đóng`);

        mongoose.connection.close(false, () => {
            console.log(`[${new Date().toISOString()}] 🔌 Kết nối MongoDB đã đóng`);
            process.exit(0);
        });
    });

    // Buộc đóng sau 10 giây
    setTimeout(() => {
        console.error(`[${new Date().toISOString()}] ⏰ Không thể đóng kết nối kịp thời, buộc tắt máy chủ`);
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Xử lý các ngoại lệ không được bắt
process.on('uncaughtException', (err) => {
    console.error(`[${new Date().toISOString()}] 💥 Ngoại lệ không được bắt:`, err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${new Date().toISOString()}] 🚫 Promise bị từ chối không được xử lý tại:`, promise, 'lý do:', reason);
    process.exit(1);
});
