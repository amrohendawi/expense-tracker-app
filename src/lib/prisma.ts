import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 * 
 * Learn more: 
 * https://pris.ly/d/help/next-js-best-practices
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a simple singleton for PrismaClient with proper logging
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Use a generic try-catch method to handle database operations with retries
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retries = 0;
  let lastError: any;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMsg = String(error);
      
      // Only retry on connection-related errors
      if (errorMsg.includes('prepared statement') || 
          errorMsg.includes('connection')) {
        retries++;
        // Wait before retrying (exponential backoff)
        await new Promise(r => setTimeout(r, 100 * Math.pow(2, retries)));
        continue;
      }
      
      // For other errors, rethrow immediately
      throw error;
    }
  }
  
  // If we've exhausted retries, throw the last error
  throw lastError;
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
