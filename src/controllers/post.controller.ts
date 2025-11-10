import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';
import { createNotification } from './notification.controller';
import { uploadToGCS, generateFileName, deleteFromGCS } from '../utils/gcs';

// Define PostType enum to match Prisma schema
enum PostType {
  CONFESSION = 'CONFESSION',
  MARKETPLACE = 'MARKETPLACE',
  LOST_AND_FOUND = 'LOST_AND_FOUND'
}

interface CreatePostBody {
  type: PostType;
  content: string;
  title?: string;
  imageUrl?: string;
}

interface UpdatePostBody {
  content?: string;
  title?: string;
  imageUrl?: string;
}

// Create a new post
export const createPost = async (
  req: Request<{}, {}, CreatePostBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { type, content, title } = req.body;
    const file = req.file;

    // Debug logging
    console.log('=== POST CREATE DEBUG ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', { type, content, title });
    console.log('File received:', file ? {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
      bufferLength: file.buffer?.length
    } : 'No file');
    console.log('========================');

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    if (!type || !content) {
      throw new AppError(400, 'Type and content are required');
    }

    // Validate title for MARKETPLACE and LOST_AND_FOUND
    if ((type === 'MARKETPLACE' || type === 'LOST_AND_FOUND') && !title) {
      throw new AppError(400, 'Title is required for marketplace and lost & found posts');
    }

    let imageUrl: string | undefined;

    // If an image file was uploaded, upload it to Google Cloud Storage
    if (file) {
      if (!file.buffer || file.buffer.length === 0) {
        console.error('File buffer is empty or undefined');
        throw new AppError(400, 'Image file is empty or invalid. Please ensure the file is sent correctly.');
      }

      try {
        const fileName = generateFileName(file.originalname || 'image.jpg', userId);
        console.log('Uploading to GCS:', { fileName, size: file.buffer.length, mimetype: file.mimetype });
        imageUrl = await uploadToGCS(file.buffer, fileName, file.mimetype || 'image/jpeg');
        console.log('Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('Error uploading image to GCS:', uploadError);
        if (uploadError instanceof AppError) {
          throw uploadError;
        }
        throw new AppError(500, `Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }
    }

    const post = await prisma.post.create({
      data: {
        type,
        content,
        title,
        imageUrl,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            career: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

// Get posts with filters
export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = type ? { type: type as PostType } : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              career: true,
              avatarUrl: true
            }
          },
          reactions: {
            select: {
              id: true,
              isLike: true,
              userId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      status: 'success',
      data: { 
        posts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single post
export const getPost = async (
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            career: true,
            avatarUrl: true
          }
        },
        reactions: {
          select: {
            id: true,
            isLike: true,
            userId: true
          }
        }
      }
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    res.json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

// Update a post
export const updatePost = async (
  req: Request<{ postId: string }, {}, UpdatePostBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;
    const { content, title } = req.body;
    const file = req.file;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      throw new AppError(404, 'Post not found');
    }

    if (existingPost.authorId !== userId) {
      throw new AppError(403, 'Not authorized to update this post');
    }

    let imageUrl = existingPost.imageUrl;

    // If a new image file was uploaded, upload it to Google Cloud Storage
    if (file) {
      try {
        // Delete old image from GCS if it exists
        if (existingPost.imageUrl && existingPost.imageUrl.includes('storage.googleapis.com')) {
          const oldFileName = existingPost.imageUrl.split('/').pop();
          if (oldFileName) {
            await deleteFromGCS(`posts/${userId}/${oldFileName}`);
          }
        }

        // Upload new image
        const fileName = generateFileName(file.originalname, userId);
        imageUrl = await uploadToGCS(file.buffer, fileName, file.mimetype);
      } catch (uploadError) {
        console.error('Error uploading image to GCS:', uploadError);
        throw new AppError(500, 'Failed to upload image');
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
        title,
        imageUrl
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            career: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json({
      status: 'success',
      data: { post: updatedPost }
    });
  } catch (error) {
    next(error);
  }
};

// React to a post (like/dislike)
export const reactToPost = async (
  req: Request<{ postId: string }, {}, { reactionType: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;
    const { reactionType } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Validate reaction type
    const validReactionTypes = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];
    if (!reactionType || !validReactionTypes.includes(reactionType)) {
      throw new AppError(400, 'Invalid reaction type. Must be one of: like, love, laugh, wow, sad, angry');
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // Check if reaction already exists
    const existingReaction = await prisma.postReaction.findFirst({
      where: {
        postId,
        userId
      }
    });

    // Convert reaction type to boolean (like = true, others = false for now)
    // This maintains compatibility with the current schema
    const isLike = reactionType === 'like';

    let reaction;

    if (existingReaction) {
      // Update existing reaction
      reaction = await prisma.postReaction.update({
        where: { id: existingReaction.id },
        data: { isLike }
      });

      // Only notify if changing from dislike to like
      if (!existingReaction.isLike && isLike) {
        await createNotification(
          post.authorId,
          `A alguien le gustó tu publicación: "${post.title || post.content.substring(0, 30)}..."`
        );
      }
    } else {
      // Create new reaction
      reaction = await prisma.postReaction.create({
        data: {
          postId,
          userId,
          isLike
        }
      });

      // Notify only for likes
      if (isLike) {
        await createNotification(
          post.authorId,
          `A alguien le gustó tu publicación: "${post.title || post.content.substring(0, 30)}..."`
        );
      }
    }

    res.json({
      status: 'success',
      message: 'Reaction registered successfully',
      data: { reaction }
    });
  } catch (error) {
    next(error);
  }
};

// Delete reaction from a post
export const deleteReaction = async (
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // Check if reaction exists
    const existingReaction = await prisma.postReaction.findFirst({
      where: {
        postId,
        userId
      }
    });

    if (!existingReaction) {
      throw new AppError(404, 'Reaction not found');
    }

    // Delete the reaction
    await prisma.postReaction.delete({
      where: { id: existingReaction.id }
    });

    res.json({
      status: 'success',
      message: 'Reaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 