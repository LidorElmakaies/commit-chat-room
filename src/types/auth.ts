export type LoginCredentials = {
  username: string;
  password?: string;
};

export interface MatrixSession {
  userId: string;
  accessToken: string;
  deviceId: string;
}

export enum LoginState {
  Idle = "idle",
  Pending = "pending",
}
