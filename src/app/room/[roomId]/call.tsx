import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { mediaDevices, MediaStream } from "react-native-webrtc";
import { ThemedText, ThemedView } from "../../../components";
import { VideoStream } from "../../../components/video";
import { commonStyles } from "../../../constants/Styles";
import { useRoomGuard } from "../../../hooks/useRoomGuard";
import { useAppSelector } from "../../../store";

export default function CallScreen() {
  const { currentSelectedRoomId } = useAppSelector((state) => state.room);
  const room = useRoomGuard(currentSelectedRoomId);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startLocalStream = async () => {
      try {
        console.log("[CallScreen] Requesting user media...");
        const mediaStream = (await mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: "user",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            frameRate: { min: 15, ideal: 30, max: 60 },
          },
        })) as MediaStream;

        console.log("[CallScreen] User media acquired:", mediaStream.id);
        stream = mediaStream;
        setLocalStream(mediaStream);
      } catch (err) {
        console.error("[CallScreen] Error acquiring user media:", err);
        setError("Failed to access camera/microphone");
      }
    };

    if (currentSelectedRoomId) {
      startLocalStream();
    }

    return () => {
      if (stream) {
        console.log("[CallScreen] Stopping local stream tracks");
        stream.getTracks().forEach((track) => {
          track.stop();
          track.release();
        });
      }
    };
  }, [currentSelectedRoomId]);

  if (!room) {
    // Render nothing while the guard redirects
    return null;
  }

  return (
    <ThemedView style={[commonStyles.center, styles.container]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Call for Room: {room.name}</ThemedText>
        <ThemedText>{currentSelectedRoomId}</ThemedText>
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      </View>

      <View style={styles.videoContainer}>
        <VideoStream stream={localStream} isLocal={true} objectFit="cover" />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  videoContainer: {
    width: "100%",
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});
