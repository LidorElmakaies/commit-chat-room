import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { matrixService } from "../../services/matrix/MatrixService";
import { FetchState } from "../../types";
import { RoomState } from "./roomSlice";

export interface CallState {
  activeCallRoomId: string | null; // Room ID of the active call
  isJoined: boolean; // Whether we're currently in a call
  loading: FetchState;
  error: string | null;
  audioMuted: boolean; // Current microphone mute state
  videoMuted: boolean; // Current video mute state
}

const initialState: CallState = {
  activeCallRoomId: null,
  isJoined: false,
  loading: FetchState.Idle,
  error: null,
  audioMuted: true,
  videoMuted: true,
};

export const joinCall = createAsyncThunk(
  "call/joinCall",
  async (roomId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { room: RoomState };
      const currentRoomId = state.room.currentSelectedRoomId;

      if (currentRoomId !== roomId) {
        return rejectWithValue(
          "Can only join call for currently selected room"
        );
      }

      console.log("[CallSlice] Joining call in room", roomId);
      const callData = await matrixService.joinCall(roomId);
      console.log("[CallSlice] Call joined successfully", callData);
      return { roomId, callId: callData.callId };
    } catch (error: any) {
      console.error("[CallSlice] Failed to join call", error);
      return rejectWithValue(error.message || "Failed to join call");
    }
  }
);

export const leaveCall = createAsyncThunk(
  "call/leaveCall",
  async (_, { rejectWithValue }) => {
    try {
      console.log("[CallSlice] Leaving call");
      await matrixService.leaveCall();
      console.log("[CallSlice] Call left successfully");
      return {};
    } catch (error: any) {
      console.error("[CallSlice] Failed to leave call", error);
      return rejectWithValue(error.message || "Failed to leave call");
    }
  }
);

export const setAudioMuted = createAsyncThunk(
  "call/setAudioMuted",
  async (muted: boolean, { rejectWithValue }) => {
    try {
      console.log(`[CallSlice] Setting audio muted: ${muted}`);
      const success = await matrixService.setMicrophoneMuted(muted);
      console.log(
        `[CallSlice] Audio mute ${muted ? "enabled" : "disabled"}: ${success}`
      );
      return { muted, success };
    } catch (error: any) {
      console.error("[CallSlice] Failed to set audio mute", error);
      return rejectWithValue(error.message || "Failed to set audio mute");
    }
  }
);

export const setVideoMuted = createAsyncThunk(
  "call/setVideoMuted",
  async (muted: boolean, { rejectWithValue }) => {
    try {
      console.log(`[CallSlice] Setting video muted: ${muted}`);
      const success = await matrixService.setVideoMuted(muted);
      console.log(
        `[CallSlice] Video mute ${muted ? "enabled" : "disabled"}: ${success}`
      );
      return { muted, success };
    } catch (error: any) {
      console.error("[CallSlice] Failed to set video mute", error);
      return rejectWithValue(error.message || "Failed to set video mute");
    }
  }
);

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    clearCallError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinCall.pending, (state) => {
        state.loading = FetchState.Pending;
        state.error = null;
      })
      .addCase(joinCall.fulfilled, (state, action) => {
        state.loading = FetchState.Succeeded;
        state.error = null;
        state.isJoined = true;
        state.activeCallRoomId = action.payload.roomId;
        // Reset to default mute states
        state.audioMuted = true;
        state.videoMuted = false;
      })
      .addCase(joinCall.rejected, (state, action) => {
        state.loading = FetchState.Failed;
        state.error = action.payload as string;
      })
      .addCase(leaveCall.pending, (state) => {
        state.loading = FetchState.Pending;
      })
      .addCase(leaveCall.fulfilled, (state) => {
        state.loading = FetchState.Succeeded;
        state.isJoined = false;
        state.activeCallRoomId = null;
        state.error = null;
        state.audioMuted = true;
        state.videoMuted = true;
      })
      .addCase(leaveCall.rejected, (state, action) => {
        state.loading = FetchState.Failed;
        state.error = action.payload as string;
      })
      .addCase(setAudioMuted.pending, (state) => {
        // Optionally set loading state for mute actions
      })
      .addCase(setAudioMuted.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.audioMuted = action.payload.muted;
        }
      })
      .addCase(setAudioMuted.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(setVideoMuted.pending, (state) => {
        // Optionally set loading state for mute actions
      })
      .addCase(setVideoMuted.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.videoMuted = action.payload.muted;
        }
      })
      .addCase(setVideoMuted.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCallError } = callSlice.actions;
export default callSlice.reducer;
