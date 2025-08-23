import { useEffect, useState, type ReactNode } from "react";
import { AppContext, type Appstate } from "../contexts/appContext";

type AppProps = {
  children: ReactNode
}

function AppProvider({children} : AppProps) {
  
  const [appState, setAppState] = useState<Appstate>({accessToken: '', user: null});
  const value = {appState, setAppState};

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
  })

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
    // <p>{appState.user?.pseudo}</p>
  )
}

export default AppProvider;