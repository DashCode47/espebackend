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
exports.getPromotionsByCategory = exports.deletePromotion = exports.updatePromotion = exports.getPromotion = exports.getPromotions = exports.createPromotion = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middlewares/errorHandler");
const prisma = new client_1.PrismaClient();
// Define PromotionCategory enum to match Prisma schema
var PromotionCategory;
(function (PromotionCategory) {
    PromotionCategory["FOOD"] = "FOOD";
    PromotionCategory["DRINKS"] = "DRINKS";
    PromotionCategory["EVENTS"] = "EVENTS";
    PromotionCategory["PARTIES"] = "PARTIES";
    PromotionCategory["OTHER"] = "OTHER";
})(PromotionCategory || (PromotionCategory = {}));
// Create a new promotion
const createPromotion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, imageUrl, category, discount, validUntil, location, isActive = true, } = req.body;
        // Validate required fields
        if (!title || !description || !category || !validUntil) {
            throw new errorHandler_1.AppError(400, "Title, description, category, and validUntil are required");
        }
        // Validate validUntil date
        const validUntilDate = new Date(validUntil);
        if (isNaN(validUntilDate.getTime())) {
            throw new errorHandler_1.AppError(400, "Invalid validUntil date format");
        }
        // Validate discount if provided
        if (discount !== undefined && (discount < 0 || discount > 100)) {
            throw new errorHandler_1.AppError(400, "Discount must be between 0 and 100");
        }
        const promotion = yield prisma.promotion.create({
            data: {
                title,
                description,
                imageUrl,
                startDate: new Date(), // Start from now
                endDate: validUntilDate, // End at validUntil
                location: location || "Frente a la ESPE", // You might want to make this configurable
                category,
                isActive,
            },
        });
        res.status(201).json({
            status: "success",
            data: { promotion },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createPromotion = createPromotion;
// Get all promotions with filters
const getPromotions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, isActive, page = "1", limit = "10" } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (category) {
            where.category = category;
        }
        if (isActive !== undefined) {
            where.isActive = isActive === "true";
        }
        // Only show promotions that are currently active (within date range)
        const now = new Date();
        where.AND = [{ startDate: { lte: now } }, { endDate: { gte: now } }];
        const [promotions, total] = yield Promise.all([
            prisma.promotion.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.promotion.count({ where }),
        ]);
        res.json({
            status: "success",
            data: {
                promotions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPromotions = getPromotions;
// Get a single promotion
const getPromotion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promotionId } = req.params;
        const promotion = yield prisma.promotion.findUnique({
            where: { id: promotionId },
        });
        if (!promotion) {
            throw new errorHandler_1.AppError(404, "Promotion not found");
        }
        res.json({
            status: "success",
            data: { promotion },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPromotion = getPromotion;
// Update a promotion
const updatePromotion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promotionId } = req.params;
        const { title, description, imageUrl, category, discount, validUntil, isActive, location, } = req.body;
        // Check if promotion exists
        const existingPromotion = yield prisma.promotion.findUnique({
            where: { id: promotionId },
        });
        if (!existingPromotion) {
            throw new errorHandler_1.AppError(404, "Promotion not found");
        }
        // Validate dates if provided
        let start = existingPromotion.startDate;
        let end = existingPromotion.endDate;
        if (validUntil) {
            end = new Date(validUntil);
            if (isNaN(end.getTime())) {
                throw new errorHandler_1.AppError(400, "Invalid validUntil date format");
            }
        }
        if (start >= end) {
            throw new errorHandler_1.AppError(400, "End date must be after start date");
        }
        const updatedPromotion = yield prisma.promotion.update({
            where: { id: promotionId },
            data: {
                title,
                description,
                imageUrl,
                startDate: start,
                endDate: end,
                location: location || "Frente a la ESPE", // You might want to make this configurable
                category,
                isActive,
            },
        });
        res.json({
            status: "success",
            data: { promotion: updatedPromotion },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePromotion = updatePromotion;
// Delete a promotion
const deletePromotion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promotionId } = req.params;
        const promotion = yield prisma.promotion.findUnique({
            where: { id: promotionId },
        });
        if (!promotion) {
            throw new errorHandler_1.AppError(404, "Promotion not found");
        }
        yield prisma.promotion.delete({
            where: { id: promotionId },
        });
        res.json({
            status: "success",
            message: "Promotion deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deletePromotion = deletePromotion;
// Get promotions by category
const getPromotionsByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const { page = "1", limit = "10" } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Validate category
        if (!Object.values(PromotionCategory).includes(category)) {
            throw new errorHandler_1.AppError(400, "Invalid category");
        }
        const where = {
            category: category,
            isActive: true,
            AND: [
                { startDate: { lte: new Date() } },
                { endDate: { gte: new Date() } },
            ],
        };
        const [promotions, total] = yield Promise.all([
            prisma.promotion.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.promotion.count({ where }),
        ]);
        res.json({
            status: "success",
            data: {
                promotions,
                category,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPromotionsByCategory = getPromotionsByCategory;
