import { Middleware } from "@reduxjs/toolkit";
import { Subscription } from "rxjs";
import { matrixService } from "../../services/matrix/MatrixService";
import { RootState } from "..";
import { messageReceived } from "../slices/roomSlice";
import { AppDispatch } from "../types";

let messageSubscription: Subscription | null = null;

export const messageListenerMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    if (!messageSubscription) {
      console.log("[Middleware] Initializing global message listener.");
      messageSubscription = matrixService.roomMessages$.subscribe((message) => {
        (store.dispatch as AppDispatch)(messageReceived(message));
      });
    }
    return next(action);
  };
