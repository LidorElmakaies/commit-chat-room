import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { themedButtonStyles } from "../../constants/ComponentStyles";

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
}

export default function ThemedButton({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  ...otherProps
}: ThemedButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        themedButtonStyles.button,
        { backgroundColor: colors.primary },
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color={colors.card} />
      ) : (
        <Text
          style={[
            themedButtonStyles.text,
            { color: colors.card },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
