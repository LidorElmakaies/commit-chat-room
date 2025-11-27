import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { Colors } from "../../constants/Colors";

export interface ThemedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode; // For icons (like eye toggle)
}

export default function ThemedTextInput({
  label,
  error,
  style,
  containerStyle,
  rightElement,
  ...props
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.uiBackground,
              borderColor: error ? theme.error : theme.border,
              color: theme.text,
              paddingRight: rightElement ? 40 : 12, // Space for icon
            },
            style,
          ]}
          placeholderTextColor={theme.textSecondary}
          {...props}
        />
        {rightElement && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    width: "100%",
  },
  rightElement: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
