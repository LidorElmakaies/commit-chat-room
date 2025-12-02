import React from "react";
import { useTheme } from "@react-navigation/native";
import ThemedText from "./ThemedText";
import { themedErrorMessageStyles } from "../../constants/ComponentStyles";

interface ThemedErrorMessageProps {
  message?: string;
}

export default function ThemedErrorMessage({
  message,
}: ThemedErrorMessageProps) {
  const { colors } = useTheme();

  if (!message) {
    return null;
  }

  return (
    <ThemedText
      style={[
        themedErrorMessageStyles.errorText,
        { color: colors.notification },
      ]}
    >
      {message}
    </ThemedText>
  );
}
