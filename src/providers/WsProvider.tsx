import { type ReactNode } from "react";
import socketIOClient from "socket.io-client";

import {WsContext} from "../contexts/wsContext";

type IoSocketProviderProps = {
    children: ReactNode
}

function WsProvider({children} : IoSocketProviderProps) {
    let ioUrl: string = "";
    if(import.meta.env.VITE_BACKEND_URL) {
        ioUrl = `${import.meta.env.VITE_BACKEND_URL}/events`;
    }

    const Socket = socketIOClient(ioUrl, { transports: ['websocket'], auth: {token: localStorage.getItem('accessToken')}});

    function ioClose() {
        Socket.close();
    }

    const value = {
        Socket,
        ioClose
    }

    return (
      <WsContext.Provider value={value}>
        {children}
      </WsContext.Provider>
    )
}

export default WsProvider;