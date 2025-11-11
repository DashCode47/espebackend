import { Storage } from '@google-cloud/storage';
import { AppError } from '../middlewares/errorHandler';

// Initialize Google Cloud Storage
let storage: Storage;
try {
  const credentials = process.env.GCS_CREDENTIALS ? JSON.parse(process.env.GCS_CREDENTIALS) : undefined;
  console.log('Initializing GCS Storage with:', {
    projectId: process.env.GCS_PROJECT_ID,
    hasCredentials: !!credentials,
    clientEmail: credentials?.client_email || 'Not set',
    keyFilename: process.env.GCS_KEY_FILENAME || 'Not set'
  });
  
  storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILENAME, // Path to service account key file
    // Or use credentials from environment variable
    credentials: credentials,
  });
} catch (initError) {
  console.error('Error initializing GCS Storage:', initError);
  throw initError;
}

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
    // Check configuration first
    console.log('=== GCS UPLOAD DEBUG ===');
    console.log('GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID ? 'Set' : 'Not set');
    console.log('GCS_BUCKET_NAME:', bucketName);
    console.log('GCS_CREDENTIALS:', process.env.GCS_CREDENTIALS ? 'Set' : 'Not set');
    console.log('GCS_KEY_FILENAME:', process.env.GCS_KEY_FILENAME ? 'Set' : 'Not set');
    console.log('File info:', { fileName, contentType, size: file.length });
    
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
    
    // Check if bucket exists
    console.log('Checking if bucket exists...');
    const [exists] = await bucket.exists();
    if (!exists) {
      throw new AppError(500, `Bucket "${bucketName}" does not exist in Google Cloud Storage`);
    }
    console.log('Bucket exists:', exists);
    
    // Test permissions by trying to list files (this will fail if no permissions)
    try {
      console.log('Testing bucket permissions...');
      await bucket.getFiles({ maxResults: 1 });
      console.log('Bucket permissions OK');
    } catch (permError) {
      console.error('Bucket permission test failed:', permError);
      throw new AppError(500, `No permissions on bucket "${bucketName}". Error: ${permError instanceof Error ? permError.message : 'Unknown'}`);
    }
    
    const fileUpload = bucket.file(fileName);

    // Upload the file
    console.log('Uploading file to bucket...');
    // Don't use public: true when uniform bucket-level access is enabled
    // The bucket should have public access configured via IAM instead
    await fileUpload.save(file, {
      metadata: {
        contentType,
      },
    });

    // Note: With uniform bucket-level access, files are made public via bucket IAM policy
    // not via ACLs. Make sure your bucket has public access configured at the IAM level.

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    console.log('Upload successful:', publicUrl);
    console.log('========================');
    
    return publicUrl;
  } catch (error) {
    console.error('=== GCS UPLOAD ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error code:', (error as any)?.code);
    console.error('Error details:', (error as any)?.errors || (error as any)?.response?.data);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    console.error('========================');
    
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
 * @returns A unique file name with path
 */
export const generateFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `posts/${userId}/${timestamp}-${randomString}.${extension}`;
};

