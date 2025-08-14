const { pool } = require('../config/database');

class User {
    // Get all users
    static async getAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT id, name, email, age, role, active, email_verified, created_at, updated_at FROM users ORDER BY created_at DESC'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get user by ID
    static async getById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, name, email, age, role, active, email_verified, created_at, updated_at FROM users WHERE id = ?', 
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Create new user
    static async create(userData) {
        const { name, email, password, age, role = 'user' } = userData;
        try {
            // Hash password if provided
            let hashedPassword = null;
            if (password) {
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(12);
                hashedPassword = await bcrypt.hash(password, salt);
            }
            
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, age, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, age, role]
            );
            
            // Return user without password
            return { id: result.insertId, name, email, age, role };
        } catch (error) {
            throw error;
        }
    }

    // Update user
    static async update(id, userData) {
        const { name, email, age, role } = userData;
        try {
            const [result] = await pool.execute(
                'UPDATE users SET name = ?, email = ?, age = ?, role = ? WHERE id = ?',
                [name, email, age, role, id]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('User not found');
            }
            
            return await this.getById(id);
        } catch (error) {
            throw error;
        }
    }

    // Delete user
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                throw new Error('User not found');
            }
            
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    // Search users
    static async search(searchTerm) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, name, email, age, role, active, email_verified, created_at, updated_at FROM users WHERE name LIKE ? OR email LIKE ?',
                [`%${searchTerm}%`, `%${searchTerm}%`]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;