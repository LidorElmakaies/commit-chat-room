import { MediaStream, RTCView } from "@livekit/react-native-webrtc";
import React from "react";
import { StyleSheet, useColorScheme, View, ViewStyle } from "react-native";
import { Colors } from "../../constants/Colors";

interface VideoStreamProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  objectFit?: "contain" | "cover";
  style?: ViewStyle;
}

/**
 * VideoStream Component
 *
 * Renders a WebRTC video stream using @livekit/react-native-webrtc's RTCView.
 * Handles stream URL conversion and local mirroring.
 */
export default function VideoStream({
  stream,
  isLocal = false,
  objectFit = "cover",
  style,
}: VideoStreamProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  if (!stream) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.videoPlaceholder },
          style,
        ]}
      />
    );
  }

  return (
    <RTCView
      streamURL={stream.toURL()}
      mirror={isLocal}
      objectFit={objectFit}
      style={[
        styles.container,
        { backgroundColor: theme.videoBackground },
        style,
      ]}
      zOrder={isLocal ? 1 : 0}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});
