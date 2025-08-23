import { Header } from "../components/Header/Header";
import { Outlet } from "react-router-dom";
import WsProvider from "../providers/WsProvider";

export function Home() {
  // TODO: setup WebSocket connexion in a context provider

  
  return (
    <WsProvider>
      <Header />
      <Outlet />
    </WsProvider>
  )
}