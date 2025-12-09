import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { HomeButton, LogoutButton } from "../../../components";
import { useProtectedRoute } from "../../../hooks/useProtectedRoute";
import { useRoomGuard } from "../../../hooks/useRoomGuard";
import { useAppDispatch } from "../../../store";
import { logout } from "../../../store/slices/matrixAuthSlice";
import { deselectRoom, selectRoom } from "../../../store/slices/roomSlice";

export default function RoomTabLayout() {
  useProtectedRoute(); // Ensure user is authenticated before proceeding

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  // Guard the route at the highest level.
  // This ensures we don't try to select a room that doesn't exist.
  const room = useRoomGuard(roomId);

  useEffect(() => {
    // Only dispatch actions if the room is valid.
    if (room) {
      dispatch(selectRoom(room.roomId));

      return () => {
        dispatch(deselectRoom());
      };
    }
  }, [room, dispatch]);

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

  // If the room is not valid, the guard is redirecting.
  // Render nothing to prevent the tabs from showing during the redirect.
  if (!room) {
    return null;
  }

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
