import './NotificationFeed.css';

export interface INotification {
  id: number;
  message: string;
}

export function NotificationFeed({ notifications }: { notifications: INotification[] }) {
  return (
    <div className="notification-feed">
      {notifications.map((n) => (
        <div key={n.id} className="notification-feed__item">{n.message}</div>
      ))}
    </div>
  );
}
