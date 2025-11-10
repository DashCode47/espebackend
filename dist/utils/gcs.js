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
exports.generateFileName = exports.deleteFromGCS = exports.uploadToGCS = void 0;
const storage_1 = require("@google-cloud/storage");
const errorHandler_1 = require("../middlewares/errorHandler");
// Initialize Google Cloud Storage
const storage = new storage_1.Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILENAME, // Path to service account key file
    // Or use credentials from environment variable
    credentials: process.env.GCS_CREDENTIALS ? JSON.parse(process.env.GCS_CREDENTIALS) : undefined,
});
const bucketName = process.env.GCS_BUCKET_NAME || 'especonnect-images';
/**
 * Upload a file to Google Cloud Storage
 * @param file - The file buffer or stream
 * @param fileName - The name for the file in the bucket
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
const uploadToGCS = (file, fileName, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!bucketName) {
            throw new errorHandler_1.AppError(500, 'GCS_BUCKET_NAME is not configured');
        }
        const bucket = storage.bucket(bucketName);
        const fileUpload = bucket.file(fileName);
        // Upload the file
        yield fileUpload.save(file, {
            metadata: {
                contentType,
            },
            public: true, // Make the file publicly accessible
        });
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        return publicUrl;
    }
    catch (error) {
        console.error('Error uploading to GCS:', error);
        throw new errorHandler_1.AppError(500, 'Failed to upload image to Google Cloud Storage');
    }
});
exports.uploadToGCS = uploadToGCS;
/**
 * Delete a file from Google Cloud Storage
 * @param fileName - The name of the file in the bucket
 */
const deleteFromGCS = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!bucketName) {
            throw new errorHandler_1.AppError(500, 'GCS_BUCKET_NAME is not configured');
        }
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        // Check if file exists
        const [exists] = yield file.exists();
        if (exists) {
            yield file.delete();
        }
    }
    catch (error) {
        console.error('Error deleting from GCS:', error);
        // Don't throw error, just log it (file might not exist)
    }
});
exports.deleteFromGCS = deleteFromGCS;
/**
 * Generate a unique file name for uploads
 * @param originalName - The original file name
 * @param userId - The user ID to include in the path
 * @returns A unique file name with path
 */
const generateFileName = (originalName, userId) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'jpg';
    return `posts/${userId}/${timestamp}-${randomString}.${extension}`;
};
exports.generateFileName = generateFileName;
