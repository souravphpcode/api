
const jwt = require('jsonwebtoken');
const Auth = require('../models/Auth');

// Protect routes - require authentication
const protect = async (req, res, next) => {
    try {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // Make sure token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await Auth.getUserById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user not found'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token expired'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        
        next();
    };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await Auth.getUserById(decoded.id);
                
                if (user) {
                    req.user = user;
                }
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

module.exports = {
    protect,
    authorize,
    optionalAuth
};