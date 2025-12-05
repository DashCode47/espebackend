import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AppError } from "../middlewares/errorHandler";

interface CreateEstablishmentBody {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  website?: string;
  isActive?: boolean;
}

interface UpdateEstablishmentBody {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  website?: string;
  isActive?: boolean;
}

// Create a new establishment
export const createEstablishment = async (
  req: Request<{}, {}, CreateEstablishmentBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      address,
      phone,
      email,
      imageUrl,
      website,
      isActive = true,
    } = req.body;

    // Validate required fields
    if (!name || !address) {
      throw new AppError(400, "Name and address are required");
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError(400, "Invalid email format");
    }

    const establishment = await prisma.establishment.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        imageUrl,
        website,
        isActive,
      },
      include: {
        promotions: {
          where: {
            isActive: true,
            AND: [
              { startDate: { lte: new Date() } },
              { endDate: { gte: new Date() } },
            ],
          },
        },
      },
    });

    res.status(201).json({
      status: "success",
      data: { establishment },
    });
  } catch (error) {
    next(error);
  }
};

// Get all establishments with optional filters
export const getEstablishments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      isActive,
      hasActivePromotions,
      page = "1",
      limit = "10",
    } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // If hasActivePromotions is true, filter establishments with active promotions
    if (hasActivePromotions === "true") {
      const now = new Date();
      where.promotions = {
        some: {
          isActive: true,
          AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }],
        },
      };
    }

    const [establishments, total] = await Promise.all([
      prisma.establishment.findMany({
        where,
        include: {
          promotions: {
            where: {
              isActive: true,
              AND: [
                { startDate: { lte: new Date() } },
                { endDate: { gte: new Date() } },
              ],
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.establishment.count({ where }),
    ]);

    res.json({
      status: "success",
      data: {
        establishments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single establishment
export const getEstablishment = async (
  req: Request<{ establishmentId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { establishmentId } = req.params;
    const { includePromotions = "true", onlyActivePromotions = "true" } =
      req.query;

    const includePromotionsData =
      includePromotions === "true"
        ? {
            promotions: {
              where:
                onlyActivePromotions === "true"
                  ? {
                      isActive: true,
                      AND: [
                        { startDate: { lte: new Date() } },
                        { endDate: { gte: new Date() } },
                      ],
                    }
                  : undefined,
              orderBy: {
                createdAt: "desc" as const,
              },
            },
          }
        : undefined;

    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      include: includePromotionsData,
    });

    if (!establishment) {
      throw new AppError(404, "Establishment not found");
    }

    res.json({
      status: "success",
      data: { establishment },
    });
  } catch (error) {
    next(error);
  }
};

// Update an establishment
export const updateEstablishment = async (
  req: Request<{ establishmentId: string }, {}, UpdateEstablishmentBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { establishmentId } = req.params;
    const {
      name,
      description,
      address,
      phone,
      email,
      imageUrl,
      website,
      isActive,
    } = req.body;

    // Check if establishment exists
    const existingEstablishment =
      await prisma.establishment.findUnique({
        where: { id: establishmentId },
      });

    if (!existingEstablishment) {
      throw new AppError(404, "Establishment not found");
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError(400, "Invalid email format");
    }

    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        name,
        description,
        address,
        phone,
        email,
        imageUrl,
        website,
        isActive,
      },
      include: {
        promotions: {
          where: {
            isActive: true,
            AND: [
              { startDate: { lte: new Date() } },
              { endDate: { gte: new Date() } },
            ],
          },
        },
      },
    });

    res.json({
      status: "success",
      data: { establishment: updatedEstablishment },
    });
  } catch (error) {
    next(error);
  }
};

// Delete an establishment
export const deleteEstablishment = async (
  req: Request<{ establishmentId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { establishmentId } = req.params;

    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment) {
      throw new AppError(404, "Establishment not found");
    }

    await prisma.establishment.delete({
      where: { id: establishmentId },
    });

    res.json({
      status: "success",
      message: "Establishment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

