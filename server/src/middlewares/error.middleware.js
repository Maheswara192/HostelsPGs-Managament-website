const { NODE_ENV } = require('../config/env');

/**
 * API Error Class
 * Extends standard Error to include statusCode
 */
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Central Error Handling Middleware
 * Standardizes all API responses to { success: false, message: ... }
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log to console for dev
    console.error('💥 ERROR:', err.name, err.message);
    if (err.stack) console.error(err.stack);

    // Mongoose Bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        error = new ApiError(404, message);
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ApiError(400, message);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ApiError(400, message);
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token. Please log in again.');
    }
    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Your token has expired! Please log in again.');
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message || 'Server Error',
        stack: NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = { errorHandler, ApiError };
