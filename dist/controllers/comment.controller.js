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
exports.getPostComments = exports.createComment = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
// Create a comment on a post
const createComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { postId } = req.params;
        const { content } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        if (!(content === null || content === void 0 ? void 0 : content.trim())) {
            throw new errorHandler_1.AppError(400, 'Comment content is required');
        }
        // Check if post exists
        const post = yield prisma_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new errorHandler_1.AppError(404, 'Post not found');
        }
        // Create comment
        const comment = yield prisma_1.prisma.comment.create({
            data: {
                content,
                authorId: userId,
                postId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            }
        });
        res.status(201).json({
            status: 'success',
            data: { comment }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createComment = createComment;
// Get comments for a post
const getPostComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Check if post exists
        const post = yield prisma_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new errorHandler_1.AppError(404, 'Post not found');
        }
        // Get comments with pagination
        const [comments, total] = yield Promise.all([
            prisma_1.prisma.comment.findMany({
                where: { postId },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma_1.prisma.comment.count({
                where: { postId }
            })
        ]);
        res.json({
            status: 'success',
            data: {
                comments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPostComments = getPostComments;
