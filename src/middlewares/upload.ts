import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Configure multer to store files in memory (as Buffer)
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  // Handle cases where mimetype might be missing or undefined
  if (!file.mimetype || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Only image files are allowed') as any);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware for single image upload with error handling
export const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(400, 'File size too large. Maximum size is 5MB'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError(400, `Unexpected file field. Expected field name: 'image'`));
        }
        return next(new AppError(400, `Upload error: ${err.message} (code: ${err.code})`));
      }
      return next(err);
    }
    
    next();
  });
};

