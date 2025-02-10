import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function useSessionCheck() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  return { session, status };
}
