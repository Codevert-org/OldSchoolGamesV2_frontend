export interface IUser {
  id: number;
  pseudo: string;
  avatarUrl: string | null;
  invite?: 'to' | 'from';
  invitationId?: number;
}

export interface IUserEventData {
  eventType: 'connected' | 'disconnected';
  user: IUser | number;
}