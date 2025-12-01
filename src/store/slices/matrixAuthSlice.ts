import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { matrixService } from "../../services/matrix/MatrixService";
import { LoadingState, LoginCredentials, MatrixSession } from "../../types";

export interface MatrixAuthState {
  userId: string | null;
  accessToken: string | null;
  deviceId: string | null;
  isAuthenticated: boolean;
  loading: LoadingState;
  error: string | null;
}

const initialState: MatrixAuthState = {
  userId: null,
  accessToken: null,
  deviceId: null,
  isAuthenticated: false,
  loading: LoadingState.Idle,
  error: null,
};

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  "matrixAuth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await matrixService.login(
        credentials.username,
        credentials.password
      );
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Async Thunk for Restoring Session (if we had persisted data)
export const restoreSession = createAsyncThunk(
  "matrixAuth/restore",
  async (session: MatrixSession, { rejectWithValue }) => {
    try {
      await matrixService.loginWithToken(
        session.userId,
        session.accessToken,
        session.deviceId
      );
      return session;
    } catch (error: any) {
      return rejectWithValue(error.message || "Restore failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "matrixAuth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await matrixService.logout();
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

const matrixAuthSlice = createSlice({
  name: "matrixAuth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = LoadingState.Pending;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = LoadingState.Succeeded;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.accessToken = action.payload.accessToken;
      state.deviceId = action.payload.deviceId;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = LoadingState.Failed;
      state.error = action.payload as string;
    });

    // Restore
    builder.addCase(restoreSession.pending, (state) => {
      state.loading = LoadingState.Pending;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.loading = LoadingState.Succeeded;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.accessToken = action.payload.accessToken;
      state.deviceId = action.payload.deviceId;
    });
    builder.addCase(restoreSession.rejected, (state) => {
      state.loading = LoadingState.Failed;
      state.isAuthenticated = false;
      state.userId = null;
      state.accessToken = null;
      state.deviceId = null;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.userId = null;
      state.accessToken = null;
      state.deviceId = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError } = matrixAuthSlice.actions;
export default matrixAuthSlice.reducer;
