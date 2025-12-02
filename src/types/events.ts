export interface MembershipEvent {
  roomId: string;
  userId: string;
  newState: "join" | "leave" | "invite" | "ban";
  timestamp: number;
}
