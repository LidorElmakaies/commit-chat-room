import React from "react";
import { Text, TextProps, useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";

export interface ThemedTextProps extends TextProps {
  type?: "default" | "secondary" | "link";
}

export default function ThemedText({
  style,
  type = "default",
  ...props
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];

  const color =
    type === "secondary"
      ? themeColors.textSecondary
      : type === "link"
      ? themeColors.primary
      : themeColors.text;

  return <Text style={[{ color }, style]} {...props} />;
}
