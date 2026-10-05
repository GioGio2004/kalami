import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/lib/urls";

// Student app: everything except the landing page, Clerk's own pages, the group
// invite pages (opened before people have an account), the offline page (the
// service worker fetches it to keep a copy) and the MCP connector (it checks its
// own OAuth tokens, see lib/mcp) needs a signed-in user.
// Roles and onboarding are enforced in Convex and the student gate.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/join(.*)",
  "/offline",
  "/api/mcp(.*)",
  // MCP clients probing for OAuth metadata get a clean answer instead of a sign-in redirect.
  "/.well-known(.*)",
]);
// Sample-data screen gallery; the page itself 404s outside development too.
const isDevGallery = createRouteMatcher(["/dev(.*)"]);

export default clerkMiddleware(
  async (auth, request) => {
    const devGallery = process.env.NODE_ENV === "development" && isDevGallery(request);
    if (!isPublicRoute(request) && !devGallery) {
      await auth.protect();
    }
  },
  // Signed-out visitors land on our own /sign-in, not Clerk's hosted page.
  { signInUrl: SIGN_IN_URL, signUpUrl: SIGN_UP_URL },
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk's Frontend API proxy path
    "/__clerk/:path*",
  ],
};
