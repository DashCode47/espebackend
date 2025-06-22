import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

// Define PromotionCategory enum to match Prisma schema
enum PromotionCategory {
  FOOD = 'FOOD',
  DRINKS = 'DRINKS',
  EVENTS = 'EVENTS',
  PARTIES = 'PARTIES',
  OTHER = 'OTHER'
}

interface CreatePromotionBody {
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  location: string;
  category: PromotionCategory;
  isActive?: boolean;
}

interface UpdatePromotionBody {
  title?: string;
  description?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: PromotionCategory;
  isActive?: boolean;
}

// Create a new promotion
export const createPromotion = async (
  req: Request<{}, {}, CreatePromotionBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, imageUrl, startDate, endDate, location, category, isActive = true } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !location || !category) {
      throw new AppError(400, 'All fields are required except imageUrl');
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError(400, 'Invalid date format');
    }

    if (start >= end) {
      throw new AppError(400, 'End date must be after start date');
    }

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        imageUrl,
        startDate: start,
        endDate: end,
        location,
        category,
        isActive
      }
    });

    res.status(201).json({
      status: 'success',
      data: { promotion }
    });
  } catch (error) {
    next(error);
  }
};

// Get all promotions with filters
export const getPromotions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, isActive, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (category) {
      where.category = category as PromotionCategory;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Only show promotions that are currently active (within date range)
    const now = new Date();
    where.AND = [
      { startDate: { lte: now } },
      { endDate: { gte: now } }
    ];

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.promotion.count({ where })
    ]);

    res.json({
      status: 'success',
      data: {
        promotions,
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

// Get a single promotion
export const getPromotion = async (
  req: Request<{ promotionId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { promotionId } = req.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId }
    });

    if (!promotion) {
      throw new AppError(404, 'Promotion not found');
    }

    res.json({
      status: 'success',
      data: { promotion }
    });
  } catch (error) {
    next(error);
  }
};

// Update a promotion
export const updatePromotion = async (
  req: Request<{ promotionId: string }, {}, UpdatePromotionBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { promotionId } = req.params;
    const { title, description, imageUrl, startDate, endDate, location, category, isActive } = req.body;

    // Check if promotion exists
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: promotionId }
    });

    if (!existingPromotion) {
      throw new AppError(404, 'Promotion not found');
    }

    // Validate dates if provided
    let start = existingPromotion.startDate;
    let end = existingPromotion.endDate;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new AppError(400, 'Invalid start date format');
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new AppError(400, 'Invalid end date format');
      }
    }

    if (start >= end) {
      throw new AppError(400, 'End date must be after start date');
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        title,
        description,
        imageUrl,
        startDate: start,
        endDate: end,
        location,
        category,
        isActive
      }
    });

    res.json({
      status: 'success',
      data: { promotion: updatedPromotion }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a promotion
export const deletePromotion = async (
  req: Request<{ promotionId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { promotionId } = req.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId }
    });

    if (!promotion) {
      throw new AppError(404, 'Promotion not found');
    }

    await prisma.promotion.delete({
      where: { id: promotionId }
    });

    res.json({
      status: 'success',
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get promotions by category
export const getPromotionsByCategory = async (
  req: Request<{ category: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Validate category
    if (!Object.values(PromotionCategory).includes(category as PromotionCategory)) {
      throw new AppError(400, 'Invalid category');
    }

    const where = {
      category: category as PromotionCategory,
      isActive: true,
      AND: [
        { startDate: { lte: new Date() } },
        { endDate: { gte: new Date() } }
      ]
    };

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.promotion.count({ where })
    ]);

    res.json({
      status: 'success',
      data: {
        promotions,
        category,
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