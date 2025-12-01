import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet } from "react-native";
import {
  ThemedButton,
  ThemedPasswordInput,
  ThemedUsernameInput,
  ThemedCard,
  ThemedView,
  ThemedText,
} from "../../components";
import { commonStyles } from "../../constants/Styles";
import Typography from "../../constants/Typography";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { clearError, loginUser } from "../../src/store/slices/matrixAuthSlice";
import { LoadingState } from "@/src/types";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.matrixAuth);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

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
          loading={loading === LoadingState.Pending}
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
