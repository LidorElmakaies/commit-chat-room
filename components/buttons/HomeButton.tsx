import React from "react";
import {
  TouchableOpacity,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

interface HomeButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function HomeButton({ onPress, style }: HomeButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <MaterialIcons name="home" size={24} color={themeColors.text} />
    </TouchableOpacity>
  );
}

