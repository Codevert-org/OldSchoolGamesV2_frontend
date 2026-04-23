import type { IUser } from "../../interfaces/events/IUsers";
import { UserItem } from "../UserItem/UserItem";
import "./UserList.css"

type UserListProps = Readonly<{ users: IUser[] }>;

export function UserList({ users }: UserListProps) {
  return (
    <div className="userList">
      <span className="userList-title">On line :</span>
      {users.map((u) => {
        return <UserItem key={u.id} user={u} />
      })}
    </div>
  )
}