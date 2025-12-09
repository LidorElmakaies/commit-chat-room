import { Middleware } from "@reduxjs/toolkit";
import { Subscription } from "rxjs";
import { RootState } from "..";
import { matrixService } from "../../services/matrix/MatrixService";
import { clearCallStreams, joinCall, leaveCall, updateCallStreams } from "../slices/callSlice";
import { selectRoom } from "../slices/roomSlice";

// Subscription to the current call's stream observable
// Subscribes when joinCall.fulfilled, unsubscribes when leaveCall.fulfilled or observable completes
let callStreamSubscription: Subscription | null = null;

export const callStreamMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    // Subscribe to streams when a call is successfully joined
    if (joinCall.fulfilled.match(action)) {
      // Unsubscribe from previous call if exists
      if (callStreamSubscription) {
        console.log("[CallStreamMiddleware] Unsubscribing from previous call streams");
        callStreamSubscription.unsubscribe();
        callStreamSubscription = null;
      }

      // Subscribe to the new call's stream observable
      try {
        console.log("[CallStreamMiddleware] Subscribing to call streams for room", action.payload.roomId);
        callStreamSubscription = matrixService.getCallStreams$().subscribe({
          next: (streams) => {
            // Get the currently selected room from the store state
            const state = store.getState();
            const currentSelectedRoomId = state.room.currentSelectedRoomId;
            
            // Only update streams if there's a currently selected room and it matches
            if (currentSelectedRoomId === action.payload.roomId) {
              if (streams.length > 0) {
                console.log(`[CallStreamMiddleware] Received ${streams.length} streams`);
                store.dispatch(updateCallStreams(streams));
              } else {
                // No streams, clear
                console.log("[CallStreamMiddleware] No streams, clearing");
                store.dispatch(clearCallStreams());
              }
            } else {
              // Room changed, clear streams
              console.log("[CallStreamMiddleware] Room changed, clearing streams");
              store.dispatch(clearCallStreams());
            }
          },
          error: (error) => {
            console.error("[CallStreamMiddleware] Error in stream subscription:", error);
            store.dispatch(clearCallStreams());
          },
          complete: () => {
            console.log("[CallStreamMiddleware] Stream observable completed");
            store.dispatch(clearCallStreams());
            callStreamSubscription = null;
          },
        });
      } catch (error: any) {
        console.error("[CallStreamMiddleware] Failed to subscribe to call streams:", error.message);
        store.dispatch(clearCallStreams());
      }
    }

    // Unsubscribe when call is left
    if (leaveCall.fulfilled.match(action)) {
      if (callStreamSubscription) {
        console.log("[CallStreamMiddleware] Unsubscribing from call streams (leaveCall)");
        callStreamSubscription.unsubscribe();
        callStreamSubscription = null;
      }
    }

    // Clear call streams when switching rooms
    if (selectRoom.match(action)) {
      // Unsubscribe from current call if switching rooms
      if (callStreamSubscription) {
        console.log("[CallStreamMiddleware] Unsubscribing from call streams (room switch)");
        callStreamSubscription.unsubscribe();
        callStreamSubscription = null;
      }
      store.dispatch(clearCallStreams());
    }

    return next(action);
  };

