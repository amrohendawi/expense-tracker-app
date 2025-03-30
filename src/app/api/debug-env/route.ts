"use server"

import { NextResponse } from 'next/server';

export async function GET() {
  // Safe list of environment variables to expose (no sensitive data)
  const safeEnvVars = {
    // Prisma-related
    POSTGRES_PRISMA_URL_EXISTS: !!process.env.connect_POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING_EXISTS: !!process.env.connect_POSTGRES_URL_NON_POOLING,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    
    // Vercel environment info
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
    NODE_ENV: process.env.NODE_ENV,
    
    // Process information
    PROCESS_CWD: process.cwd(),
  };

  // Only for debugging - show the actual PostgreSQL protocol part
  // without exposing credentials
  if (process.env.connect_POSTGRES_PRISMA_URL) {
    safeEnvVars['POSTGRES_PROTOCOL'] = process.env.connect_POSTGRES_PRISMA_URL.split('://')[0];
  }

  return NextResponse.json({
    message: 'Environment variable debug information',
    environment: safeEnvVars,
    timestamp: new Date().toISOString()
  });
}
