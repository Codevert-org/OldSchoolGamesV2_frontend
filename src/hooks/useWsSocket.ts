import { useContext } from "react";
import WsContext from "../contexts/wsContext";
const useIoSocket = () => {
    return useContext(WsContext);
};

export default useIoSocket;