import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { matrixService } from "../../services/matrix/MatrixService";
import {
  CreateRoomOptions,
  FetchState,
  RoomSummary,
  Message,
} from "../../types";

export interface RoomState {
  currentSelectedRoomId: string | null;
  rooms: Record<string, RoomSummary>;
  currentRoomMessages: Message[];
  loading: FetchState;
  error: string | null;
}

const initialState: RoomState = {
  currentSelectedRoomId: null,
  rooms: {},
  currentRoomMessages: [],
  loading: FetchState.Idle,
  error: null,
};

export const fetchJoinedRooms = createAsyncThunk(
  "room/fetchJoined",
  async (_, { rejectWithValue }) => {
    try {
      const rooms = await matrixService.getJoinedRooms();
      console.log("[RoomSlice] Joined rooms fetched", rooms);
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
      if (state.rooms[action.payload]) {
        state.currentSelectedRoomId = action.payload;
        state.currentRoomMessages = [];
      }
    },
    deselectRoom: (state) => {
      state.currentSelectedRoomId = null;
      state.currentRoomMessages = [];
    },
    messageReceived: (state, action: PayloadAction<Message>) => {
      if (action.payload.roomId === state.currentSelectedRoomId) {
        state.currentRoomMessages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRoom.pending, (state) => {
        state.loading = FetchState.Pending;
        state.error = null;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = FetchState.Failed;
        state.error = action.payload as string;
      })
      .addCase(joinRoom.pending, (state) => {
        state.loading = FetchState.Pending;
        state.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading = FetchState.Succeeded;
        const roomData = action.payload;
        state.rooms[roomData.roomId] = roomData;
        state.currentSelectedRoomId = roomData.roomId;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading = FetchState.Failed;
        state.error = action.payload as string;
      })
      .addCase(fetchJoinedRooms.pending, (state) => {
        state.loading = FetchState.Pending;
        state.error = null;
      })
      .addCase(fetchJoinedRooms.fulfilled, (state, action) => {
        state.loading = FetchState.Succeeded;
        const roomsMap: Record<string, RoomSummary> = {};
        action.payload.forEach((room) => {
          roomsMap[room.roomId] = room;
        });
        state.rooms = roomsMap;
      })
      .addCase(fetchJoinedRooms.rejected, (state, action) => {
        state.loading = FetchState.Failed;
        state.error = action.payload as string;
      });
  },
});

export const { clearRoomError, selectRoom, deselectRoom, messageReceived } =
  roomSlice.actions;
export default roomSlice.reducer;
