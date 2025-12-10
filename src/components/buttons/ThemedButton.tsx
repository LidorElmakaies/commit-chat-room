import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { themedButtonStyles } from "../../constants/ComponentStyles";

export type ButtonVariant = "primary" | "success" | "danger";

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
}

export default function ThemedButton({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  loading = false,
  ...otherProps
}: ThemedButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case "success":
        return theme.success;
      case "danger":
        return theme.danger;
      case "primary":
      default:
        return theme.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        themedButtonStyles.button,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color={theme.buttonText} />
      ) : (
        <Text
          style={[
            themedButtonStyles.text,
            { color: theme.buttonText },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
