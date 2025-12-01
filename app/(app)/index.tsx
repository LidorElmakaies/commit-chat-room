import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ThemedView,
  ThemedTextInput,
  ThemedButton,
  ThemedList,
  ThemedErrorMessage,
  ThemedCard,
} from "../../components";
import {
  fetchJoinedRooms,
  joinRoom,
  selectRoom,
} from "../../src/store/slices/roomSlice";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { LoadingState } from "../../src/types";
import { commonStyles } from "../../constants/Styles";

const JoinRoomScreen = () => {
  const [roomId, setRoomId] = useState("");
  const { joinedRooms, loading, error } = useAppSelector((state) => state.room);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchJoinedRooms());
    }, [dispatch])
  );

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
    dispatch(selectRoom(selectedRoomId));
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
            loading={loading === LoadingState.Pending}
          />
        </View>
        <View style={styles.listContainer}>
          {loading === LoadingState.Pending && <ActivityIndicator />}
          {loading !== LoadingState.Pending && (
            <ThemedErrorMessage message={error ?? undefined} />
          )}
          {loading !== LoadingState.Pending && !error && (
            <ThemedList
              data={Object.values(joinedRooms).map((room) => ({
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
