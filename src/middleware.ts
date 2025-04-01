import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// NextResponse is generally not needed when using auth.protect() for basic redirects
// import { NextResponse } from 'next/server';

// Define routes that should be publicly accessible
// These routes will NOT trigger the auth().protect() check
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)', // Matches /sign-in and /sign-in/*
  '/sign-up(.*)', // Matches /sign-up and /sign-up/*
  // Add any other public routes here, e.g., '/api/public-endpoint'
  // If you have public API routes, list them here or create a separate matcher
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, then protect it
  // auth().protect() will automatically redirect unauthenticated users
  // to your sign-in page, including the redirect_url parameter
  if (!isPublicRoute(req)) {
    await auth().protect();
  }

  // If the route IS public, or if the user is authenticated for a protected route,
  // the request will proceed without intervention here.
  // You could add further logic here if needed, e.g., role checks for specific routes.

  // Example: Role-based access for an admin section
  // const isAdminRoute = createRouteMatcher(['/admin(.*)']);
  // if (isAdminRoute(req)) {
  //   await auth().protect(has => {
  //     // Check for a specific role or permission
  //     return has({ role: 'org:admin' });
  //     // Or check if the user is signed in at all for this route,
  //     // even if it wasn't caught by the !isPublicRoute check above
  //     // return has();
  //   });
  // }

  // No explicit NextResponse.next() is required unless you add custom header/response logic
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (e.g., .png, .jpg, .svg) unless in query parameters
     * Match all paths unless they contain a dot (.) suggesting a static file
     * OR they start with _next
     */
    '/((?!.+\\.[\\w]+$|_next).*)',
    /*
     * Match root path explicitly
     */
    '/',
    /*
     * Match API routes
     */
    '/(api|trpc)(.*)'
  ],
  // matcher: [ // You can also use the recommended matcher from the Clerk v5 docs:
  //   // Skip Next.js internals and all static files, unless found in search params
  //   '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  //   // Always run for API routes
  //   '/(api|trpc)(.*)',
  // ],
};