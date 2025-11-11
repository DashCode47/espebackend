import { Storage } from '@google-cloud/storage';
import { AppError } from '../middlewares/errorHandler';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_FILENAME,
  credentials: process.env.GCS_CREDENTIALS ? JSON.parse(process.env.GCS_CREDENTIALS) : undefined,
});

// Get bucket name from environment - must match exactly with GCS bucket name
const bucketName = process.env.GCS_BUCKET_NAME || 'espe-connect'; // Default to espe-connect based on your bucket

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
    if (!process.env.GCS_PROJECT_ID) {
      throw new AppError(500, 'GCS_PROJECT_ID is not configured');
    }
    
    if (!bucketName) {
      throw new AppError(500, 'GCS_BUCKET_NAME is not configured');
    }

    if (!process.env.GCS_CREDENTIALS && !process.env.GCS_KEY_FILENAME) {
      throw new AppError(500, 'GCS credentials are not configured. Please set GCS_CREDENTIALS or GCS_KEY_FILENAME.');
    }

    const bucket = storage.bucket(bucketName);
    const fileUpload = bucket.file(fileName);

    // Upload the file
    // Note: With uniform bucket-level access, files are made public via bucket IAM policy, not ACLs
    await fileUpload.save(file, {
      metadata: {
        contentType,
      },
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    // Re-throw AppError as-is
    if (error instanceof AppError) {
      throw error;
    }
    
    // Check for specific GCS errors
    const gcsError = error as any;
    if (gcsError?.code === 403) {
      throw new AppError(500, 'Permission denied. Check that your service account has Storage Object Admin role.');
    }
    if (gcsError?.code === 404) {
      throw new AppError(500, `Bucket "${bucketName}" not found. Verify the bucket name is correct.`);
    }
    if (gcsError?.code === 401) {
      throw new AppError(500, 'Authentication failed. Check your GCS credentials.');
    }
    
    console.error('Error uploading to GCS:', error);
    throw new AppError(500, `Failed to upload image to Google Cloud Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
 * @param resourceType - The type of resource (posts, events, etc.) - defaults to 'posts'
 * @returns A unique file name with path
 */
export const generateFileName = (originalName: string, userId: string, resourceType: string = 'posts'): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${resourceType}/${userId}/${timestamp}-${randomString}.${extension}`;
};

