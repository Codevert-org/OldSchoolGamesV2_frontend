export interface IAuthResponse {
  accessToken: string;
  user: {
    id: number;
    pseudo: string;
    avatarUrl: string | null;
  }
}