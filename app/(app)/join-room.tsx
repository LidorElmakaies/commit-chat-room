import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  ThemedView,
  ThemedList,
  ThemedTextInput,
  ThemedButton,
  ThemedErrorMessage,
} from "../../components";
import { useAppDispatch, useAppSelector } from "../../src/store";
import {
  fetchJoinedRooms,
  joinRoom,
  selectRoom,
} from "../../src/store/slices/roomSlice";
import { LoadingState } from "../../src/types";
import { commonStyles } from "@/constants/Styles";

const JoinRoomScreen = () => {
  const [roomId, setRoomId] = useState("");
  const { joinedRooms, loading, error } = useAppSelector((state) => state.room);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchJoinedRooms());
  }, [dispatch]);

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      dispatch(joinRoom(roomId.trim()));
    }
  };

  const handleSelectRoom = (selectedRoomId: string) => {
    dispatch(selectRoom(selectedRoomId));
    // Here you would typically navigate to the room, but for now we'll just log it
    console.log("Selected room:", selectedRoomId);
  };

  return (
    <ThemedView style={commonStyles.container}>
      <ThemedView style={styles.inputContainer}>
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
      </ThemedView>
      <ThemedView style={styles.listContainer}>
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
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
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
