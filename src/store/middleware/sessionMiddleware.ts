import { Middleware, Action } from "@reduxjs/toolkit";
import { RootState } from "..";
import { restoreSession } from "../slices/matrixAuthSlice";
import { AppDispatch } from "../types";

// Define the specific shape of the REHYDRATE action
interface RehydrateAction extends Action {
  type: "persist/REHYDRATE";
  payload?: RootState;
  err?: any;
}

export const sessionMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const rehydrateAction = action as RehydrateAction;

    if (rehydrateAction.type === "persist/REHYDRATE") {
      const session = rehydrateAction.payload?.matrixAuth;

      console.log("[Session] Persisted auth state:", session);

      if (
        session?.isAuthenticated &&
        session.userId &&
        session.accessToken &&
        session.deviceId
      ) {
        (store.dispatch as AppDispatch)(
          restoreSession({
            userId: session.userId,
            accessToken: session.accessToken,
            deviceId: session.deviceId,
          })
        );
      } else {
        console.log(
          "[Session] No valid, authenticated session found in storage. Skipping auto-login."
        );
      }
    }

    return next(action);
  };
