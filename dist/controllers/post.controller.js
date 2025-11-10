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
exports.deleteReaction = exports.reactToPost = exports.updatePost = exports.getPost = exports.getPosts = exports.createPost = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middlewares/errorHandler");
const notification_controller_1 = require("./notification.controller");
const prisma = new client_1.PrismaClient();
// Define PostType enum to match Prisma schema
var PostType;
(function (PostType) {
    PostType["CONFESSION"] = "CONFESSION";
    PostType["MARKETPLACE"] = "MARKETPLACE";
    PostType["LOST_AND_FOUND"] = "LOST_AND_FOUND";
})(PostType || (PostType = {}));
// Create a new post
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { type, content, title, imageUrl } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        if (!type || !content) {
            throw new errorHandler_1.AppError(400, 'Type and content are required');
        }
        // Validate title for MARKETPLACE and LOST_AND_FOUND
        if ((type === 'MARKETPLACE' || type === 'LOST_AND_FOUND') && !title) {
            throw new errorHandler_1.AppError(400, 'Title is required for marketplace and lost & found posts');
        }
        const post = yield prisma.post.create({
            data: {
                type,
                content,
                title,
                imageUrl,
                authorId: userId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        career: true,
                        avatarUrl: true
                    }
                }
            }
        });
        res.status(201).json({
            status: 'success',
            data: { post }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createPost = createPost;
// Get posts with filters
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, page = '1', limit = '10' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = type ? { type: type } : {};
        const [posts, total] = yield Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            career: true,
                            avatarUrl: true
                        }
                    },
                    reactions: {
                        select: {
                            id: true,
                            isLike: true,
                            userId: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.post.count({ where })
        ]);
        res.json({
            status: 'success',
            data: {
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPosts = getPosts;
// Get a single post
const getPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const post = yield prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        career: true,
                        avatarUrl: true
                    }
                },
                reactions: {
                    select: {
                        id: true,
                        isLike: true,
                        userId: true
                    }
                }
            }
        });
        if (!post) {
            throw new errorHandler_1.AppError(404, 'Post not found');
        }
        res.json({
            status: 'success',
            data: { post }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPost = getPost;
// Update a post
const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { postId } = req.params;
        const { content, title, imageUrl } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        // Check if post exists and belongs to user
        const existingPost = yield prisma.post.findUnique({
            where: { id: postId }
        });
        if (!existingPost) {
            throw new errorHandler_1.AppError(404, 'Post not found');
        }
        if (existingPost.authorId !== userId) {
            throw new errorHandler_1.AppError(403, 'Not authorized to update this post');
        }
        const updatedPost = yield prisma.post.update({
            where: { id: postId },
            data: {
                content,
                title,
                imageUrl
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        career: true,
                        avatarUrl: true
                    }
                }
            }
        });
        res.json({
            status: 'success',
            data: { post: updatedPost }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePost = updatePost;
// React to a post (like/dislike)
const reactToPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { postId } = req.params;
        const { reactionType } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        // Validate reaction type
        const validReactionTypes = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];
        if (!reactionType || !validReactionTypes.includes(reactionType)) {
            throw new errorHandler_1.AppError(400, 'Invalid reaction type. Must be one of: like, love, laugh, wow, sad, angry');
        }
        // Check if post exists
        const post = yield prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        if (!post) {
            throw new errorHandler_1.AppError(404, 'Post not found');
        }
        // Check if reaction already exists
        const existingReaction = yield prisma.postReaction.findFirst({
            where: {
                postId,
                userId
            }
        });
        // Convert reaction type to boolean (like = true, others = false for now)
        // This maintains compatibility with the current schema
        const isLike = reactionType === 'like';
        let reaction;
        if (existingReaction) {
            // Update existing reaction
            reaction = yield prisma.postReaction.update({
                where: { id: existingReaction.id },
                data: { isLike }
            });
            // Only notify if changing from dislike to like
            if (!existingReaction.isLike && isLike) {
                yield (0, notification_controller_1.createNotification)(post.authorId, `A alguien le gustó tu publicación: "${post.title || post.content.substring(0, 30)}..."`);
            }
        }
        else {
            // Create new reaction
            reaction = yield prisma.postReaction.create({
                data: {
                    postId,
                    userId,
                    isLike
                }
            });
            // Notify only for likes
            if (isLike) {
                yield (0, notification_controller_1.createNotification)(post.authorId, `A alguien le gustó tu publicación: "${post.title || post.content.substring(0, 30)}..."`);
            }
        }
        res.json({
            status: 'success',
            message: 'Reaction registered successfully',
            data: { reaction }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.reactToPost = reactToPost;
// Delete reaction from a post
const deleteReaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { postId } = req.params;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        // Check if post exists
        const post = yield prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new errorHandler_1.AppError(404, 'Post not found');
        }
        // Check if reaction exists
        const existingReaction = yield prisma.postReaction.findFirst({
            where: {
                postId,
                userId
            }
        });
        if (!existingReaction) {
            throw new errorHandler_1.AppError(404, 'Reaction not found');
        }
        // Delete the reaction
        yield prisma.postReaction.delete({
            where: { id: existingReaction.id }
        });
        res.json({
            status: 'success',
            message: 'Reaction deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteReaction = deleteReaction;
