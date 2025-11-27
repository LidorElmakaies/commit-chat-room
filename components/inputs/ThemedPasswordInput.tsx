import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import ThemedTextInput, { ThemedTextInputProps } from "./ThemedTextInput";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";

interface SmartInputProps extends Omit<ThemedTextInputProps, "value" | "onChangeText"> {
  control: Control<any>;
  name: string;
  rules?: RegisterOptions;
}

export default function ThemedPasswordInput({ control, name, rules, ...props }: SmartInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  const toggleVisibility = () => setIsVisible(!isVisible);

  const defaultRules: RegisterOptions = {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{ ...defaultRules, ...rules }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <ThemedTextInput
          {...props}
          label={props.label || "Password"}
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          error={error?.message}
          secureTextEntry={!isVisible}
          rightElement={
            <TouchableOpacity onPress={toggleVisibility} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Ionicons
                name={isVisible ? "eye-off" : "eye"}
                size={20}
                color={theme.iconColor}
              />
            </TouchableOpacity>
          }
        />
      )}
    />
  );
}