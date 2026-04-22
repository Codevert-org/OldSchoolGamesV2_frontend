import { useEffect, useMemo, useState, type ReactNode } from "react";
import { type Appstate } from "../contexts/appContext";
import { AppContext } from "../contexts";

type AppProps = {
  children: ReactNode
}

function AppProvider({children} : AppProps) {
  
  const [appState, setAppState] = useState<Appstate>({accessToken: '', user: null});
  const value = useMemo(() => ({ appState, setAppState }), [appState]);

  useEffect(() => {
    async function fetchUser() {
      if(!appState.accessToken && localStorage.getItem('accessToken')) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        if(response.ok) {
          const user = await response.json();
          localStorage.setItem('userInfos', JSON.stringify(user));
          setAppState({accessToken: localStorage.getItem('accessToken') as string, user});
        }
      }
    }
    fetchUser();
  // Intentionnel : exécution au montage uniquement — relancer sur chaque changement de token provoquerait une boucle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppProvider;