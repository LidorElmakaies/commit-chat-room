import { MatrixClient } from "matrix-js-sdk";
// Direct import for types that are not exported by main package in this version
import { MediaStream } from "@livekit/react-native-webrtc";
import {
  LocalParticipant,
  RemoteParticipant,
  Room,
  RoomEvent,
  TrackPublication,
} from "livekit-client";
import { MatrixRTCSession } from "matrix-js-sdk/lib/matrixrtc/MatrixRTCSession";
import { MatrixRTCSessionManager } from "matrix-js-sdk/lib/matrixrtc/MatrixRTCSessionManager";
import { BehaviorSubject, Observable } from "rxjs";
import { LiveKitConfig } from "../../config";
import { UserMediaStream } from "../../types";

/**
 * Simple console logger that implements Matrix Logger interface
 */

/**
 * CallManager
 * Handles Matrix Signaling + LiveKit Media.
 */
export class CallManager {
  private activeSession: MatrixRTCSession | null = null;
  private liveKitRoom: Room | null = null;
  private streams$ = new BehaviorSubject<UserMediaStream[]>([]);

  constructor(private client: MatrixClient) {
    const consoleLogger = {
      ...console,
      getChild: () => consoleLogger, // Return self for child loggers
    };
    if (!this.client.matrixRTC) {
      (this.client as any).matrixRTC = new MatrixRTCSessionManager(
        consoleLogger,
        this.client
      );
    }
  }

  public getCallStreams$(): Observable<UserMediaStream[]> {
    return this.streams$.asObservable();
  }

  /**
   * Joins a call using LiveKit
   */
  public async joinCall(roomId: string) {
    await this.leaveCall();

    const room = this.client.getRoom(roomId);
    if (!room) throw new Error("Room not found");

    console.log(`[CallManager] Joining call in ${roomId}`);

    try {
      // 1. Join Matrix Signaling (Presence)
      const rtcManager = (this.client as any)
        .matrixRTC as MatrixRTCSessionManager;
      this.activeSession = rtcManager.getRoomSession(room);
      this.activeSession.joinRoomSession([], undefined, {});

      // 2. Connect to LiveKit (Media)
      // Note: In production, fetch this from your backend!
      // We are mocking it here for testing using the hardcoded logic below.
      const token = await this.fetchLiveKitToken();

      this.liveKitRoom = new Room();

      await this.liveKitRoom.connect(LiveKitConfig.serverUrl, token);
      console.log(
        "[CallManager] Connected to LiveKit:",
        LiveKitConfig.serverUrl
      );

      // 3. Publish Local Media
      await this.liveKitRoom.localParticipant.enableCameraAndMicrophone();

      // 4. Setup Listeners
      this.setupLiveKitListeners();

      this.updateStreamState();

      return { callId: roomId, roomId };
    } catch (error) {
      console.error("[CallManager] Join failed:", error);
      this.leaveCall();
      throw error;
    }
  }

  public async leaveCall() {
    // Leave LiveKit
    if (this.liveKitRoom) {
      await this.liveKitRoom.disconnect();
      this.liveKitRoom = null;
    }

    // Leave Matrix Signaling
    if (this.activeSession) {
      try {
        await this.activeSession.leaveRoomSession();
        this.activeSession.removeAllListeners();
      } catch (e) {
        console.warn("[CallManager] Error leaving session:", e);
      }
      this.activeSession = null;
    }

    this.streams$.next([]);
  }

  public toggleMic(muted: boolean) {
    if (this.liveKitRoom?.localParticipant) {
      this.liveKitRoom.localParticipant.setMicrophoneEnabled(!muted);
    }
  }

  public toggleCam(muted: boolean) {
    if (this.liveKitRoom?.localParticipant) {
      this.liveKitRoom.localParticipant.setCameraEnabled(!muted);
    }
  }

  private setupLiveKitListeners() {
    if (!this.liveKitRoom) return;

    this.liveKitRoom
      .on(RoomEvent.ParticipantConnected, () => this.updateStreamState())
      .on(RoomEvent.ParticipantDisconnected, () => this.updateStreamState())
      .on(RoomEvent.TrackSubscribed, () => this.updateStreamState())
      .on(RoomEvent.TrackUnsubscribed, () => this.updateStreamState())
      .on(RoomEvent.LocalTrackPublished, () => this.updateStreamState())
      .on(RoomEvent.LocalTrackUnpublished, () => this.updateStreamState());
  }

  private updateStreamState() {
    if (!this.liveKitRoom) return;

    const streams: UserMediaStream[] = [];

    const remoteParticipants = Array.from(
      this.liveKitRoom.remoteParticipants.values()
    ) as RemoteParticipant[];

    const participants = [
      this.liveKitRoom.localParticipant,
      ...remoteParticipants,
    ];

    participants.forEach((p) => {
      // Find video tracks
      const videoTrack = Array.from<TrackPublication>(
        p.videoTrackPublications.values()
      ).find((pub) => pub.track && !pub.isMuted)?.track;

      if (videoTrack) {
        streams.push({
          stream: videoTrack.mediaStream as unknown as MediaStream,
          userId: p.identity,
          isLocal: p instanceof LocalParticipant,
        });
      } else if (p instanceof LocalParticipant) {
        // Placeholder for local user if video is muted/loading
        streams.push({
          stream: new MediaStream(),
          userId: p.identity,
          isLocal: true,
        });
      }
    });

    this.streams$.next(streams);
  }

  // MOCK: Token mapping for TESTING ONLY (24h validity).
  // In production, your backend must generate this to keep secrets safe.
  private async fetchLiveKitToken(): Promise<string> {
    const TOKEN_MAP: Record<string, string> = {
      "@lidor-the-programmer:matrix.org":
        "eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6IlRlc3QxIn0sImlzcyI6IkFQSUFaUFJFdFJiOEQ2RyIsImV4cCI6MTc2NTQ2Mjg2MCwibmJmIjowLCJzdWIiOiJAbGlkb3ItdGhlLXByb2dyYW1tZXI6bWF0cml4Lm9yZyJ9.VjOy7HvURRJ8wXJcw4iitLwNOMh9IohR1TgI7CZ8W0k",
      "@lidor-the-programmer2:matrix.org":
        "eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6IlRlc3QxIn0sImlzcyI6IkFQSUFaUFJFdFJiOEQ2RyIsImV4cCI6MTc2NTQ2Mjg2MCwibmJmIjowLCJzdWIiOiJAbGlkb3ItdGhlLXByb2dyYW1tZXIyOm1hdHJpeC5vcmcifQ.Tt76MYsuUBURlkgigimYc1e3r3y1OZyBx5u9JVpuVqU",
    };

    const userId = this.client.getUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }

    const token = TOKEN_MAP[userId];
    if (!token) {
      throw new Error(`No LiveKit token configured for user: ${userId}`);
    }

    console.log(`[CallManager] Using token for: ${userId}`);
    return token;
  }
}
