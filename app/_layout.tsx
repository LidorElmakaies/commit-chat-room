import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
const RootLayout = () => {
  const colorScheme = useColorScheme() ?? "light";
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
          },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
};

export default RootLayout;
