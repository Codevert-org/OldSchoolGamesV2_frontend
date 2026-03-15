import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AppContext } from "../../contexts";
import WsContext from "../../contexts/wsContext";
import { type IUser, type IUserEventData } from "../../interfaces/events/IUsers";
import { type INotification, NotificationFeed, UserList } from "../../components";
import { fetchStats, type IStats, type StatsPeriod } from "../../services/users.service";
import "./Dashboard.css";

const EVENT_NAMES = ["connect", "disconnect", "error", "users", "userList", "invitation"];

export function Dashboard() {
  const appContext = useContext(AppContext);
  const wsContext = useContext(WsContext);
  const navigate = useNavigate();
  const socket = wsContext?.Socket;
  const [userList, setUserList] = useState<IUser[]>([]);
  const [isUserListLoaded, setIsUserListLoaded] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [stats, setStats] = useState<IStats | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const notifIdRef = useRef(0);
  const userListRef = useRef(userList);
  userListRef.current = userList;

  useEffect(() => {
    fetchStats(period).then(setStats).catch(() => setStats(null));
  }, [period]);

  const pushNotification = useCallback((message: string) => {
    const id = ++notifIdRef.current;
    setNotifications((prev) => [{ id, message }, ...prev]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  }, []);

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
        setUserList((prev) => [...prev.filter(u => u.id !== userData.id), userData]);
        pushNotification(`${userData.pseudo} vient de se connecter`);
        //TODO: if invitation exists toward this user, update it
      }
      if(data.eventType === 'disconnected') {
        const userId = data.user as number;
        const disconnectedUser = userListRef.current.find(u => u.id === userId);
        setUserList((prev) => prev.filter(u => u.id !== userId));
        if(disconnectedUser) pushNotification(`${disconnectedUser.pseudo} vient de se déconnecter`);
      }
      if(data.eventType === 'registered') {
        const userData = data.user as IUser;
        pushNotification(`${userData.pseudo} vient de rejoindre OldSchoolGames !`);
      }
    });

    socket?.on("invitation", (data) => {
      switch(data.eventType) {
        case "created":
          setUserList((prev) => [...prev.filter(u => u.id !== data.toId),
            {...prev.find(u => u.id === data.toId), invite: 'to', invitationId: data.invitationId} as IUser]);
          break;
        case "received":
          setUserList((prev) => [...prev.filter(u => u.id !== data.fromId),
            {...prev.find(u => u.id === data.fromId), invite: 'from', invitationId: data.invitationId} as IUser]);
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
          // TODO redirect to game page corresponding to data.game when implemented
          navigate(`/${data.game}`, {state: {roomName: `${data.game}_${data.invitationId}`}});
          break;
        case "error":
          console.log('Invitation error : ', data.message);
      }
    });

    return () => {
      for (const event of EVENT_NAMES) {
        socket?.off(event);
      }
    }
  }, [socket, navigate, appContext.appState.user?.id, isUserListLoaded, pushNotification]);

  const GAMES = ['morpion', 'puissance4', 'reversi'] as const;
  const PERIOD_LABELS: Record<StatsPeriod, string> = { week: 'Semaine', month: 'Mois', year: 'Année' };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome, {appContext.appState.user?.pseudo}</p>
      <NotificationFeed notifications={notifications} />
      <div className="dashboard-stats">
        <div className="dashboard-stats__header">
          <span>Statistiques</span>
          <div className="dashboard-stats__periods">
            {(['week', 'month', 'year'] as StatsPeriod[]).map((p) => (
              <button
                key={p}
                className={`dashboard-stats__period${period === p ? ' dashboard-stats__period--active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {stats && (
          <div className="dashboard-stats__body">
            <div className="dashboard-stats__global">
              <span>Global</span>
              <span>{stats.global.total} parties — {stats.global.wins}V / {stats.global.losses}D / {stats.global.draws}N — {stats.global.ratio}%</span>
            </div>
            {GAMES.map((g) => (
              <div key={g} className="dashboard-stats__game">
                <span>{g}</span>
                <span>{stats.byGame[g].total} parties — {stats.byGame[g].wins}V / {stats.byGame[g].losses}D / {stats.byGame[g].draws}N — {stats.byGame[g].ratio}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <UserList users={userList}/>
    </div>
  )
}