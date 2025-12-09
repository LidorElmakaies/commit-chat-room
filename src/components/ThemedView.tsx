import React from "react";
import { View, ViewProps, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

export default function ThemedView({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={[{ backgroundColor: theme.background }, style]} {...props} />
  );
}
