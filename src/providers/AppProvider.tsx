import { useState, type ReactNode } from "react";
import { AppContext, type Appstate } from "../contexts/appContext";

type AppProps = {
  children: ReactNode
}

function AppProvider({children} : AppProps) {
  
  const [appState, setAppState] = useState<Appstate>({accessToken: '', user: null});
  const value = {appState, setAppState};

  if(!appState.accessToken && localStorage.getItem('accessToken')) {
    setAppState({accessToken: localStorage.getItem('accessToken') as string, user: JSON.parse(localStorage.getItem("userInfos") as string)});
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppProvider;