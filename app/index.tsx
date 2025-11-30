import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { commonStyles } from "../constants/Styles";
import { useAppDispatch, useAppSelector } from "../src/store";
import { restoreSession } from "../src/store/slices/matrixAuthSlice";

/**
 * This is the main entry point for the app.
 * It is responsible for checking the user's authentication status and
 * redirecting them to the correct screen.
 */
export default function Index() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isAuthenticated, loading, accessToken, userId, deviceId } =
    useAppSelector((state) => state.matrixAuth);

  // Attempt to restore session on initial load
  useEffect(() => {
    if (accessToken && userId && deviceId) {
      dispatch(restoreSession({ userId, accessToken, deviceId }));
    }
  }, []); // Run only once

  // React to changes in authentication state
  useEffect(() => {
    // Wait until the loading process (session restoration) is complete
    if (loading) {
      return;
    }

    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, loading]);

  // Show a loading spinner while we check for a session
  return (
    <View style={commonStyles.center}>
      <ActivityIndicator />
    </View>
  );
}
