import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { ThemedView } from "../../../components";
import { commonStyles } from "../../../constants/Styles";
import { useAppDispatch } from "../../../src/store";
import { selectRoom, deselectRoom } from "../../../src/store/slices/roomSlice";

export default function RoomIndex() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (roomId) {
      dispatch(selectRoom(roomId));

      return () => {
        dispatch(deselectRoom());
      };
    }
  }, [roomId, dispatch]);

  return <ThemedView style={commonStyles.container}></ThemedView>;
}
