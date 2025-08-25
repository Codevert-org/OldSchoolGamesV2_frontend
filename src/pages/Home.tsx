import { Header } from "../components/Header/Header";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import type { IWsProvider } from "../interfaces/events/IWsProvider";
import useWsSocket from "../hooks/useWsSocket";

export function Home() {
  // TODO: setup WebSocket connexion in a context provider
  const {ioClose} = useWsSocket() as IWsProvider;

  useEffect(() => {
    return () => {
      ioClose();
    }
    
  }, [ioClose]);
  
  return (
    <>
      <Header ioClose={ioClose}/>
      <Outlet />
    </>
  )
}