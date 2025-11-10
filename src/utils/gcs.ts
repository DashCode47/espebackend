import { Storage } from '@google-cloud/storage';
import { AppError } from '../middlewares/errorHandler';

// Initialize Google Cloud Storage
const storage = new Storage({
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
export const uploadToGCS = async (
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  try {
    if (!bucketName) {
      throw new AppError(500, 'GCS_BUCKET_NAME is not configured');
    }

    const bucket = storage.bucket(bucketName);
    const fileUpload = bucket.file(fileName);

    // Upload the file
    await fileUpload.save(file, {
      metadata: {
        contentType,
      },
      public: true, // Make the file publicly accessible
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw new AppError(500, 'Failed to upload image to Google Cloud Storage');
  }
};

/**
 * Delete a file from Google Cloud Storage
 * @param fileName - The name of the file in the bucket
 */
export const deleteFromGCS = async (fileName: string): Promise<void> => {
  try {
    if (!bucketName) {
      throw new AppError(500, 'GCS_BUCKET_NAME is not configured');
    }

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    // Check if file exists
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }
  } catch (error) {
    console.error('Error deleting from GCS:', error);
    // Don't throw error, just log it (file might not exist)
  }
};

/**
 * Generate a unique file name for uploads
 * @param originalName - The original file name
 * @param userId - The user ID to include in the path
 * @returns A unique file name with path
 */
export const generateFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `posts/${userId}/${timestamp}-${randomString}.${extension}`;
};

