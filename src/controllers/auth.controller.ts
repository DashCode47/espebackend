import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePasswords } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  career: string;
  gender: string;
  interests: string[];
}

interface LoginBody {
  email: string;
  password: string;
}

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, career, gender, interests } = req.body;

    // Validate required fields
    if (!email || !password || !name || !career || !gender) {
      throw new AppError(400, 'All fields are required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        career,
        gender,
        interests: interests || []
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          career: user.career,
          gender: user.gender,
          interests: user.interests
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          career: user.career,
          gender: user.gender,
          interests: user.interests
        },
        token
      }
    });
  } catch (error) {
    // Log error details for debugging
    console.error('Login error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    next(error);
  }
}; 