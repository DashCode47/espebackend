"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const TOKEN_EXPIRATION = '7d';
const generateToken = (payload) => {
    try {
        if (!JWT_SECRET || JWT_SECRET === 'default-secret-key') {
            console.warn('WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable for production.');
        }
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
    }
    catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Failed to generate token');
    }
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyToken = verifyToken;
