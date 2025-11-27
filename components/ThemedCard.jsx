import { StyleSheet, useColorScheme, View } from "react-native";
import Colors from "../constants/Colors";

const ThemedCard = ({ style, children, ...props }) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View
      style={[{ backgroundColor: theme.uiBackground }, style, styles.card]}
      {...props}
    >
      {children}
    </View>
  );
};

export default ThemedCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    // Soft, modern shadow that matches the rest of the UI
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});
