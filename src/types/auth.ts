export interface LoginCredentials {
  username: string;
  password: string;
}

export interface MatrixSession {
  userId: string;
  accessToken: string;
  deviceId: string;
}
