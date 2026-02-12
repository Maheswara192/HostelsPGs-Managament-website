const express = require('express');
const cors = require('cors');
const { NODE_ENV } = require('./config/env');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Routes Import
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const ownerRoutes = require('./routes/owner.routes');
const tenantRoutes = require('./routes/tenant.routes');
const { initCronJobs } = require('./services/cron.service');

// Initialize Cron Jobs
// Initialize Cron Jobs
if (process.env.NODE_ENV !== 'test') {
    initCronJobs();
    // Database connection is handled in server.js
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handle URL-encoded data

// CORS Configuration for Custom Domain
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and authentication headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Middleware (Skip in Test to avoid supertest mock conflicts)
if (process.env.NODE_ENV !== 'test') {
    app.use(helmet());

    // Wrap mongoSanitize to prevent "Cannot set property query" error on some envs
    // Wrap mongoSanitize to prevent "Cannot set property query" error on some envs
    // app.use((req, res, next) => {
    //     try {
    //         mongoSanitize()(req, res, next);
    //     } catch (error) {
    //         console.warn("⚠️ MongoSanitize skipped due to error:", error.message);
    //         next();
    //     }
    // });

    // app.use(xss());
}

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);
const path = require('path');

// Join parent directory of server (root) + uploads
// If server is in /server, and uploads is in /server/uploads:
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const mongoose = require('mongoose');

// Basic Route
app.get('/', (req, res) => {
    res.send('Hostel Management SaaS API is running...');
});

// Health Check Endpoint (SRE)
app.get('/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    const health = {
        success: true,
        uptime: process.uptime(),
        timestamp: new Date(),
        services: {
            database: {
                status: dbStatus,
                host: mongoose.connection.host
            },
            server: {
                status: 'UP',
                memory: process.memoryUsage(),
                env: process.env.NODE_ENV
            }
        }
    };

    if (dbStatus !== 'CONNECTED') {
        res.status(503).json({ ...health, success: false });
    } else {
        res.json(health);
    }
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/mess', require('./routes/mess.routes'));
app.use('/api/security', require('./routes/security.routes'));
app.use('/api/housekeeping', require('./routes/housekeeping.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/visits', require('./routes/visit.routes'));
app.use('/api/tenant', tenantRoutes);

// Error Handler
const { errorHandler } = require('./middlewares/error.middleware');
app.use(errorHandler);

module.exports = app;
