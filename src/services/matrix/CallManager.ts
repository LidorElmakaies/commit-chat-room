import {
  GroupCallEvent,
  GroupCallIntent,
  GroupCallType,
  MatrixClient,
} from "matrix-js-sdk";
import { Observable, Subject } from "rxjs";
import { UserMediaStream } from "../../types";

/**
 * CallManager
 *
 * Handles all group call functionality for Matrix rooms.
 * Manages call lifecycle, stream observables, and mute states.
 */
export class CallManager {
  private _currentCallRoomId: string | null = null;
  private _currentCallStreams$: Subject<UserMediaStream[]> | null = null;
  private _currentGroupCall: any | null = null; // Reference to the active GroupCall

  constructor(private client: MatrixClient) {}

  /**
   * Join or create a video call in a room
   * Uses MatrixRTC (Group Calls) for room-based video calls
   * If already in a call in another room, leaves that call first
   */
  public async joinCall(
    roomId: string,
    video: boolean = true,
    audioMuted: boolean = true,
    videoMuted: boolean = true
  ): Promise<{ callId: string; roomId: string }> {
    // Wait for the room to be ready for group calls (proper SDK API)
    // This ensures the room state is processed and group calls can be created
    try {
      await this.client.waitUntilRoomReadyForGroupCalls(roomId);
    } catch (error: any) {
      console.warn(
        `[CallManager] waitUntilRoomReadyForGroupCalls failed:`,
        error.message
      );
      // Continue anyway - createGroupCall will handle the error if room isn't ready
    }

    // If already in a call in a different room, leave it first
    if (this._currentCallRoomId && this._currentCallRoomId !== roomId) {
      console.log(
        `[CallManager] Already in call for room ${this._currentCallRoomId}, leaving before joining ${roomId}`
      );
      await this.leaveCall();
    }

    const room = this.client.getRoom(roomId);
    if (!room) {
      throw new Error(
        `Room ${roomId} not found. Make sure you've joined the room first.`
      );
    }

    console.log(
      `[CallManager] Joining ${
        video ? "video" : "audio"
      } call in room: ${roomId}`
    );

    try {
      // Create new observable for this call (per-call lifecycle)
      // Clean up any existing observable first
      if (this._currentCallStreams$) {
        this._currentCallStreams$.complete();
        this._currentCallStreams$ = null;
      }
      this._currentCallStreams$ = new Subject<UserMediaStream[]>();
      console.log(
        `[CallManager] Created new stream observable for room ${roomId}`
      );

      // Try to get or create a group call (MatrixRTC - modern standard for room calls)
      let groupCall: any = null;

      // First, try to get existing group call for this room
      try {
        groupCall = this.client.getGroupCallForRoom(roomId);
        if (groupCall) {
          console.log(
            `[CallManager] Found existing group call for room ${roomId}`
          );
        }
      } catch (error: any) {
        // getGroupCallForRoom might throw if group calls manager isn't ready
        // This can happen even after waitUntilRoomReadyForGroupCalls if there's a race condition
        console.log(
          `[CallManager] Could not get existing group call:`,
          error.message
        );
      }

      // If no existing call, create a new one
      if (!groupCall) {
        console.log(
          `[CallManager] Creating new group call for room: ${roomId}`
        );
        // Parameters: roomId, type, isPtt (push-to-talk), intent, dataChannelsEnabled, dataChannelOptions
        groupCall = await this.client.createGroupCall(
          roomId,
          video ? GroupCallType.Video : GroupCallType.Voice, // type
          false, // isPtt (push-to-talk) - false for normal calls
          GroupCallIntent.Room, // intent - Room for room-based calls
          false // dataChannelsEnabled - optional, default false
        );
        console.log(`[CallManager] Group call created successfully`);
      }

      if (!groupCall) {
        // Clean up observable if call creation failed
        if (this._currentCallStreams$) {
          this._currentCallStreams$.complete();
          this._currentCallStreams$ = null;
        }
        throw new Error(
          "Failed to create or get group call. Group calls may not be supported."
        );
      }

      // Join/enter the group call
      await groupCall.enter();
      console.log(`[CallManager] Joined group call successfully`);

      // Set mute states based on parameters
      await groupCall.setMicrophoneMuted(audioMuted);
      await groupCall.setLocalVideoMuted(videoMuted);
      console.log(
        `[CallManager] Audio muted: ${audioMuted}, Video muted: ${videoMuted}`
      );

      // Set up stream observable for this room
      this.setupCallStreamObservable(roomId, groupCall);
      this._currentCallRoomId = roomId;
      this._currentGroupCall = groupCall;

      return {
        callId: groupCall.groupCallId,
        roomId,
      };
    } catch (error: any) {
      // Clean up observable if join failed
      this.clearCallState();
      console.error("[CallManager] Error joining call:", error);
      throw error;
    }
  }

