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
exports.setUserVisibility = exports.getPotentialConnections = exports.getAllInterests = exports.updateProfile = exports.getVisibleUsers = exports.getAllUsers = exports.getProfile = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middlewares/errorHandler");
const prisma = new client_1.PrismaClient();
// Get current user profile
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                career: true,
                gender: true,
                bio: true,
                avatarUrl: true,
                interests: true,
                createdAt: true
            }
        });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        res.json({
            status: 'success',
            data: { user }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                career: true,
                gender: true,
                bio: true,
                avatarUrl: true,
                interests: true,
                createdAt: true
            }
        });
        res.json({
            status: 'success',
            data: { users }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsers = getAllUsers;
// Obtener todos los usuarios visibles
const getVisibleUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            where: { isVisible: true },
            select: {
                id: true,
                name: true,
                career: true,
                avatarUrl: true,
                interests: true,
                isVisible: true
            }
        });
        res.json({
            status: 'success',
            data: users
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getVisibleUsers = getVisibleUsers;
// Update user profile
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { name, career, gender, bio, avatarUrl, interests } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: {
                name,
                career,
                gender,
                bio,
                avatarUrl,
                interests,
            },
            select: {
                id: true,
                email: true,
                name: true,
                career: true,
                gender: true,
                bio: true,
                avatarUrl: true,
                interests: true,
                createdAt: true
            }
        });
        res.json({
            status: 'success',
            data: { user: updatedUser }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
// Get all unique interests for filter chips
const getAllInterests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener todos los intereses únicos de los usuarios
        const users = yield prisma.user.findMany({
            select: { interests: true }
        });
        // Flatten y filtrar duplicados
        const allInterests = Array.from(new Set(users.flatMap(u => u.interests || [])));
        res.json({
            status: 'success',
            data: allInterests
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllInterests = getAllInterests;
// Get potential connections (other users) con filtros
const getPotentialConnections = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { interest, faculty, search } = req.query;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        // Construir condiciones dinámicas de filtrado
        const andFilters = [
            { id: { not: userId } },
            { isVisible: true },
            {
                OR: [
                    {
                        connectionsInitiated: {
                            none: {
                                user2Id: userId
                            }
                        }
                    },
                    {
                        connectionsReceived: {
                            none: {
                                user1Id: userId
                            }
                        }
                    }
                ]
            },
            {
                NOT: {
                    OR: [
                        {
                            id: {
                                in: (yield prisma.userInteraction.findMany({
                                    where: { user1Id: userId },
                                    select: { user2Id: true }
                                })).map(ui => ui.user2Id)
                            }
                        },
                        {
                            id: {
                                in: (yield prisma.userInteraction.findMany({
                                    where: { user2Id: userId },
                                    select: { user1Id: true }
                                })).map(ui => ui.user1Id)
                            }
                        }
                    ]
                }
            }
        ];
        // Filtro por interés (puede ser string o array)
        if (interest) {
            const interestsArray = Array.isArray(interest) ? interest : [interest];
            andFilters.push({
                interests: {
                    hasSome: interestsArray
                }
            });
        }
        // Filtro por facultad/carrera
        if (faculty) {
            andFilters.push({
                career: {
                    contains: faculty,
                    mode: 'insensitive'
                }
            });
        }
        // Filtro por nombre
        if (search) {
            andFilters.push({
                name: {
                    contains: search,
                    mode: 'insensitive'
                }
            });
        }
        const users = yield prisma.user.findMany({
            where: {
                AND: andFilters
            },
            select: {
                id: true,
                name: true,
                career: true,
                avatarUrl: true,
                interests: true
            },
            take: 20 // Puedes ajustar el límite
        });
        res.json({
            status: 'success',
            data: users
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPotentialConnections = getPotentialConnections;
// Cambiar la visibilidad del usuario autenticado
const setUserVisibility = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { isVisible } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        if (typeof isVisible !== 'boolean') {
            throw new errorHandler_1.AppError(400, 'El campo isVisible debe ser booleano');
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { isVisible },
            select: {
                id: true,
                isVisible: true
            }
        });
        res.json({
            status: 'success',
            data: updatedUser
        });
    }
    catch (error) {
        next(error);
    }
});
exports.setUserVisibility = setUserVisibility;
