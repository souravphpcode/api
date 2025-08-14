const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    // Default error
    let error = { ...err };
    error.message = err.message;

    // MySQL errors
    if (err.code === 'ER_NO_SUCH_TABLE') {
        error.message = 'Database table not found';
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

    if (err.code === 'ECONNREFUSED') {
        error.message = 'Database connection refused';
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

    // Default server error
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
};

module.exports = errorHandler;