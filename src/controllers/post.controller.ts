import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { createNotification } from './notification.controller';

const prisma = new PrismaClient();

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
    const { type, content, title, imageUrl } = req.body;

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
    const { content, title, imageUrl } = req.body;

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
  req: Request<{ postId: string }, {}, { isLike: boolean }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;
    const { isLike } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
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
      data: { reaction }
    });
  } catch (error) {
    next(error);
  }
}; 