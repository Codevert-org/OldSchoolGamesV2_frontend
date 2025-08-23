import { useContext, useEffect } from "react"
import { AppContext } from "../../contexts/appContext"
import { WsContext } from "../../contexts/wsContext";

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
    socket?.on("movies", (data) => {
      console.log("Movies : ", data);
    });
    socket?.on("users", (data) => {
      console.log("Users : ", data);
    });
    socket?.on("team", (data) => {
      console.log("Team : ", data);
    });
    return () => {
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.off("error");
      socket?.off("movies");
      socket?.off("users");
      socket?.off("team");
    }
  })

  // socket?.on("connect", () => {
  //   console.log("WS connected");
  // });
  // socket?.on("movies", (data) => {
  //   console.log("Movies : ", data);
  // });
  // socket?.on("users", (data) => {
  //   console.log("Users : ", data);
  // });
  // socket?.on("team", (data) => {
  //   console.log("Team : ", data);
  // });

  return (
    <>
      <h1>Dashbord</h1>
      <p>Welcome, {appContext.appState.user?.pseudo}</p>
    </>
  )
}