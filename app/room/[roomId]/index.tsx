import { useLocalSearchParams } from "expo-router";
import { ThemedView, ThemedText } from "../../../components";
import { commonStyles } from "../../../constants/Styles";

export default function RoomIndex() {
  const { roomId } = useLocalSearchParams();

  return (
    <ThemedView style={commonStyles.center}>
      <ThemedText>Chat for Room ID:</ThemedText>
      <ThemedText>{roomId}</ThemedText>
    </ThemedView>
  );
}
