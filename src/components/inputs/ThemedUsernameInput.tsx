import React from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import ThemedTextInput, { ThemedTextInputProps } from "./ThemedTextInput";

interface SmartInputProps extends Omit<ThemedTextInputProps, "value" | "onChangeText"> {
  control: Control<any>;
  name: string;
  rules?: RegisterOptions;
}

export default function ThemedUsernameInput({ control, name, rules, ...props }: SmartInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: "Username is required", ...rules }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <ThemedTextInput
          {...props}
          label={props.label || "Username"}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          error={error?.message}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="@username:matrix.org"
        />
      )}
    />
  );
}