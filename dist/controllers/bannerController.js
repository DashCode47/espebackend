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
exports.bannerController = void 0;
const prisma_1 = require("../utils/prisma");
exports.bannerController = {
    // Create a new banner
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, description, imageUrl } = req.body;
                console.log(req.body);
                const banner = yield prisma_1.prisma.banner.create({
                    data: {
                        title,
                        description,
                        imageUrl,
                    },
                });
                return res.status(201).json(banner);
            }
            catch (error) {
                return res.status(500).json({ error: 'Error creating banner' });
            }
        });
    },
    // Get all banners
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const banners = yield prisma_1.prisma.banner.findMany({
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return res.json(banners);
            }
            catch (error) {
                return res.status(500).json({ error: 'Error fetching banners' });
            }
        });
    },
    // Get a single banner by ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const banner = yield prisma_1.prisma.banner.findUnique({
                    where: { id },
                });
                if (!banner) {
                    return res.status(404).json({ error: 'Banner not found' });
                }
                return res.json(banner);
            }
            catch (error) {
                return res.status(500).json({ error: 'Error fetching banner' });
            }
        });
    },
    // Update a banner
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { title, description, imageUrl, isActive } = req.body;
                const banner = yield prisma_1.prisma.banner.update({
                    where: { id },
                    data: {
                        title,
                        description,
                        imageUrl,
                        isActive,
                    },
                });
                return res.json(banner);
            }
            catch (error) {
                return res.status(500).json({ error: 'Error updating banner' });
            }
        });
    },
    // Delete a banner
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield prisma_1.prisma.banner.delete({
                    where: { id },
                });
                return res.status(204).send();
            }
            catch (error) {
                return res.status(500).json({ error: 'Error deleting banner' });
            }
        });
    },
};
