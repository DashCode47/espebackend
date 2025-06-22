import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

interface CreateCommentBody {
  content: string;
}

// Create a comment on a post
export const createComment = async (
  req: Request<{ postId: string }, {}, CreateCommentBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;
    const { content } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    if (!content?.trim()) {
      throw new AppError(400, 'Comment content is required');
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

// Get comments for a post
export const getPostComments = async (
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // Get comments with pagination
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.comment.count({
        where: { postId }
      })
    ]);

    res.json({
      status: 'success',
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 