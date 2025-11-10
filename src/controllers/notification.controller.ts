import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';

// Get user's notifications
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.notification.count({
        where: { userId }
      })
    ]);

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
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

// Mark notification as read
export const markAsRead = async (
  req: Request<{ notificationId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new AppError(403, 'Not authorized to update this notification');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    res.json({
      status: 'success',
      data: { notification: updatedNotification }
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    });

    res.json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to create notifications (used by other controllers)
export const createNotification = async (
  userId: string,
  message: string
) => {
  return prisma.notification.create({
    data: {
      userId,
      message
    }
  });
}; 