import React, { useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ThemedButton,
  ThemedCard,
  ThemedText,
  ThemedView,
} from "../../../components";
import { VideoParticipantCard } from "../../../components/video";
import { commonStyles } from "../../../constants/Styles";
import { useCall } from "../../../hooks/useCall";
import { useRoomGuard } from "../../../hooks/useRoomGuard";
import { useAppDispatch } from "../../../store";
import { clearCallError } from "../../../store/slices/callSlice";
import { FetchState } from "../../../types";

export default function CallScreen() {
  const room = useRoomGuard(); // Reads currentSelectedRoomId from Redux internally
  const dispatch = useAppDispatch();

  // Use the custom hook to manage call state and streams
  const { streams, isJoined, loading, joinCall, leaveCall } = useCall(); // Reads currentSelectedRoomId from Redux internally

  // Clear error state when entering this screen (fresh state)
  useEffect(() => {
    dispatch(clearCallError());
  }, [dispatch]);

  const handleJoinCall = async () => {
    try {
      await joinCall();
    } catch (err: any) {
      console.error("[CallScreen] Failed to join call:", err);
    }
  };

  const handleLeaveCall = async () => {
    try {
      await leaveCall();
    } catch (err: any) {
      console.error("[CallScreen] Failed to leave call:", err);
    }
  };

  if (!room) {
    return null;
  }

  return (
    <ThemedView style={[commonStyles.center, styles.container]}>
      <View style={styles.controls}>
        {!isJoined ? (
          <ThemedButton
            title="Join Call"
            onPress={handleJoinCall}
            variant="success"
            style={styles.callButton}
            loading={loading === FetchState.Pending}
          />
        ) : (
          <ThemedButton
            title="Leave Call"
            onPress={handleLeaveCall}
            variant="danger"
            style={styles.callButton}
            loading={loading === FetchState.Pending}
          />
        )}
      </View>

      <ThemedCard style={styles.videoContainer}>
        {streams.length === 0 && !isJoined ? (
          <View style={styles.emptyState}>
            <ThemedText>Join to start video</ThemedText>
          </View>
        ) : (
          <FlatList
            data={streams}
            keyExtractor={(item) => item.userId}
            numColumns={2}
            key={"2-columns"} // Force re-render if numColumns changes
            contentContainerStyle={styles.streamList}
            columnWrapperStyle={
              streams.length > 1 ? styles.streamRow : undefined
            }
            renderItem={({ item }) => <VideoParticipantCard stream={item} />}
          />
        )}
      </ThemedCard>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  controls: {
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  videoContainer: {
    flex: 1,
    width: "100%",
  },
  callButton: {
    minWidth: 150,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  streamList: {
    paddingBottom: 20,
  },
  streamRow: {
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
});
