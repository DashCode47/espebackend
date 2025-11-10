"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const prisma_1 = require("../utils/prisma");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middlewares/errorHandler");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, career, gender, interests } = req.body;
        // Validate required fields
        if (!email || !password || !name || !career || !gender) {
            throw new errorHandler_1.AppError(400, 'All fields are required');
        }
        // Check if user already exists
        const existingUser = yield prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new errorHandler_1.AppError(400, 'User already exists');
        }
        // Hash password
        const hashedPassword = yield (0, hash_1.hashPassword)(password);
        // Create user
        const user = yield prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                career,
                gender,
                interests: interests || []
            }
        });
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email
        });
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    career: user.career,
                    gender: user.gender,
                    interests: user.interests
                },
                token
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            throw new errorHandler_1.AppError(400, 'Email and password are required');
        }
        // Find user
        const user = yield prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        // Verify password
        const isPasswordValid = yield (0, hash_1.comparePasswords)(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email
        });
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    career: user.career,
                    gender: user.gender,
                    interests: user.interests
                },
                token
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
