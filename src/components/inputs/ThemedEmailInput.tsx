import React from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import ThemedTextInput, { ThemedTextInputProps } from "./ThemedTextInput";

interface SmartInputProps
  extends Omit<ThemedTextInputProps, "value" | "onChangeText"> {
  control: Control<any>;
  name: string;
  rules?: RegisterOptions;
}

export default function ThemedEmailInput({
  control,
  name,
  rules,
  ...props
}: SmartInputProps) {
  const defaultRules: RegisterOptions = {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{ ...defaultRules, ...rules }}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <ThemedTextInput
          {...props}
          label={props.label || "Email"}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          error={error?.message}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="user@example.com"
        />
      )}
    />
  );
}
