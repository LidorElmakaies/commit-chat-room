import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text } from "react-native";
import { ThemedView } from "../../components";
import ThemedButton from "../../components/buttons/ThemedButton";
import { commonStyles } from "../../constants/Styles";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { logoutUser } from "../../src/store/slices/matrixAuthSlice";

const HomeScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.matrixAuth.isAuthenticated
  );

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, router]);

  return (
    <ThemedView style={commonStyles.container}>
      <Text>Home Screen</Text>
      <ThemedButton title="Logout" onPress={handleLogout} />
    </ThemedView>
  );
};

export default HomeScreen;
