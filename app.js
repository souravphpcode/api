const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:7044',
    credentials: true
}));

// Cookie parser
app.use(cookieParser());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection();

// Swagger Documentation
app.use('/api', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Node.js MySQL API Documentation"
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Node.js MySQL API with JWT Authentication',
        documentation: '/api',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            health: '/health'
        },
        authEndpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile',
            logout: 'POST /api/auth/logout'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        availableRoutes: {
            documentation: '/api',
            auth: '/api/auth',
            users: '/api/users',
            health: '/health'
        }
    });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;