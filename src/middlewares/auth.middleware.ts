import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, 'No token provided');
    }

    // Ensure the token has Bearer prefix
    let token: string;
    if (authHeader.startsWith('Bearer ')) {
      // Already has Bearer prefix
      token = authHeader;
    } else {
      // Add Bearer prefix
      token = `Bearer ${authHeader}`;
    }

    // Extract the token part (after 'Bearer ')
    const tokenPart = token.split(' ')[1];
    
    const decoded = verifyToken(tokenPart);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError(401, 'Invalid or expired token'));
  }
}; 