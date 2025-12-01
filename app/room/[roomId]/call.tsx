import { useLocalSearchParams } from "expo-router";
import { ThemedView, ThemedText } from "../../../components";
import { commonStyles } from "../../../constants/Styles";

export default function CallScreen() {
  const { roomId } = useLocalSearchParams();

  return (
    <ThemedView style={commonStyles.center}>
      <ThemedText>Call for Room ID:</ThemedText>
      <ThemedText>{roomId}</ThemedText>
    </ThemedView>
  );
}
