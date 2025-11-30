import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import matrixAuthReducer from "./slices/matrixAuthSlice";

// Configuration for redux-persist
const persistConfig = {
  key: "root", // The key for the persist store
  storage: AsyncStorage,
  whitelist: ["matrixAuth"], // Only persist the 'matrixAuth' slice
};

const rootReducer = combineReducers({
  matrixAuth: matrixAuthReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // This is important to avoid warnings with redux-persist
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store); // Create the persistor

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
