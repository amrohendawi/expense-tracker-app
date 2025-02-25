import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes
const publicPaths = ['/', '/sign-in*', '/sign-up*'];

const isPublic = (path: string) => {
  return publicPaths.find(x => 
    path.match(new RegExp(`^${x}$`.replace('*', '.*')))
  );
};

export default withClerkMiddleware((request: NextRequest) => {
  const { pathname } = request.nextUrl;
  
  // If the path is public, don't redirect
  if (isPublic(pathname)) {
    return NextResponse.next();
  }
  
  // If the user is not signed in, redirect them to the sign-in page
  const { userId } = getAuth(request);
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Don't run middleware on static files
    '/', // Run middleware on index page
    '/(api|trpc)(.*)'], // Run middleware on API routes
};
