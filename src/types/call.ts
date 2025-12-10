import { MediaStream } from "@livekit/react-native-webrtc";

/**
 * Custom types for video call streams
 * Abstracts away Matrix-specific objects
 */

export interface UserMediaStream {
  stream: MediaStream;
  userId: string;
  isLocal: boolean;
}
