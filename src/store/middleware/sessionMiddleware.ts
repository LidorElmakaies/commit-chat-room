import { Middleware, isAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "..";
import { restoreSession } from "../slices/matrixAuthSlice";

export const sessionMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const dispatch = store.dispatch as AppDispatch;
    // First, let the action pass through the middleware chain
    const result = next(action);

    // After the action has been processed, check if it's the REHYDRATE action
    if (isAction(action) && action.type === "persist/REHYDRATE") {
      const state = store.getState();
      const { isAuthenticated, userId, accessToken, deviceId } =
        state.matrixAuth;

      // If we have a persisted session, try to restore it in the MatrixService
      if (isAuthenticated && userId && accessToken && deviceId) {
        console.log(
          "Session middleware: Rehydrated and authenticated. Restoring session..."
        );
        dispatch(restoreSession({ userId, accessToken, deviceId }));
      }
    }

    return result;
  };
