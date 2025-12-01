import { Redirect, Tabs, useRouter } from "expo-router";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { logoutUser } from "../../src/store/slices/matrixAuthSlice";
import { View } from "react-native";
import { HomeButton, LogoutButton } from "../../components";
import { MaterialIcons } from "@expo/vector-icons";

export default function AppLayout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.matrixAuth);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleHome = () => {
    // Navigate to the default tab
    router.push("/(app)");
  };

  const headerRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <HomeButton onPress={handleHome} style={{ marginRight: 15 }} />
      <LogoutButton onPress={handleLogout} style={{ marginRight: 15 }} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerRight: headerRight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Join Room",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="meeting-room" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-room"
        options={{
          title: "Create Room",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
