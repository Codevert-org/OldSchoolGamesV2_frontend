import type { IUser } from "../../interfaces/events/IUsers";
import "./UserItem.css";

export function UserItem({user}: {user: IUser}) {
  return (
    <div className="userItem">
      <img
        src={user.avatarUrl ? `${import.meta.env.VITE_BACKEND_URL}/assets/user_avatars/${user.avatarUrl}` : '/defaultavatar.webp'}
        alt="avatar"
        className="userItem-avatar" />
      <span className="userItem-pseudo">{user.pseudo}</span>
    </div>
  )
}