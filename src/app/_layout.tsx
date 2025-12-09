import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "../../polyfills";
import { persistor, store } from "../store";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="room/[roomId]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
