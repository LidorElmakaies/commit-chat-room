import { Middleware } from "@reduxjs/toolkit";
import { AppDispatch } from "..";
import { login, restoreSession } from "../slices/matrixAuthSlice";
import { fetchJoinedRooms } from "../slices/roomSlice";

export const roomSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (login.fulfilled.match(action) || restoreSession.fulfilled.match(action)) {
    console.log("[RoomSync] Auth complete. Fetching joined rooms...");
    (store.dispatch as AppDispatch)(fetchJoinedRooms());
  }

  return result;
};

