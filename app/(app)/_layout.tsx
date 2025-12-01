import { Redirect, Stack, useRouter } from "expo-router";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { logoutUser } from "../../src/store/slices/matrixAuthSlice";
import { View } from "react-native";
import { HomeButton, LogoutButton } from "../../components";

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
    router.push("/(app)");
  };

  const headerRightWithHome = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <HomeButton onPress={handleHome} style={{ marginRight: 15 }} />
      <LogoutButton onPress={handleLogout} />
    </View>
  );

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Room Management",
          headerRight: () => (
            <LogoutButton onPress={handleLogout} style={{ marginRight: 15 }} />
          ),
        }}
      />
      <Stack.Screen
        name="create-room"
        options={{
          title: "Create Room",
          headerRight: headerRightWithHome,
        }}
      />
      <Stack.Screen
        name="join-room"
        options={{
          title: "Join Room",
          headerRight: headerRightWithHome,
        }}
      />
    </Stack>
  );
}
