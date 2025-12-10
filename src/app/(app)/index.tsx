import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  ThemedButton,
  ThemedCard,
  ThemedErrorMessage,
  ThemedList,
  ThemedTextInput,
  ThemedView,
} from "../../components";
import { commonStyles } from "../../constants/Styles";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearCallError } from "../../store/slices/callSlice";
import { clearRoomError, joinRoom } from "../../store/slices/roomSlice";
import { FetchState } from "../../types";

const JoinRoomScreen = () => {
  const [roomId, setRoomId] = useState("");
  const { rooms, loading, error } = useAppSelector((state) => state.room);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Clear all errors when entering home screen (fresh state)
  useEffect(() => {
    dispatch(clearRoomError());
    dispatch(clearCallError());
  }, [dispatch]);

  const handleJoinRoom = async () => {
    if (roomId.trim()) {
      const resultAction = await dispatch(joinRoom(roomId.trim()));
      if (joinRoom.fulfilled.match(resultAction)) {
        const joinedRoomId = resultAction.payload.roomId;
        router.replace(`/room/${joinedRoomId}`);
      }
    }
  };

  const handleSelectRoom = (selectedRoomId: string) => {
    router.replace(`/room/${selectedRoomId}`);
  };

  return (
    <ThemedView style={commonStyles.container}>
      <ThemedCard style={styles.card}>
        <View style={styles.inputContainer}>
          <ThemedTextInput
            placeholder="Enter Room ID"
            value={roomId}
            onChangeText={setRoomId}
            containerStyle={{ flex: 1, marginRight: 8, marginBottom: 0 }}
          />
          <ThemedButton
            title="Join"
            onPress={handleJoinRoom}
            loading={loading === FetchState.Pending}
          />
        </View>
        <View style={styles.listContainer}>
          {loading === FetchState.Pending && <ActivityIndicator />}
          {loading !== FetchState.Pending && (
            <ThemedErrorMessage message={error ?? undefined} />
          )}
          {loading !== FetchState.Pending && !error && (
            <ThemedList
              data={Object.values(rooms).map((room) => ({
                label: room.name,
                onItemPress: () => handleSelectRoom(room.roomId),
              }))}
            />
          )}
        </View>
      </ThemedCard>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "90%",
    flex: 1,
    alignItems: "stretch",
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default JoinRoomScreen;
