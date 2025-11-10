import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AppContext } from "../../contexts/appContext";
import WsContext from "../../contexts/wsContext";
import { type IUser, type IUserEventData } from "../../interfaces/events/IUsers";
import { UserList } from "../../components";
import "./Dashboard.css";

export function Dashboard() {
  const appContext = useContext(AppContext);
  const wsContext = useContext(WsContext);
  const navigate = useNavigate();
  const socket = wsContext?.Socket;
  const [userList, setUserList] = useState<IUser[]>([]);
  const [isUserListLoaded, setIsUserListLoaded] = useState<boolean>(false);
  const eventNames = ["connect", "disconnect", "error", "users", "userList", "invitation"];

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("WS connected");
    });
    socket?.on("disconnect", (reason) => {
      console.log("disconnect : ", reason);
    });
    socket?.on("error", (error) => {
      console.log("error : ", error);
    });

    //* Ask server for current user list
    // TODO: find out if this could be needed out of first load
    if (!isUserListLoaded) {
      socket?.emit("userList");
    }

    socket?.on("userList", (data: IUser[]) => {
      setUserList(data.filter(u => u.id !== appContext.appState.user?.id));
      setIsUserListLoaded(true);
    });
    
    socket?.on("users", (data: IUserEventData) => {
      if(data.eventType === 'connected') {
        const userData = data.user as IUser;
        setUserList((prev) => [...prev.filter(u => u.id !== userData.id), userData])
        //TODO: if invitation exists toward this user, update it
      }
      if(data.eventType === 'disconnected') {
        const userId = data.user as number;
        setUserList((prev) => prev.filter(u => u.id !== userId));
      }
    });

    socket?.on("invitation", (data) => {
      switch(data.eventType) {
        case "created":
          setUserList([...userList.filter(u => u.id !== data.toId),
            {...userList.find(u => u.id === data.toId), invite: 'to', invitationId: data.invitationId} as IUser])
          break;
        case "received":
          setUserList([...userList.filter(u => u.id !== data.fromId),
            {...userList.find(u => u.id === data.fromId), invite: 'from', invitationId: data.invitationId} as IUser])
          break;
        case "canceled":
          console.log('invitation canceled : ', data.invitationId);
          setUserList((prev) => prev.map(u => {
            if(u.invitationId === data.invitationId) {
              return {...u, invite: undefined, invitationId: undefined}
            }
            return u;
          }));
          break;
        case "accepted":
          console.log('invitation accepted : ', data);
          navigate('/morpion', {state: {roomName: `${data.game}_${data.invitationId}`}});
          break;
        case "error":
          console.log('Invitation error : ', data.message);
      }
    });

    return () => {
      for (const event of eventNames) {
        socket?.off(event);
      }
    }
  });

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome, {appContext.appState.user?.pseudo}</p>
      <UserList users={userList}/>
    </div>
  )
}