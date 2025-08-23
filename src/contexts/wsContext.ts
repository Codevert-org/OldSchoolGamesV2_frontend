import { createContext } from "react"
import type { Socket } from "socket.io-client"

type WsContextType = {
  Socket: Socket;
  ioClose: () => void;
}

export const WsContext = createContext<WsContextType | null>(null)