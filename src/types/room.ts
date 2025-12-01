export interface CreateRoomOptions {
  name: string;
  topic?: string;
  visibility: RoomVisibility;
}

export enum RoomVisibility {
  Public = "public",
  Private = "private",
}

export interface RoomSummary {
  roomId: string;
  name: string;
  topic?: string;
}
