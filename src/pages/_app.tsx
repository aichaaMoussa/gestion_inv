import { SessionProvider, useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // 🔥 Redirection si non authentifié
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
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const queryClient = new QueryClient();

  // Pages nécessitant la barre de navigation
  const dashboardPages = [
    "/dashboard",
    "/dashboard/roles",
    "/dashboard/patients",
  ];
  const showNavbar = dashboardPages.some((path) =>
    router.pathname.startsWith(path)
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
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
          </AuthGuard>
        </NextIntlClientProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
