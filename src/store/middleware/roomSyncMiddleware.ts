import { Middleware } from "@reduxjs/toolkit";
import { login, restoreSession } from "../slices/matrixAuthSlice";
import { fetchJoinedRooms } from "../slices/roomSlice";
import { AppDispatch } from "../types";

export const roomSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (login.fulfilled.match(action) || restoreSession.fulfilled.match(action)) {
    console.log("[RoomSync] Auth complete. Fetching joined rooms...");
    (store.dispatch as AppDispatch)(fetchJoinedRooms());
  }

  return result;
};
