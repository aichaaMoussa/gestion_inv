import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("[Middleware] Request path:", req.nextUrl.pathname);
    console.log("[Middleware] Request headers:", req.headers);

    // Si l'utilisateur est authentifié et essaie d'accéder à la page de login
    if (req.nextUrl.pathname === "/login") {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      if (callbackUrl) {
        return NextResponse.redirect(new URL(callbackUrl, req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    console.log("[Middleware] Proceeding with request");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("[Middleware] Authorization check - Token:", token);
        console.log("[Middleware] Authorization check - Path:", req.nextUrl.pathname);
        
        // Si l'utilisateur est sur la page de login, toujours autoriser
        if (req.nextUrl.pathname === "/login") {
          console.log("[Middleware] Login page - Always authorized");
          return true;
        }
        // Pour les autres pages, vérifier le token
        const isAuthorized = !!token;
        console.log("[Middleware] Other page - Authorization result:", isAuthorized);
        return isAuthorized;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protéger toutes les routes sauf la page de login et les ressources statiques
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 