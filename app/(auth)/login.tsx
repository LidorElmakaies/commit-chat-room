import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, useColorScheme } from "react-native";
import ThemedButton from "../../components/buttons/ThemedButton";
import ThemedPasswordInput from "../../components/inputs/ThemedPasswordInput";
import ThemedUsernameInput from "../../components/inputs/ThemedUsernameInput";
import ThemedCard from "../../components/ThemedCard";
import ThemedView from "../../components/ThemedView";
import { Colors } from "../../constants/Colors";
import { commonStyles } from "../../constants/Styles";
import Typography from "../../constants/Typography";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { clearError, loginUser } from "../../src/store/slices/matrixAuthSlice";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.matrixAuth
  );

  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error, [
        { text: "OK", onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [dispatch, error]);

  const onSubmit = (data: any) => {
    dispatch(loginUser({ username: data.username, password: data.password }));
  };

  return (
    <ThemedView style={commonStyles.container}>
      <ThemedCard style={styles.card}>
        <Text style={[Typography.title, { color: theme.primary }]}>
          Welcome Back
        </Text>
        <Text style={[Typography.subtitle, { color: theme.textSecondary }]}>
          Sign in to continue
        </Text>

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
          loading={loading}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
