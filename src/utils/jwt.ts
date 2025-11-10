import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const TOKEN_EXPIRATION = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  try {
    if (!JWT_SECRET || JWT_SECRET === 'default-secret-key') {
      console.warn('WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable for production.');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}; 