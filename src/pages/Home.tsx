import { useContext } from "react"
import { AppContext } from "../contexts/appContext"
import { Header } from "../components/Header/Header";

export function Home() {
  const appContext = useContext(AppContext);
  console.log('appState : ', appContext.appState);
  return (
    <>
    <Header />
    <p>Home works !</p>
    <p>Welcome {appContext.appState.user?.pseudo}</p>
    </>
  )
}