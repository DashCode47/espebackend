import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Log full error details
  console.error('=== ERROR DETAILS ===');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  if ((err as any).code) {
    console.error('Error code:', (err as any).code);
  }
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('====================');
  
  // Show error details for debugging (can be disabled in production later)
  const showDetails = process.env.NODE_ENV === 'development' || 
                      process.env.VERCEL_ENV === 'preview' || 
                      process.env.VERCEL_ENV === 'development' ||
                      true; // Temporarily always show for debugging
  
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(showDetails && { 
      error: err.message,
      errorName: err.name,
      ...((err as any).code && { code: (err as any).code }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
  });
}; 