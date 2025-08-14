const User = require('../models/User');

class UserController {
    // Get all users
    static async getAllUsers(req, res, next) {
        try {
            const users = await User.getAll();
            res.json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single user (Admin or own profile)
    static async getUser(req, res, next) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;
            
            // Allow access if admin or user accessing their own profile
            if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only view your own profile.'
                });
            }
            
            const user = await User.getById(id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    // Create user
    static async createUser(req, res, next) {
        try {
            const { name, email, password, age, role } = req.body;
            
            // Basic validation
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required'
                });
            }
            
            const user = await User.create({ name, email, password, age, role });
            
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
            next(error);
        }
    }

    // Update user
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, age, role } = req.body;
            
            const user = await User.update(id, { name, email, age, role });
            
            res.json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            next(error);
        }
    }

    // Delete user
    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            await User.delete(id);
            
            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            next(error);
        }
    }

    // Search users
    static async searchUsers(req, res, next) {
        try {
            const { q } = req.query;
            
            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }
            
            const users = await User.search(q);
            
            res.json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;