import { ThemedText, ThemedView } from "../../../components";
import { commonStyles } from "../../../constants/Styles";
import { useRoomGuard } from "../../../hooks/useRoomGuard";
import { useAppSelector } from "../../../store";

export default function CallScreen() {
  const { currentSelectedRoomId } = useAppSelector((state) => state.room);
  const room = useRoomGuard(currentSelectedRoomId);

  if (!room) {
    // Render nothing while the guard redirects
    return null;
  }

  return (
    <ThemedView style={commonStyles.center}>
      <ThemedText>Call for Room: {room.name}</ThemedText>
      <ThemedText>{currentSelectedRoomId}</ThemedText>
    </ThemedView>
  );
}
