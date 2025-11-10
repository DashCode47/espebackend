"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("./errorHandler");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errorHandler_1.AppError(401, 'No token provided');
        }
        // Ensure the token has Bearer prefix
        let token;
        if (authHeader.startsWith('Bearer ')) {
            // Already has Bearer prefix
            token = authHeader;
        }
        else {
            // Add Bearer prefix
            token = `Bearer ${authHeader}`;
        }
        // Extract the token part (after 'Bearer ')
        const tokenPart = token.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(tokenPart);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError(401, 'Invalid or expired token'));
    }
};
exports.authMiddleware = authMiddleware;
