"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const errorHandler_1 = require("./errorHandler");
// Configure multer to store files in memory (as Buffer)
const storage = multer_1.default.memoryStorage();
// File filter to only allow images
const fileFilter = (req, file, cb) => {
    // Accept only image files
    // Handle cases where mimetype might be missing or undefined
    if (!file.mimetype || file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new errorHandler_1.AppError(400, 'Only image files are allowed'));
    }
};
// Configure multer
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Middleware for single image upload with error handling
const uploadSingle = (req, res, next) => {
    // Log request info for debugging
    console.log('=== MULTER MIDDLEWARE ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    exports.upload.single('image')(req, res, (err) => {
        var _a;
        if (err) {
            console.error('Multer error:', err);
            if (err instanceof multer_1.default.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new errorHandler_1.AppError(400, 'File size too large. Maximum size is 5MB'));
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return next(new errorHandler_1.AppError(400, `Unexpected file field. Expected field name: 'image'`));
                }
                return next(new errorHandler_1.AppError(400, `Upload error: ${err.message} (code: ${err.code})`));
            }
            return next(err);
        }
        // Log what multer received
        console.log('Multer processed:', {
            hasFile: !!req.file,
            fileInfo: req.file ? {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                hasBuffer: !!req.file.buffer,
                bufferLength: (_a = req.file.buffer) === null || _a === void 0 ? void 0 : _a.length
            } : null,
            body: req.body
        });
        console.log('========================');
        next();
    });
};
exports.uploadSingle = uploadSingle;
