import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function useSessionCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [session, status, router]);

  return { session, status };
}
