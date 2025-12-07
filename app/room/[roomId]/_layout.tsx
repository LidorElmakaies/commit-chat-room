import { Tabs, useRouter } from "expo-router";
import { View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppDispatch } from "../../../src/store";
import { logout } from "../../../src/store/slices/matrixAuthSlice";
import { HomeButton, LogoutButton } from "../../../components";

export default function RoomTabLayout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

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
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          headerRight: headerRight,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="comments" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="call"
        options={{
          title: "Call",
          headerRight: headerRight,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="call" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
