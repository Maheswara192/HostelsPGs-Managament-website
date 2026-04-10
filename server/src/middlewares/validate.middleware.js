const logger = require('../utils/logger');
const { ApiError } = require('./error.middleware');

/**
 * Zod Validation Middleware
 * Validates request payload (body, query, params) against a given Zod schema.
 */
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err) {
        logger.warn(`[VALIDATION FAILED] ${req.method} ${req.originalUrl}`, { errors: err.errors });
        // Extract validation errors
        const errorMessages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ApiError(400, `Validation Error: ${errorMessages}`));
    }
};

module.exports = validate;
