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
exports.checkMatch = exports.getMatches = exports.likeUser = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
const notification_controller_1 = require("./notification.controller");
// Like a user (create potential match)
const likeUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { targetUserId } = req.params;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        // Validate target user exists
        const targetUser = yield prisma_1.prisma.user.findUnique({
            where: { id: targetUserId }
        });
        if (!targetUser) {
            throw new errorHandler_1.AppError(404, 'Target user not found');
        }
        // Create user interaction record
        yield prisma_1.prisma.userInteraction.create({
            data: {
                user1Id: userId,
                user2Id: targetUserId,
                type: 'LIKE'
            }
        });
        // Check if there's a mutual match
        const mutualMatch = yield prisma_1.prisma.userInteraction.findFirst({
            where: {
                user1Id: targetUserId,
                user2Id: userId,
                type: 'LIKE'
            }
        });
        let match = null;
        // If there's a mutual like, create a match
        if (mutualMatch) {
            match = yield prisma_1.prisma.connection.create({
                data: {
                    user1Id: userId,
                    user2Id: targetUserId
                },
                include: {
                    user1: {
                        select: {
                            id: true,
                            name: true,
                            career: true,
                            avatarUrl: true
                        }
                    },
                    user2: {
                        select: {
                            id: true,
                            name: true,
                            career: true,
                            avatarUrl: true
                        }
                    }
                }
            });
            // Create notifications for both users
            yield Promise.all([
                (0, notification_controller_1.createNotification)(userId, `¡Tienes un match con ${targetUser.name}! Ahora pueden chatear.`),
                (0, notification_controller_1.createNotification)(targetUserId, `¡Tienes un match con ${match.user1.name}! Ahora pueden chatear.`)
            ]);
        }
        else {
            // Just notify the target user that they received a like
            yield (0, notification_controller_1.createNotification)(targetUserId, `A alguien le gustó tu perfil 👀`);
        }
        res.json({
            status: 'success',
            data: {
                match,
                isMutualMatch: !!match
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.likeUser = likeUser;
// Get user's matches
const getMatches = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        // Get mutual matches (where both users have liked each other)
        const mutualMatches = yield prisma_1.prisma.connection.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        name: true,
                        career: true,
                        avatarUrl: true,
                        interests: true
                    }
                },
                user2: {
                    select: {
                        id: true,
                        name: true,
                        career: true,
                        avatarUrl: true,
                        interests: true
                    }
                }
            }
        });
        // Transform matches to always show the other user's info
        const formattedMatches = mutualMatches.map((match) => {
            const otherUser = match.user1Id === userId ? match.user2 : match.user1;
            return {
                matchId: match.id,
                matchedAt: match.createdAt,
                user: otherUser
            };
        });
        res.json({
            status: 'success',
            data: { matches: formattedMatches }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMatches = getMatches;
// Check if there's a mutual match with a specific user
const checkMatch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { targetUserId } = req.params;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const match = yield prisma_1.prisma.connection.findFirst({
            where: {
                OR: [
                    { user1Id: userId, user2Id: targetUserId },
                    { user1Id: targetUserId, user2Id: userId }
                ]
            }
        });
        res.json({
            status: 'success',
            data: { isMatch: !!match }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.checkMatch = checkMatch;
