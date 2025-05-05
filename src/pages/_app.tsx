import { SessionProvider, useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Liste des routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ['/login', '/register', '/forgot-password'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Vérifier si la route actuelle est une route publique
    const isPublicRoute = publicRoutes.includes(router.pathname);

    if (status === "unauthenticated" && !isPublicRoute) {
      router.push("/login");
    }

    // Si l'utilisateur est authentifié et essaie d'accéder à la page de login
    if (status === "authenticated" && router.pathname === "/login") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return <>{children}</>;
}

export default function App({
  Component,
  pageProps: { ...pageProps },
}: AppProps) {
  const router = useRouter();
  const queryClient = new QueryClient();

  const dashboardPages = [
    { path: "/dashboard", key: "dashboard" },
    { path: "/dashboard/roles", key: "roles" },
    { path: "/dashboard/patients", key: "patients" },
  ];
  const showNavbar = dashboardPages.some(({ path }) =>
    router.pathname.startsWith(path)
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={pageProps.session}>
        <NextIntlClientProvider
          locale={router.locale}
          messages={pageProps.messages}
          timeZone="Europe/Vienna"
        >
          <AuthGuard>
            <div className="flex h-screen">
              {showNavbar && <Navbar />}
              <main className="flex-1 p-4 bg-white overflow-y-auto">
                <Component {...pageProps} />
              </main>
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />
          </AuthGuard>
        </NextIntlClientProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
