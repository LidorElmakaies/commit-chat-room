import { LoginState } from "@/src/types";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet } from "react-native";
import {
  ThemedButton,
  ThemedCard,
  ThemedPasswordInput,
  ThemedText,
  ThemedUsernameInput,
  ThemedView,
} from "../../components";
import { commonStyles } from "../../constants/Styles";
import { Typography } from "../../constants/Typography";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearError, login } from "../../store/slices/matrixAuthSlice";

export default function LoginScreen() {
  useAuthGuard(); // Guard the route

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.matrixAuth);
  const router = useRouter();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Clear error state when entering this screen (fresh state)
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // This logic is now handled by the useAuthGuard hook
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     router.replace("/(app)");
  //   }
  // }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error, [
        { text: "OK", onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [dispatch, error]);

  const onSubmit = (data: any) => {
    dispatch(login({ username: data.username, password: data.password }));
  };

  return (
    <ThemedView style={commonStyles.center}>
      <ThemedCard style={styles.card}>
        <ThemedText style={[Typography.title]}>Welcome Back</ThemedText>
        <ThemedText style={[Typography.subtitle]} type="secondary">
          Sign in to continue
        </ThemedText>

        <ThemedUsernameInput
          control={control}
          name="username"
          label="Username"
        />

        <ThemedPasswordInput
          control={control}
          name="password"
          label="Password"
        />

        <ThemedButton
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={loading === LoginState.Pending}
          style={styles.button}
        />
      </ThemedCard>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  button: {
    marginTop: 10,
  },
});
