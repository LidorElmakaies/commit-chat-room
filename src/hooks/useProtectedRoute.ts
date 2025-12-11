import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAppSelector } from "../store";

/**
 * A hook to protect routes that require authentication.
 * It waits for the navigation state to be ready and the auth state to be loaded
 * before checking for authentication. If the user is not authenticated,
 * it redirects them to the login screen.
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.matrixAuth);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for the navigation state to be ready and for the auth state to be loaded
    if (navigationState?.key && loading === "idle") {
      if (!isAuthenticated) {
        // Redirect to the login page if the user is not authenticated.
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, loading, navigationState, router]);
}

