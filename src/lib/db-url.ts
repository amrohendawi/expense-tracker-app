// Database URL configuration helper
// Provides fallbacks and standardization for different environments

/**
 * Gets the appropriate database URL with fallbacks
 * - Checks for Vercel-specific PostgreSQL environment variables
 * - Falls back to standard SUPABASE_URL if needed
 */
export function getDatabaseUrl(): string {
  console.log('[db-url] Environment check:');
  console.log('[db-url] NODE_ENV:', process.env.NODE_ENV);
  
  // Log all available environment variables related to database (without sensitive values)
  const envVars = {
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL_PGBOUNCER,
    POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    VERCEL: !!process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV
  };
  
  console.log('[db-url] Available DB environment variables:', envVars);
  
  // Preferred URL for Prisma
  if (process.env.POSTGRES_PRISMA_URL) {
    console.log('[db-url] Using POSTGRES_PRISMA_URL');
    const protocol = process.env.POSTGRES_PRISMA_URL.split('://')[0];
    console.log('[db-url] Database protocol:', protocol);
    return process.env.POSTGRES_PRISMA_URL;
  }
  
  // Fallback to standard SUPABASE_URL
  if (process.env.SUPABASE_URL) {
    console.log('[db-url] Using SUPABASE_URL as fallback');
    return process.env.SUPABASE_URL;
  }
  
  // Fallback to standard POSTGRES_URL (sometimes used by Vercel)
  if (process.env.POSTGRES_URL) {
    console.log('[db-url] Using POSTGRES_URL as fallback');
    return process.env.POSTGRES_URL;
  }
  
  console.error('[db-url] No database URL found in environment variables!');
  return 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
}

/**
 * Gets the direct URL for non-pooled connections
 */
export function getDirectDatabaseUrl(): string {
  if (process.env.POSTGRES_URL_NON_POOLING) {
    return process.env.POSTGRES_URL_NON_POOLING;
  }
  
  // Fall back to the standard URL if direct URL not specified
  return getDatabaseUrl();
}
