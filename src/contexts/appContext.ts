import { createContext, type Context, type Dispatch, type SetStateAction } from "react";

export interface Appstate {
  accessToken: string;
  user: {
    id: number;
    pseudo: string;
    avatarUrl: string | null
  } | null
}

export interface AppContext {
  appState : Appstate
  setAppState: Dispatch<SetStateAction<Appstate>>
}

const AppContext: Context<AppContext> = createContext<AppContext>({
  appState : {
    accessToken: '',
    user: null
  },
  setAppState: () => {}
})

export default AppContext;