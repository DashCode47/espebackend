"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }
    // Log full error details
    console.error('=== ERROR DETAILS ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    if (err.code) {
        console.error('Error code:', err.code);
    }
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    console.error('====================');
    // In development or Vercel preview, show more error details
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';
    return res.status(500).json(Object.assign({ status: 'error', message: 'Internal server error' }, (isDevelopment && Object.assign(Object.assign({ error: err.message, errorName: err.name }, (err.code && { code: err.code })), { stack: err.stack }))));
};
exports.errorHandler = errorHandler;
