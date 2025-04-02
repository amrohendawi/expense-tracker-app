import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a singleton for PrismaClient with proper logging and connection handling
const prismaClientSingleton = () => {
  // Configure the PrismaClient with appropriate options
  const options: any = {
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  };
  
  // Only add datasource configuration if SUPABASE_URL is defined
  // This prevents build errors with "undefined" datasource
  if (process.env.SUPABASE_URL) {
    options.datasources = {
      db: {
        url: process.env.SUPABASE_URL,
      },
    };
  }
  
  const client = new PrismaClient(options).$extends({
    // Add query extensions to handle connection issues in serverless environments
    query: {
      $allOperations({ operation, model, args, query }) {
        return query(args).catch(async (err: any) => {
          // Check if the error is related to prepared statements
          if (
            err.message?.includes('prepared statement') || 
            err.message?.includes('bind message supplies') ||
            err.message?.includes('connection')
          ) {
            console.log(`Retrying ${model}.${operation} due to connection issue`);
            
            // Small delay before retry
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Retry the operation once
            return query(args);
          }
          throw err;
        });
      },
    },
  });
  
  return client;
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
          errorMsg.includes('bind message') ||
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

// Create or reuse the Prisma client instance
const prismaWithRetry = globalForPrisma.prisma ?? prismaClientSingleton();

// Clean up the Prisma client during hot reloads in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaWithRetry;
}

// Wrap the Prisma client with a proxy that applies the retry logic to all methods
export const prisma = new Proxy(prismaWithRetry, {
  get(target, prop) {
    const value = Reflect.get(target, prop);
    
    // If the property is a function, wrap it with retry logic
    if (typeof value === 'function') {
      return (...args: any[]) => {
        return withRetry(() => value.apply(target, args));
      };
    }
    
    // For model properties (user, expense, etc.), return a proxy that wraps their methods
    if (typeof value === 'object' && value !== null) {
      return new Proxy(value, {
        get(modelTarget, modelProp) {
          const modelMethod = Reflect.get(modelTarget, modelProp);
          
          if (typeof modelMethod === 'function') {
            return (...args: any[]) => {
              return withRetry(() => modelMethod.apply(modelTarget, args));
            };
          }
          
          return modelMethod;
        },
      });
    }
    
    return value;
  },
});
