import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { useColorScheme, View } from "react-native";
import { HomeButton, LogoutButton } from "../../components";
import { Colors } from "../../constants/Colors";
import { useProtectedRoute } from "../../hooks/useProtectedRoute";
import { useAppDispatch } from "../../store";
import { logout } from "../../store/slices/matrixAuthSlice";

export default function AppTabLayout() {
  useProtectedRoute(); // Guard the entire (app) group

  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleHome = () => {
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
        tabBarActiveTintColor: theme.tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Join Room",
          headerRight: headerRight,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-room"
        options={{
          title: "Create Room",
          headerRight: headerRight,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="plus-square" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
