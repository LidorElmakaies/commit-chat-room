import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, useColorScheme } from "react-native";
import ThemedButton from "../../components/buttons/ThemedButton";
import ThemedPasswordInput from "../../components/inputs/ThemedPasswordInput";
import ThemedUsernameInput from "../../components/inputs/ThemedUsernameInput";
import ThemedCard from "../../components/ThemedCard";
import ThemedView from "../../components/ThemedView";
import { Colors } from "../../constants/Colors";
import { matrixService } from "../../src/services/matrix/MatrixService";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await matrixService.login(data.username, data.password);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedCard style={styles.card}>
        <Text style={[styles.title, { color: theme.primary }]}>
          Welcome Back
        </Text>
        <Text style={styles.subtitle}>Sign in to your Matrix account</Text>

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
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
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
});
