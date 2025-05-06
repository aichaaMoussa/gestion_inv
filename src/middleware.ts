import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Si l'utilisateur est authentifié et essaie d'accéder à la page de login
    if (req.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Toujours autoriser la page de login
        if (req.nextUrl.pathname === "/login") {
          return true;
        }
        // Pour toutes les autres pages, il faut un token
        return !!token;
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