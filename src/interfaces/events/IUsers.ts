export interface IUser {
  id: number;
  pseudo: string;
  avatarUrl: string | null;
}

export interface IUserEventData {
  eventType: 'connected' | 'disconnected';
  user: IUser;
}