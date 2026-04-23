import './NotificationFeed.css';

export interface INotification {
  id: number;
  message: string;
}

type NotificationFeedProps = Readonly<{ notifications: INotification[] }>;

export function NotificationFeed({ notifications }: NotificationFeedProps) {
  return (
    <div className="notification-feed">
      {notifications.map((n) => (
        <div key={n.id} className="notification-feed__item">{n.message}</div>
      ))}
    </div>
  );
}
