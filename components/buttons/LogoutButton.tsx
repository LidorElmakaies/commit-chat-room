import React from "react";
import {
  TouchableOpacity,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

interface LogoutButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function LogoutButton({ onPress, style }: LogoutButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <MaterialIcons name="logout" size={24} color={themeColors.text} />
    </TouchableOpacity>
  );
}
