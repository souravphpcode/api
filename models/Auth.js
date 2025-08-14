const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Auth {
    // Register new user
    static async register(userData) {
        const { name, email, password, age = null, role = 'user' } = userData;
        
        try {
            // Check if user already exists
            const [existingUsers] = await pool.execute(
                'SELECT id FROM users WHERE email = ?', 
                [email]
            );
            
            if (existingUsers.length > 0) {
                throw new Error('User already exists with this email');
            }
            
            // Hash password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Create user
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, age, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, age, role]
            );
            
            // Get the created user (without password)
            const [users] = await pool.execute(
                'SELECT id, name, email, age, role, active, email_verified, created_at FROM users WHERE id = ?',
                [result.insertId]
            );
            
            return users[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Login user
    static async login(email, password) {
        try {
            // Get user with password
            const [users] = await pool.execute(
                'SELECT * FROM users WHERE email = ? AND active = TRUE',
                [email]
            );
            
            if (users.length === 0) {
                throw new Error('Invalid credentials');
            }
            
            const user = users[0];
            
            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            
            // Remove password from user object
            delete user.password;
            delete user.reset_password_token;
            delete user.reset_password_expire;
            
            return user;
        } catch (error) {
            throw error;
        }
    }
    
    // Generate JWT token
    static generateToken(userId) {
        return jwt.sign(
            { id: userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    }
    
    // Generate refresh token
    static async generateRefreshToken(userId) {
        try {
            // Clean up old refresh tokens for this user
            await pool.execute(
                'DELETE FROM refresh_tokens WHERE user_id = ? OR expires_at < NOW()',
                [userId]
            );
            
            // Generate new refresh token
            const refreshToken = jwt.sign(
                { id: userId, type: 'refresh' },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            
            // Store refresh token in database
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            
            await pool.execute(
                'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
                [refreshToken, userId, expiresAt]
            );
            
            return refreshToken;
        } catch (error) {
            throw error;
        }
    }
    
    // Verify refresh token
    static async verifyRefreshToken(token) {
        try {
            // Check if token exists in database
            const [tokens] = await pool.execute(
                'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
                [token]
            );
            
            if (tokens.length === 0) {
                throw new Error('Invalid refresh token');
            }
            
            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            return decoded.id;
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    
    // Revoke refresh token
    static async revokeRefreshToken(token) {
        try {
            await pool.execute(
                'DELETE FROM refresh_tokens WHERE token = ?',
                [token]
            );
        } catch (error) {
            throw error;
        }
    }
    
    // Get user by ID (for authentication middleware)
    static async getUserById(id) {
        try {
            const [users] = await pool.execute(
                'SELECT id, name, email, age, role, active, email_verified, created_at FROM users WHERE id = ? AND active = TRUE',
                [id]
            );
            
            return users[0] || null;
        } catch (error) {
            throw error;
        }
    }
    
    // Update password
    static async updatePassword(userId, currentPassword, newPassword) {
        try {
            // Get current password hash
            const [users] = await pool.execute(
                'SELECT password FROM users WHERE id = ?',
                [userId]
            );
            
            if (users.length === 0) {
                throw new Error('User not found');
            }
            
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            
            // Hash new password
            const salt = await bcrypt.genSalt(12);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            
            // Update password
            await pool.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedNewPassword, userId]
            );
            
            // Revoke all refresh tokens for this user
            await pool.execute(
                'DELETE FROM refresh_tokens WHERE user_id = ?',
                [userId]
            );
            
            return { message: 'Password updated successfully' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Auth;