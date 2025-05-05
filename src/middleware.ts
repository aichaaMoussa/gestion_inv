import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) {
          return false;
        }
        return true;
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
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!login|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 