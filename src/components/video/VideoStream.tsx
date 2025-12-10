import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { MediaStream, RTCView } from "react-native-webrtc";

interface VideoStreamProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  objectFit?: "contain" | "cover";
  style?: ViewStyle;
}

/**
 * VideoStream Component
 *
 * Renders a WebRTC video stream using react-native-webrtc's RTCView.
 * Handles stream URL conversion and local mirroring.
 */
export default function VideoStream({
  stream,
  isLocal = false,
  objectFit = "cover",
  style,
}: VideoStreamProps) {
  useEffect(() => {
    if (stream) {
      console.log(
        `[VideoStream] Rendering stream: ${stream.toURL()}, isLocal: ${isLocal}`
      );
    }
  }, [stream, isLocal]);

  if (!stream) {
    return <View style={[styles.container, styles.placeholder, style]} />;
  }

  return (
    <RTCView
      streamURL={stream.toURL()}
      mirror={isLocal}
      objectFit={objectFit}
      style={[styles.container, style]}
      zOrder={isLocal ? 1 : 0}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000", // Black background for video
  },
  placeholder: {
    backgroundColor: "#1a1a1a",
  },
});