  /**
   * Leave/end the current active call
   */
  public async leaveCall(): Promise<void> {
    if (!this._currentCallRoomId || !this._currentGroupCall) {
      console.warn(`[CallManager] No active call to leave`);
      return;
    }

    const roomId = this._currentCallRoomId;
    const groupCall = this._currentGroupCall;

    console.log(`[CallManager] Leaving call in room: ${roomId}`);

    try {
      // Leave the group call
      groupCall.leave();
      console.log(`[CallManager] Left group call: ${groupCall.groupCallId}`);

      // Clean up call state
      this.clearCallState();
    } catch (error: any) {
      console.error("[CallManager] Error leaving call:", error);
      // Still clean up state even if leave() fails
      this.clearCallState();
      throw error;
    }
  }

  /**
   * Get observable stream of user media streams for the current active call
   * Observable is created when joinCall() is called and completed when leaveCall() is called
   * @throws Error if no active call (observable doesn't exist)
   */
  public getCallStreams$(): Observable<UserMediaStream[]> {
    if (!this._currentCallStreams$) {
      throw new Error(
        "No active call. Join a call first to get the stream observable."
      );
    }
    return this._currentCallStreams$.asObservable();
  }

  /**
   * Toggle microphone mute state
   * @param muted - true to mute, false to unmute
   * @returns Promise<boolean> - true if successful
   */
  public async setMicrophoneMuted(muted: boolean): Promise<boolean> {
    if (!this._currentGroupCall) {
      throw new Error("No active call. Join a call first.");
    }

    try {
      const success = await this._currentGroupCall.setMicrophoneMuted(muted);
      console.log(
        `[CallManager] Microphone ${muted ? "muted" : "unmuted"}: ${success}`
      );
      return success;
    } catch (error: any) {
      console.error("[CallManager] Error setting microphone mute:", error);
      throw error;
    }
  }

  /**
   * Toggle video mute state
   * @param muted - true to mute, false to unmute
   * @returns Promise<boolean> - true if successful
   */
  public async setVideoMuted(muted: boolean): Promise<boolean> {
    if (!this._currentGroupCall) {
      throw new Error("No active call. Join a call first.");
    }

    try {
      const success = await this._currentGroupCall.setLocalVideoMuted(muted);
      console.log(
        `[CallManager] Video ${muted ? "muted" : "unmuted"}: ${success}`
      );
      return success;
    } catch (error: any) {
      console.error("[CallManager] Error setting video mute:", error);
      throw error;
    }
  }

  /**
   * Clean up all call resources
   * Called on logout - completes any active observable
   */
  public cleanup(): void {
    this.clearCallState();
    console.log(`[CallManager] Cleaned up all call resources`);
  }

  /**
   * Clear all call state (observable, roomId, groupCall)
   * Private helper method to avoid duplication
   */
  private clearCallState(): void {
    if (this._currentCallStreams$) {
      this._currentCallStreams$.complete();
      this._currentCallStreams$ = null;
    }
    this._currentCallRoomId = null;
    this._currentGroupCall = null;
  }

  /**
   * Set up observable for call streams in a room
   * Converts Matrix CallFeed objects to custom UserMediaStream format
   * Assumes _currentCallStreams$ already exists (created in joinCall)
   */
  private setupCallStreamObservable(roomId: string, groupCall: any): void {
    if (!this._currentCallStreams$) {
      console.error(
        `[CallManager] setupCallStreamObservable called but no observable exists for room ${roomId}`
      );
      return;
    }

    // Helper function to convert CallFeeds to UserMediaStream[] and emit
    const emitCurrentStreams = () => {
      if (!this._currentCallStreams$) {
        return;
      }

      const feeds = groupCall.userMediaFeeds || [];
      const streams: UserMediaStream[] = feeds.map((feed: any) => ({
        stream: feed.stream,
        userId: feed.userId,
        isLocal: feed.isLocal(),
      }));
      console.log(
        `[CallManager] Emitting ${streams.length} streams for room ${roomId}`
      );
      this._currentCallStreams$.next(streams);
    };

    // Emit initial streams
    emitCurrentStreams();

    groupCall.on(GroupCallEvent.UserMediaFeedsChanged, emitCurrentStreams);

    // Clean up listener when call ends
    const onCallEnded = () => {
      groupCall.off(GroupCallEvent.UserMediaFeedsChanged, emitCurrentStreams);
      groupCall.off(GroupCallEvent.GroupCallStateChanged, onCallEnded);

      // Properly leave the call
      try {
        groupCall.leave();
        console.log(
          `[CallManager] Left call on state change for room ${roomId}`
        );
      } catch (error) {
        console.warn(
          `[CallManager] Error leaving call on state change:`,
          error
        );
      }

      // Complete and clean up observable (per-call lifecycle)
      if (this._currentCallRoomId === roomId) {
        this.clearCallState();
      }

      console.log(
        `[CallManager] Call ended, cleaned up streams for room ${roomId}`
      );
    };

    groupCall.on(GroupCallEvent.GroupCallStateChanged, (newState: string) => {
      if (newState === "ended") {
        onCallEnded();
      }
    });

    console.log(
      `[CallManager] Set up call stream observable for room ${roomId}`
    );
  }
}
