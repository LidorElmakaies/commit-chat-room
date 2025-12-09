import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAppSelector } from "../store";

/**
 * A hook to protect room-specific routes.
 * It checks if a room with the given ID exists in the Redux store.
 * If the room doesn't exist, it redirects the user to the home/join screen.
 *
 * @param roomId The ID of the room to check.
 * @returns The room object if it exists, otherwise null.
 */
export function useRoomGuard(roomId: string | undefined | null) {
  const router = useRouter();
  const room = useAppSelector((state) =>
    roomId ? state.room.rooms[roomId] : undefined
  );

  useEffect(() => {
    // Only redirect if we have a roomId but no corresponding room was found.
    // If roomId is null/undefined, we might be in the process of navigating, so we don't redirect.
    if (roomId && !room) {
      router.replace("/(app)");
    }
  }, [roomId, room, router]);

  return room;
}
