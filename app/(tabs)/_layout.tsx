import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAppSelector } from "../../src/store";

export default function TabsLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.matrixAuth);

  useEffect(() => {
    // This is the route protection.
    // If the user is not authenticated, redirect them to the login screen.
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, router]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
