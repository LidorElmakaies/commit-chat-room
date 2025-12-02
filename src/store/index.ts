import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createTransform from "redux-persist/es/createTransform";
import AsyncStorage from "@react-native-async-storage/async-storage";

import matrixAuthReducer, { MatrixAuthState } from "./slices/matrixAuthSlice";
import roomReducer from "./slices/roomSlice";

import {
  sessionMiddleware,
  messageListenerMiddleware,
  roomSyncMiddleware,
} from "./middleware";

const authStateTransform = createTransform(
  (inboundState: MatrixAuthState) => {
    return {
      userId: inboundState.userId,
      accessToken: inboundState.accessToken,
      deviceId: inboundState.deviceId,
      isAuthenticated: inboundState.isAuthenticated,
    };
  },
  (outboundState: any) => {
    return {
      ...outboundState,
      loading: "idle",
      error: null,
    };
  },
  { whitelist: ["matrixAuth"] }
);

const rootReducer = combineReducers({
  matrixAuth: matrixAuthReducer,
  room: roomReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["matrixAuth"],
  transforms: [authStateTransform],
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sessionMiddleware, messageListenerMiddleware, roomSyncMiddleware),
});

export const persistor = persistStore(store);
