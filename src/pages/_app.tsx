import { QueryClient, QueryClientProvider } from "react-query";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const queryClient = new QueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifiez si l'utilisateur est connecté (ex. via un token)
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Pages nécessitant la barre de navigation
  const dashboardPages = [
    "/dashboard",
    "/dashboard/roles",
    "/dashboard/patients",
  ];
  const showNavbar =
    isAuthenticated &&
    dashboardPages.some((path) => router.pathname.startsWith(path));

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <NextIntlClientProvider
          locale={router.locale}
          messages={pageProps.messages}
          timeZone="Europe/Vienna"
        >
          <div className="flex h-screen">
            {/* Barre de navigation */}
            {showNavbar && <Navbar />}

            {/* Contenu principal */}
            <main className="flex-1 p-4 bg-gray-100 overflow-y-auto">
              <Component {...pageProps} />
            </main>
          </div>
        </NextIntlClientProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
