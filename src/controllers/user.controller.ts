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

// Obtener todos los usuarios visibles
export const getVisibleUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      where: { isVisible: true },
      select: {
        id: true,
        name: true,
        career: true,
        avatarUrl: true,
        interests: true,
        isVisible: true
      }
    });
    res.json({
      status: 'success',
      data: users
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

// Get all unique interests for filter chips
export const getAllInterests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener todos los intereses únicos de los usuarios
    const users = await prisma.user.findMany({
      select: { interests: true }
    });
    // Flatten y filtrar duplicados
    const allInterests = Array.from(
      new Set(users.flatMap(u => u.interests || []))
    );
    res.json({
      status: 'success',
      data: allInterests
    });
  } catch (error) {
    next(error);
  }
};

// Get potential connections (other users) con filtros
export const getPotentialConnections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { interest, faculty, search } = req.query;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Construir condiciones dinámicas de filtrado
    const andFilters: any[] = [
      { id: { not: userId } },
      { isVisible: true },
      {
        OR: [
          {
            connectionsInitiated: {
              none: {
                user2Id: userId
              }
            }
          },
          {
            connectionsReceived: {
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
    ];

    // Filtro por interés (puede ser string o array)
    if (interest) {
      const interestsArray = Array.isArray(interest) ? interest : [interest];
      andFilters.push({
        interests: {
          hasSome: interestsArray
        }
      });
    }

    // Filtro por facultad/carrera
    if (faculty) {
      andFilters.push({
        career: {
          contains: faculty as string,
          mode: 'insensitive'
        }
      });
    }

    // Filtro por nombre
    if (search) {
      andFilters.push({
        name: {
          contains: search as string,
          mode: 'insensitive'
        }
      });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: andFilters
      },
      select: {
        id: true,
        name: true,
        career: true,
        avatarUrl: true,
        interests: true
      },
      take: 20 // Puedes ajustar el límite
    });

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar la visibilidad del usuario autenticado
export const setUserVisibility = async (
  req: Request<{}, {}, { isVisible: boolean }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { isVisible } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }
    if (typeof isVisible !== 'boolean') {
      throw new AppError(400, 'El campo isVisible debe ser booleano');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isVisible },
      select: {
        id: true,
        isVisible: true
      }
    });

    res.json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}; 