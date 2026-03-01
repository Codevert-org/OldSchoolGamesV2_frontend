export interface IAuthResponse {
  accessToken: string;
  avatarMessage?: string;
  user: {
    id: number;
    pseudo: string;
    avatarUrl: string | null;
  }
}