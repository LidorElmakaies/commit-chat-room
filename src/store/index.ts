import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import createTransform from "redux-persist/es/createTransform";

import callReducer from "./slices/callSlice";
import matrixAuthReducer, { MatrixAuthState } from "./slices/matrixAuthSlice";
import roomReducer from "./slices/roomSlice";

import {
  messageListenerMiddleware,
  roomSyncMiddleware,
  sessionMiddleware,
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
  call: callReducer,
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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
