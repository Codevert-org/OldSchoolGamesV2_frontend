import type { IUser } from "../../interfaces/events/IUsers";
import { UserItem } from "../UserItem/UserItem";
import "./UserList.css"

export function UserList({users}: {users: IUser[]}) {
  return (
    <div className="userList">
      <span className="userList-title">On line :</span>
      {users.map((u) => {
        return <UserItem key={u.id} user={u} />
      })}
    </div>
  )
}