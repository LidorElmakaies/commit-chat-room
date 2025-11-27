import { StyleSheet, Text } from "react-native";
import ThemedView from "../components/ThemedView";
export default function Home() {
  return (
    <ThemedView style={styles.container}>
      <Text>Home Screen</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
