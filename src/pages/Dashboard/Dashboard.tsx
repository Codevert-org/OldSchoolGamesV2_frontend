import { useContext, useEffect, useState } from "react"
import { AppContext } from "../../contexts/appContext"
import WsContext from "../../contexts/wsContext";
import { type IUser, type IUserEventData } from "../../interfaces/events/IUsers";
import { UserList } from "../../components";
import "./Dashboard.css";

export function Dashboard() {
  const appContext = useContext(AppContext);
  const wsContext = useContext(WsContext);
  const socket = wsContext?.Socket;
  const [userList, setUserList] = useState<IUser[]>([])

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("WS connected");
    });
    socket?.on("disconnect", (reason) => {
      console.log("disconnect : ", reason);
    })
    socket?.on("error", (error) => {
      console.log("error : ", error);
    })

    socket?.on("users", (data: IUserEventData) => {
      //console.log("Users : ", data);
      if(data.eventType === 'connected') {
        const userData = data.user as IUser;
        setUserList((prev) => [...prev.filter(u => u.id !== userData.id), userData])
      }
      if(data.eventType === 'disconnected') {
        const userId = data.user as number;
        setUserList((prev) => prev.filter(u => u.id !== userId));
      }
    });

    socket?.on("userList", (data: IUser[]) => {
      //console.log("User List : ", data);
      setUserList(data);
    })
    
    return () => {
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.off("error");
      socket?.off("users");
    }
  })

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome, {appContext.appState.user?.pseudo}</p>
      <UserList users={userList}/>
    </div>
  )
}