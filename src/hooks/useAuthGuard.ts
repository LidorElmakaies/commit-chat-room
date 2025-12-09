import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAppSelector } from "../store";

/**
 * A hook to protect authentication routes (login, register).
 * If the user is already authenticated, it redirects them to the main app screen.
 */
export function useAuthGuard() {
  const { isAuthenticated } = useAppSelector((state) => state.matrixAuth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, router]);
}
