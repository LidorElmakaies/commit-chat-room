import { useEffect, useState } from "react";
import { Subscription } from "rxjs";
import { matrixService } from "../services/matrix/MatrixService";
import { useAppDispatch, useAppSelector } from "../store";
import {
  joinCall as joinCallThunk,
  leaveCall as leaveCallThunk,
} from "../store/slices/callSlice";
import { UserMediaStream } from "../types";

/**
 * Custom hook to manage call state and media streams
 *
 * This hook:
 * - Manages MediaStreams locally (not in Redux)
 * - Dispatches Redux actions for call metadata (join state, mute state)
 * - Subscribes to the Observable stream from matrixService
 * - Cleans up on unmount
 *
 * @param roomId Optional room ID. If not provided, uses currentSelectedRoomId from Redux.
 */
export function useCall(roomId?: string | null) {
  const dispatch = useAppDispatch();
  const { isJoined, loading, error, audioMuted, videoMuted } = useAppSelector(
    (state) => state.call
  );

  // If no roomId is provided, read from Redux
  const currentSelectedRoomId = useAppSelector(
    (state) => state.room.currentSelectedRoomId
  );
  const effectiveRoomId = roomId ?? currentSelectedRoomId;

  // Local state for streams (not in Redux)
  const [streams, setStreams] = useState<UserMediaStream[]>([]);

  // Subscribe to stream updates from matrixService
  useEffect(() => {
    let subscription: Subscription | null = null;

    if (isJoined && effectiveRoomId) {
      console.log(
        "[useCall] Subscribing to call streams for room:",
        effectiveRoomId
      );
      subscription = matrixService.getCallStreams$().subscribe({
        next: (currentStreams) => {
          console.log(`[useCall] Received ${currentStreams.length} streams`);
          setStreams(currentStreams);
        },
        error: (err) => {
          console.error("[useCall] Stream subscription error:", err);
          setStreams([]);
        },
        complete: () => {
          console.log("[useCall] Stream subscription completed");
          setStreams([]);
        },
      });
    } else {
      // Clear streams when not in a call
      setStreams([]);
    }

    // Cleanup subscription on unmount or when isJoined/effectiveRoomId changes
    return () => {
      if (subscription) {
        console.log("[useCall] Unsubscribing from call streams");
        subscription.unsubscribe();
      }
    };
  }, [isJoined, effectiveRoomId]);

  // Cleanup call on unmount
  useEffect(() => {
    return () => {
      if (isJoined) {
        console.log("[useCall] Component unmounting, leaving call");
        matrixService.leaveCall().catch(console.error);
      }
    };
  }, [isJoined]);

  // Action: Join call
  const joinCall = async () => {
    if (!effectiveRoomId) {
      console.error(
        "[useCall] Cannot join call: no roomId provided or selected"
      );
      return;
    }

    try {
      console.log("[useCall] Joining call for room:", effectiveRoomId);
      await dispatch(joinCallThunk(effectiveRoomId)).unwrap();
      console.log("[useCall] Successfully joined call");
    } catch (error: any) {
      console.error("[useCall] Failed to join call:", error);
      throw error;
    }
  };

  // Action: Leave call
  const leaveCall = async () => {
    try {
      console.log("[useCall] Leaving call");
      await dispatch(leaveCallThunk()).unwrap();
      console.log("[useCall] Successfully left call");
      setStreams([]); // Clear streams immediately
    } catch (error: any) {
      console.error("[useCall] Failed to leave call:", error);
      throw error;
    }
  };

  return {
    // State
    streams,
    isJoined,
    loading,
    error,
    audioMuted,
    videoMuted,

    // Actions
    joinCall,
    leaveCall,
  };
}
