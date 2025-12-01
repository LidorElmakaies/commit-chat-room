import React from "react";
import { View, ViewProps, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { themedCardStyles } from "../constants/ComponentStyles";

export default function ThemedCard({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        { backgroundColor: theme.uiBackground },
        themedCardStyles.card,
        style,
      ]}
      {...props}
    />
  );
}
