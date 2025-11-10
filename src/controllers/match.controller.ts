import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';
import { createNotification } from './notification.controller';

interface UserInfo {
  id: string;
  name: string;
  career: string;
  avatarUrl: string | null;
  interests: string[];
}

interface MatchWithUsers {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  user1: UserInfo;
  user2: UserInfo;
}

// Like a user (create potential match)
export const likeUser = async (
  req: Request<{ targetUserId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { targetUserId } = req.params;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Validate target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      throw new AppError(404, 'Target user not found');
    }

    // Create user interaction record
    await prisma.userInteraction.create({
      data: {
        user1Id: userId,
        user2Id: targetUserId,
        type: 'LIKE'
      }
    });

    // Check if there's a mutual match
    const mutualMatch = await prisma.userInteraction.findFirst({
      where: {
        user1Id: targetUserId,
        user2Id: userId,
        type: 'LIKE'
      }
    });

    let match = null;
    
    // If there's a mutual like, create a match
    if (mutualMatch) {
      match = await prisma.connection.create({
        data: {
          user1Id: userId,
          user2Id: targetUserId
        },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              career: true,
              avatarUrl: true
            }
          },
          user2: {
            select: {
              id: true,
              name: true,
              career: true,
              avatarUrl: true
            }
          }
        }
      });

      // Create notifications for both users
      await Promise.all([
        createNotification(
          userId,
          `¡Tienes un match con ${targetUser.name}! Ahora pueden chatear.`
        ),
        createNotification(
          targetUserId,
          `¡Tienes un match con ${match.user1.name}! Ahora pueden chatear.`
        )
      ]);
    } else {
      // Just notify the target user that they received a like
      await createNotification(
        targetUserId,
        `A alguien le gustó tu perfil 👀`
      );
    }

    res.json({
      status: 'success',
      data: { 
        match,
        isMutualMatch: !!match
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's matches
export const getMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Get mutual matches (where both users have liked each other)
    const mutualMatches = await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            career: true,
            avatarUrl: true,
            interests: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            career: true,
            avatarUrl: true,
            interests: true
          }
        }
      }
    });

    // Transform matches to always show the other user's info
    const formattedMatches = mutualMatches.map((match: MatchWithUsers) => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        user: otherUser
      };
    });

    res.json({
      status: 'success',
      data: { matches: formattedMatches }
    });
  } catch (error) {
    next(error);
  }
};

// Check if there's a mutual match with a specific user
export const checkMatch = async (
  req: Request<{ targetUserId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { targetUserId } = req.params;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const match = await prisma.connection.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId }
        ]
      }
    });

    res.json({
      status: 'success',
      data: { isMatch: !!match }
    });
  } catch (error) {
    next(error);
  }
}; 