import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from './errorHandler';

// Enum UserRole - se importará de Prisma una vez que los tipos se actualicen
export enum UserRole {
  STUDENT = 'STUDENT',
  DRIVER = 'DRIVER'
}

export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // @ts-ignore - role exists in database after migration
      const userRole = user.role as string;
      const allowedRoleStrings = allowedRoles.map(role => role as string);
      
      if (!allowedRoleStrings.includes(userRole)) {
        throw new AppError(403, `Access denied. Required role: ${allowedRoles.join(' or ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

