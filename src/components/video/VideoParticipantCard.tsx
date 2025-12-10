import React from "react";
import { Text, View, ViewStyle } from "react-native";
import { themedVideoStyles } from "../../constants/ComponentStyles";
import { UserMediaStream } from "../../types";
import VideoStream from "./VideoStream";

interface VideoParticipantCardProps {
  stream: UserMediaStream;
  style?: ViewStyle;
}

/**
 * VideoParticipantCard Component
 *
 * Displays a participant's video stream with their name overlay.
 * Shows "You" for local streams, or the user ID for remote participants.
 */
export default function VideoParticipantCard({
  stream,
  style,
}: VideoParticipantCardProps) {
  return (
    <View style={[themedVideoStyles.participantCard, style]}>
      <VideoStream
        stream={stream.stream}
        isLocal={stream.isLocal}
        objectFit="cover"
        style={themedVideoStyles.videoStream}
      />
      <View style={themedVideoStyles.userInfoOverlay}>
        <Text style={themedVideoStyles.userNameText}>
          {stream.isLocal ? "You" : stream.userId}
        </Text>
      </View>
    </View>
  );
}
