const Auth = require('../models/auth');

class AuthController {
    // Register new user
    static async register(req, res, next) {
        try {
            const { name, email, password, age, role } = req.body;
            
            // Basic validation
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required'
                });
            }
            
            // Password strength validation
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }
            
            const user = await Auth.register({ name, email, password, age, role });
            
            // Generate tokens
            const accessToken = Auth.generateToken(user.id);
            const refreshToken = await Auth.generateRefreshToken(user.id);
            
            // Set HTTP-only cookie for refresh token
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                // data: {
                //     user,
                //     accessToken
                // }
            });
        } catch (error) {
            if (error.message === 'User already exists with this email') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
    
    // Login user
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            
            // Basic validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            
            const user = await Auth.login(email, password);
            
            // Generate tokens
            const accessToken = Auth.generateToken(user.id);
            const refreshToken = await Auth.generateRefreshToken(user.id);
            
            // Set HTTP-only cookie for refresh token
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user,
                    accessToken,refreshToken
                }
            });
        } catch (error) {
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
    
    // Get current user profile
    static async getProfile(req, res, next) {
        try {
            res.json({
                success: true,
                data: req.user
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Update current user profile
    static async updateProfile(req, res, next) {
        try {
            const { name, email, age } = req.body;
            const userId = req.user.id;
            
            // Basic validation
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required'
                });
            }
            
            const User = require('../models/User');
            const updatedUser = await User.update(userId, { name, email, age, role: req.user.role });
            
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Change password
    static async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;
            
            // Basic validation
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }
            
            await Auth.updatePassword(userId, currentPassword, newPassword);
            
            res.json({
                success: true,
                message: 'Password changed successfully. Please login again.'
            });
        } catch (error) {
            if (error.message === 'Current password is incorrect') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
    
    // Refresh access token
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token not provided'
                });
            }
            
            const userId = await Auth.verifyRefreshToken(refreshToken);
            const user = await Auth.getUserById(userId);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Generate new access token
            const accessToken = Auth.generateToken(userId);
            
            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    user,
                    accessToken
                }
            });
        } catch (error) {
            if (error.message === 'Invalid refresh token') {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
    
    // Logout user
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            
            if (refreshToken) {
                await Auth.revokeRefreshToken(refreshToken);
            }
            
            res.clearCookie('refreshToken');
            
            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;