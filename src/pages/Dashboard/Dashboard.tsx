import { useContext, useEffect } from "react"
import { AppContext } from "../../contexts/appContext"
import WsContext from "../../contexts/wsContext";
import type { IUserEventData } from "../../interfaces/events/IUsers";

export function Dashboard() {
  const appContext = useContext(AppContext);
  const wsContext = useContext(WsContext);
  const socket = wsContext?.Socket;

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

    // TODO créer les interfaces d'events data
    socket?.on("users", (data: IUserEventData) => {
      console.log("Users : ", data);
    });

    socket?.on("userList", (data: IUserEventData[]) => {
      console.log("User List : ", data);
    })
    
    return () => {
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.off("error");
      socket?.off("users");
    }
  })

  return (
    <>
      <h1>Dashbord</h1>
      <p>Welcome, {appContext.appState.user?.pseudo}</p>
    </>
  )
}