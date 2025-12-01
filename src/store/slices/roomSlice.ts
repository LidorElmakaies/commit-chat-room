import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { matrixService } from "../../services/matrix/MatrixService";
import {
  CreateRoomOptions,
  LoadingState,
  RoomSummary,
  RoomVisibility,
} from "../../types";

export interface RoomState {
  currentSelectedRoomId: string | null;
  joinedRooms: Record<string, RoomSummary>;
  loading: LoadingState;
  error: string | null;
}

const initialState: RoomState = {
  currentSelectedRoomId: null,
  joinedRooms: {},
  loading: LoadingState.Idle,
  error: null,
};

export const fetchJoinedRooms = createAsyncThunk(
  "room/fetchJoined",
  async (_, { rejectWithValue }) => {
    try {
      const rooms = await matrixService.getJoinedRooms();
      return rooms;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch joined rooms");
    }
  }
);

export const joinRoom = createAsyncThunk(
  "room/join",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const roomData = await matrixService.joinRoom(roomId);
      return roomData;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to join room");
    }
  }
);

export const createRoom = createAsyncThunk(
  "room/create",
  async (options: CreateRoomOptions, { dispatch, rejectWithValue }) => {
    try {
      const roomId = await matrixService.createRoom(options);
      await dispatch(joinRoom(roomId));
      return roomId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create room");
    }
  }
);

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
    },
    selectRoom: (state, action: PayloadAction<string>) => {
      if (state.joinedRooms[action.payload]) {
        state.currentSelectedRoomId = action.payload;
      }
    },
    deselectRoom: (state) => {
      state.currentSelectedRoomId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Room
      .addCase(createRoom.pending, (state) => {
        state.loading = LoadingState.Pending;
        state.error = null;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = LoadingState.Failed;
        state.error = action.payload as string;
      })
      // Join Room
      .addCase(joinRoom.pending, (state) => {
        state.loading = LoadingState.Pending;
        state.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading = LoadingState.Succeeded;
        const roomData = action.payload;
        state.joinedRooms[roomData.roomId] = roomData;
        state.currentSelectedRoomId = roomData.roomId;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading = LoadingState.Failed;
        state.error = action.payload as string;
      })
      // Fetch Joined Rooms
      .addCase(fetchJoinedRooms.pending, (state) => {
        state.loading = LoadingState.Pending;
        state.error = null;
      })
      .addCase(fetchJoinedRooms.fulfilled, (state, action) => {
        state.loading = LoadingState.Succeeded;
        const roomsMap: Record<string, RoomSummary> = {};
        action.payload.forEach((room) => {
          roomsMap[room.roomId] = room;
        });
        state.joinedRooms = roomsMap;
      })
      .addCase(fetchJoinedRooms.rejected, (state, action) => {
        state.loading = LoadingState.Failed;
        state.error = action.payload as string;
      });
  },
});

export const { clearRoomError, selectRoom, deselectRoom } = roomSlice.actions;
export default roomSlice.reducer;
