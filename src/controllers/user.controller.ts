import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

interface UpdateProfileBody {
  name?: string;
  career?: string;
  gender?: string;
  bio?: string;
  avatarUrl?: string;
  interests?: string[];
}

// Get current user profile
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        career: true,
        gender: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        career: true,
        gender: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        createdAt: true
      }
    });

    res.json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (
  req: Request<{}, {}, UpdateProfileBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { name, career, gender, bio, avatarUrl, interests } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        career,
        gender,
        bio,
        avatarUrl,
        interests,
      },
      select: {
        id: true,
        email: true,
        name: true,
        career: true,
        gender: true,
        bio: true,
        avatarUrl: true,
        interests: true,
        createdAt: true
      }
    });

    res.json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

// Get potential matches (other users)
export const getPotentialMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Get users excluding:
    // 1. The current user
    // 2. Users that are already matched
    // 3. Users that the current user has already interacted with (liked/disliked)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          {
            // Exclude users that are already matched with current user
            OR: [
              {
                matchesInitiated: {
                  none: {
                    user2Id: userId
                  }
                }
              },
              {
                matchesReceived: {
                  none: {
                    user1Id: userId
                  }
                }
              }
            ]
          },
          {
            NOT: {
              OR: [
                {
                  id: {
                    in: (await prisma.userInteraction.findMany({
                      where: { user1Id: userId },
                      select: { user2Id: true }
                    })).map(ui => ui.user2Id)
                  }
                },
                {
                  id: {
                    in: (await prisma.userInteraction.findMany({
                      where: { user2Id: userId },
                      select: { user1Id: true }
                    })).map(ui => ui.user1Id)
                  }
                }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        career: true,
        gender: true,
        bio: true,
        avatarUrl: true,
        interests: true
      },
      take: 10 // Limit to 10 users at a time
    });

    res.json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    next(error);
  }
}; 