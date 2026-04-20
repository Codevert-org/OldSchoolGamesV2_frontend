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
        let pseudoToNotify: string | undefined;
        setUserList((prev) => {
          pseudoToNotify = prev.find(u => u.id === userId)?.pseudo;
          return prev.filter(u => u.id !== userId);
        });
        if(pseudoToNotify) pushNotification(`${pseudoToNotify} vient de se déconnecter`);
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

  const PERIOD_LABELS: Record<StatsPeriod, string> = { week: 'Semaine', month: 'Mois', year: 'Année' };

  const TABS = ['global', 'morpion', 'puissance4', 'reversi'] as const;
  type Tab = typeof TABS[number];
  const [activeTab, setActiveTab] = useState<Tab>('global');

  let statsData = null;
  if (stats) {
    statsData = activeTab === 'global' ? stats.global : stats.byGame[activeTab];
  }

  return (
    <div className="dashboard">
      <UserList users={userList}/>
      <div className="dashboard-right">
        <div className="dashboard-main">
          <h1>Dashboard</h1>
          <p>Welcome, {appContext.appState.user?.pseudo}</p>
          <div className="dashboard-stats">
            <div className="dashboard-stats__tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`dashboard-stats__tab${activeTab === t ? ' dashboard-stats__tab--active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t === 'global' ? 'Global' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
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
            {statsData && (
              <div className="dashboard-stats__body">
                <span>{statsData.total} parties — {statsData.wins}V / {statsData.losses}D / {statsData.draws}N — {statsData.ratio}%</span>
              </div>
            )}
          </div>
        </div>
        <NotificationFeed notifications={notifications} />
      </div>
    </div>
  )
}