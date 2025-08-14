// Validation middleware for different data types
const validateUser = (req, res, next) => {
    const { name, email, age } = req.body;
    const errors = [];
    
    if (!name || name.trim().length === 0) {
        errors.push('Name is required');
    }
    
    if (!email || !email.includes('@')) {
        errors.push('Valid email is required');
    }
    
    if (age && (age < 0 || age > 150)) {
        errors.push('Age must be between 0 and 150');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

const validatePassword = (req, res, next) => {
    const { password } = req.body;
    const errors = [];
    
    if (!password) {
        errors.push('Password is required');
    } else {
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Password validation failed',
            errors
        });
    }
    
    next();
};

const validateEmail = (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }
    
    next();
};

module.exports = {
    validateUser,
    validatePassword,
    validateEmail
};
// # Node.js and MySQL Tutorial

// ## Table of Contents
// 1. [Prerequisites](#prerequisites)
// 2. [Setting Up the Environment](#setting-up-the-environment)
// 3. [Installing Dependencies](#installing-dependencies)
// 4. [Database Setup](#database-setup)
// 5. [Connecting to MySQL](#connecting-to-mysql)
// 6. [Basic CRUD Operations](#basic-crud-operations)
// 7. [Building a Complete API](#building-a-complete-api)
// 8. [Error Handling](#error-handling)
// 9. [Best Practices](#best-practices)

// ## Prerequisites

// Before starting, make sure you have:
// - Node.js installed (version 14 or higher)
// - MySQL server installed and running
// - Basic knowledge of JavaScript
// - Understanding of SQL basics

// ## Setting Up the Environment

// ### 1. Create a New Project

// ```bash
// mkdir nodejs-mysql-tutorial
// cd nodejs-mysql-tutorial
// npm init -y