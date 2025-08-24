import type { Socket } from "socket.io-client";

export interface IWsProvider {
    Socket:Socket,
    ioClose: () => void
}