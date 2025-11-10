import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object to prevent
// exhausting your database connection limit in serverless environments.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Prevent multiple instances of Prisma Client in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

