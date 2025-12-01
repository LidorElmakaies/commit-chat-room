import { Tabs, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppSelector } from "../../src/store";
import { useEffect } from "react";

export default function AuthLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.matrixAuth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, router]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="login" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "Register",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="app-registration" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
