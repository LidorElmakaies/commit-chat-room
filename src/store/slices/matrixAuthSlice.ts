import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { matrixService } from "../../services/matrix/MatrixService";
import { LoginCredentials, MatrixSession, LoginState } from "../../types";

export interface MatrixAuthState {
  userId: string | null;
  accessToken: string | null;
  deviceId: string | null;
  isAuthenticated: boolean;
  loading: LoginState;
  error: string | null;
}

const initialState: MatrixAuthState = {
  userId: null,
  accessToken: null,
  deviceId: null,
  isAuthenticated: false,
  loading: LoginState.Idle,
  error: null,
};

// Async Thunk for Login
export const login = createAsyncThunk(
  "matrixAuth/login",
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(LoginState.Pending));
      const session = await matrixService.login(credentials);
      dispatch(loginSuccess(session));
      return session;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Async Thunk for Restoring Session (if we had persisted data)
export const restoreSession = createAsyncThunk(
  "matrixAuth/restoreSession",
  async (session: MatrixSession, { dispatch, rejectWithValue }) => {
    try {
      await matrixService.loginWithToken(session);
      dispatch(loginSuccess(session));
      return session;
    } catch (error: any) {
      return rejectWithValue(error.message || "Restore failed");
    }
  }
);

export const logout = createAsyncThunk(
  "matrixAuth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(LoginState.Pending));
      await matrixService.logout();
      dispatch(logoutSuccess());
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

const matrixAuthSlice = createSlice({
  name: "matrixAuth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<LoginState>) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<MatrixSession>) => {
      state.loading = LoginState.Idle;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.accessToken = action.payload.accessToken;
      state.deviceId = action.payload.deviceId;
    },
    logoutSuccess: (state) => {
      state.userId = null;
      state.accessToken = null;
      state.deviceId = null;
      state.isAuthenticated = false;
      state.loading = LoginState.Idle;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = LoginState.Pending;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = LoginState.Idle;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.accessToken = action.payload.accessToken;
      state.deviceId = action.payload.deviceId;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = LoginState.Idle;
      state.error = action.payload as string;
    });

    // Restore
    builder.addCase(restoreSession.pending, (state) => {
      state.loading = LoginState.Pending;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.loading = LoginState.Idle;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.accessToken = action.payload.accessToken;
      state.deviceId = action.payload.deviceId;
    });
    builder.addCase(restoreSession.rejected, (state) => {
      state.loading = LoginState.Idle;
      state.isAuthenticated = false;
      state.userId = null;
      state.accessToken = null;
      state.deviceId = null;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.userId = null;
      state.accessToken = null;
      state.deviceId = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setLoading, loginSuccess, logoutSuccess, clearError } =
  matrixAuthSlice.actions;
export default matrixAuthSlice.reducer;
