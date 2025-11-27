import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  useColorScheme,
} from "react-native";
import { Colors } from "../../constants/Colors";

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export default function ThemedButton({
  title,
  loading = false,
  variant = "primary",
  style,
  disabled,
  ...props
}: ThemedButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  const backgroundColor =
    variant === "primary"
      ? theme.primary
      : variant === "secondary"
      ? theme.textSecondary
      : "transparent";

  const textColor = variant === "outline" ? theme.primary : "#FFF";
  const borderWidth = variant === "outline" ? 1 : 0;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderWidth, borderColor: theme.primary },
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.6,
  },
});
