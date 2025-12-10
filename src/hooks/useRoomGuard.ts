import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAppSelector } from "../store";

/**
 * A hook to protect room-specific routes.
 * It checks if a room with the given ID exists in the Redux store.
 * If the room doesn't exist, it redirects the user to the home/join screen.
 *
 * @param roomId The ID of the room to check. If not provided, uses currentSelectedRoomId from Redux.
 * @returns The room object if it exists, otherwise null.
 */
export function useRoomGuard(roomId?: string | null) {
  const router = useRouter();

  // If no roomId is provided, read from Redux
  const currentSelectedRoomId = useAppSelector(
    (state) => state.room.currentSelectedRoomId
  );
  const effectiveRoomId = roomId ?? currentSelectedRoomId;

  const room = useAppSelector((state) =>
    effectiveRoomId ? state.room.rooms[effectiveRoomId] : undefined
  );

  useEffect(() => {
    // Only redirect if we have a roomId but no corresponding room was found.
    // If roomId is null/undefined, we might be in the process of navigating, so we don't redirect.
    if (effectiveRoomId && !room) {
      router.replace("/(app)");
    }
  }, [effectiveRoomId, room, router]);

  return room;
}
