import { createContext } from "react"
import type { IWsProvider } from "../interfaces/events/IWsProvider";

const WsContext = createContext<IWsProvider | null>(null);

export default WsContext;