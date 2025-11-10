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
exports.createNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
// Get user's notifications
const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const [notifications, total] = yield Promise.all([
            prisma_1.prisma.notification.findMany({
                where: { userId },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma_1.prisma.notification.count({
                where: { userId }
            })
        ]);
        const unreadCount = yield prisma_1.prisma.notification.count({
            where: {
                userId,
                read: false
            }
        });
        res.json({
            status: 'success',
            data: {
                notifications,
                unreadCount,
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
exports.getNotifications = getNotifications;
// Mark notification as read
const markAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { notificationId } = req.params;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const notification = yield prisma_1.prisma.notification.findUnique({
            where: { id: notificationId }
        });
        if (!notification) {
            throw new errorHandler_1.AppError(404, 'Notification not found');
        }
        if (notification.userId !== userId) {
            throw new errorHandler_1.AppError(403, 'Not authorized to update this notification');
        }
        const updatedNotification = yield prisma_1.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        res.json({
            status: 'success',
            data: { notification: updatedNotification }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.markAsRead = markAsRead;
// Mark all notifications as read
const markAllAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        yield prisma_1.prisma.notification.updateMany({
            where: {
                userId,
                read: false
            },
            data: { read: true }
        });
        res.json({
            status: 'success',
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.markAllAsRead = markAllAsRead;
// Helper function to create notifications (used by other controllers)
const createNotification = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.notification.create({
        data: {
            userId,
            message
        }
    });
});
exports.createNotification = createNotification;
