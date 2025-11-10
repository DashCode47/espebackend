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
exports.getCareersByModality = exports.getCareersByCampus = exports.deleteCareer = exports.updateCareer = exports.getCareerByCode = exports.getCareer = exports.getCareers = exports.createCareer = void 0;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
// Create a new career
const createCareer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, name, modality, duration, schedule, campus, cesResolution, directorName, directorEmail, accreditations, mission, vision, objectives, graduateProfile, professionalProfile, curriculumPdfUrl, curriculumDescription, subjects, isActive = true } = req.body;
        // Validate required fields
        if (!code || !name || !modality || !duration || !schedule || !campus ||
            !cesResolution || !directorName || !directorEmail || !mission ||
            !vision || !objectives || !graduateProfile || !professionalProfile ||
            !curriculumDescription || !subjects) {
            throw new errorHandler_1.AppError(400, 'All required fields must be provided');
        }
        // Validate duration
        if (duration <= 0 || duration > 20) {
            throw new errorHandler_1.AppError(400, 'Duration must be between 1 and 20 semesters');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(directorEmail)) {
            throw new errorHandler_1.AppError(400, 'Invalid director email format');
        }
        // Check if career code already exists
        const existingCareer = yield prisma_1.prisma.career.findUnique({
            where: { code }
        });
        if (existingCareer) {
            throw new errorHandler_1.AppError(400, 'Career code already exists');
        }
        const career = yield prisma_1.prisma.career.create({
            data: {
                code,
                name,
                modality,
                duration,
                schedule,
                campus,
                cesResolution,
                directorName,
                directorEmail,
                accreditations,
                mission,
                vision,
                objectives,
                graduateProfile,
                professionalProfile,
                curriculumPdfUrl,
                curriculumDescription,
                subjects,
                isActive
            }
        });
        res.status(201).json({
            status: 'success',
            data: { career }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createCareer = createCareer;
// Get all careers with filters
const getCareers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { modality, campus, schedule, isActive, page = '1', limit = '10' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (modality) {
            where.modality = modality;
        }
        if (campus) {
            where.campus = campus;
        }
        if (schedule) {
            where.schedule = schedule;
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        const [careers, total] = yield Promise.all([
            prisma_1.prisma.career.findMany({
                where,
                orderBy: {
                    name: 'asc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma_1.prisma.career.count({ where })
        ]);
        res.json({
            status: 'success',
            data: {
                careers,
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
exports.getCareers = getCareers;
// Get a single career by ID
const getCareer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { careerId } = req.params;
        const career = yield prisma_1.prisma.career.findUnique({
            where: { id: careerId }
        });
        if (!career) {
            throw new errorHandler_1.AppError(404, 'Career not found');
        }
        res.json({
            status: 'success',
            data: { career }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCareer = getCareer;
// Get a career by code
const getCareerByCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        const career = yield prisma_1.prisma.career.findUnique({
            where: { code: code.toUpperCase() }
        });
        if (!career) {
            throw new errorHandler_1.AppError(404, 'Career not found');
        }
        res.json({
            status: 'success',
            data: { career }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCareerByCode = getCareerByCode;
// Update a career
const updateCareer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { careerId } = req.params;
        const updateData = req.body;
        // Check if career exists
        const existingCareer = yield prisma_1.prisma.career.findUnique({
            where: { id: careerId }
        });
        if (!existingCareer) {
            throw new errorHandler_1.AppError(404, 'Career not found');
        }
        // Validate duration if provided
        if (updateData.duration !== undefined && (updateData.duration <= 0 || updateData.duration > 20)) {
            throw new errorHandler_1.AppError(400, 'Duration must be between 1 and 20 semesters');
        }
        // Validate email format if provided
        if (updateData.directorEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updateData.directorEmail)) {
                throw new errorHandler_1.AppError(400, 'Invalid director email format');
            }
        }
        // Check if new code already exists (if code is being updated)
        if (updateData.code && updateData.code !== existingCareer.code) {
            const codeExists = yield prisma_1.prisma.career.findUnique({
                where: { code: updateData.code }
            });
            if (codeExists) {
                throw new errorHandler_1.AppError(400, 'Career code already exists');
            }
        }
        const updatedCareer = yield prisma_1.prisma.career.update({
            where: { id: careerId },
            data: updateData
        });
        res.json({
            status: 'success',
            data: { career: updatedCareer }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateCareer = updateCareer;
// Delete a career
const deleteCareer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { careerId } = req.params;
        const career = yield prisma_1.prisma.career.findUnique({
            where: { id: careerId }
        });
        if (!career) {
            throw new errorHandler_1.AppError(404, 'Career not found');
        }
        yield prisma_1.prisma.career.delete({
            where: { id: careerId }
        });
        res.json({
            status: 'success',
            message: 'Career deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteCareer = deleteCareer;
// Get careers by campus
const getCareersByCampus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { campus } = req.params;
        const { page = '1', limit = '10' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            campus: campus,
            isActive: true
        };
        const [careers, total] = yield Promise.all([
            prisma_1.prisma.career.findMany({
                where,
                orderBy: {
                    name: 'asc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma_1.prisma.career.count({ where })
        ]);
        res.json({
            status: 'success',
            data: {
                careers,
                campus,
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
exports.getCareersByCampus = getCareersByCampus;
// Get careers by modality
const getCareersByModality = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { modality } = req.params;
        const { page = '1', limit = '10' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            modality: modality,
            isActive: true
        };
        const [careers, total] = yield Promise.all([
            prisma_1.prisma.career.findMany({
                where,
                orderBy: {
                    name: 'asc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma_1.prisma.career.count({ where })
        ]);
        res.json({
            status: 'success',
            data: {
                careers,
                modality,
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
exports.getCareersByModality = getCareersByModality;
