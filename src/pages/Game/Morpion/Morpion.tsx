import { useLocation, useNavigate } from 'react-router'
import { useContext, useEffect, useCallback, useRef, useState } from 'react';
import { GameBoard } from "../GameBoard";
import { WsContext, AppContext } from "../../../contexts";
import { Box, Button } from '../../../components';
import type { IGameEventData } from "../../../interfaces/events/IGame";

import './Morpion.scss';

export function Morpion() {
  const wsContext = useContext(WsContext);
  const appContext = useContext(AppContext);
  const socket = wsContext?.Socket;
  const location = useLocation();
  const navigate = useNavigate();
  const roomName: string | null = location.state?.roomName;
  const [opponent, setOpponent] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [reloadRequestedBy, setReloadRequestedBy] = useState<string[]>([]);
  const [cells, setCells] = useState<Record<string, string>>({});
  const [turn, setTurn] = useState<string>('');
  const boardEnabledRef = useRef(true);
  const socketRef = useRef(socket);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  const handleCellClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if(!boardEnabledRef.current) return;
    if(socketRef.current && roomName) {
      socketRef.current.emit('game', {eventType: 'play', roomName, cellName: event.currentTarget.id})
    }
  }, [roomName]);

  const requestReload = () => {
    socket?.emit('game', {eventType: 'reload', roomName});
  }

  const handlePlay = useCallback((data: IGameEventData) => {
    if(data.result.cellToDraw && data.result.token) {
      const cellId = data.result.cellToDraw;
      const token = data.result.token;
      setCells((prev) => ({ ...prev, [cellId]: token }));
    }
    if(data.result.turn) {
      setTurn(`À ${data.result.turn} de jouer`);
    } else {
      const gameResult = data.result.result;
      if(gameResult?.winner) {
        setTurn(`${gameResult.winner} a gagné !`);
        setGameEnded(true);
      } else if(gameResult?.draw) {
        setTurn('match nul !');
        setGameEnded(true);
      }
      boardEnabledRef.current = !gameResult?.winner && !gameResult?.draw;
    }
  }, []);

  const handleReload = useCallback((data: IGameEventData) => {
    if(data.result.ready) {
      setCells({});
      setTurn(`À ${data.result.turn} de jouer`);
      setReloadRequestedBy([]);
      setGameEnded(false);
      boardEnabledRef.current = true;
    } else {
      setReloadRequestedBy(data.result.requestedBy ?? []);
    }
  }, []);

  useEffect(() => {
    if(!roomName) {
      navigate('/');
      return;
    }
    if(socket) {
      socket.emit('game', {eventType: 'getGameData', roomName});

      socket.on('game', (data) => {
        if(data.result?.error) {
          setTurn(`Erreur : ${data.result.error}`);
          return;
        }
        if(data.eventType === 'getGameData') {
          setOpponent(data.result.opponent);
          setTurn(`À ${data.result.turn} de jouer`);
        }
        if(data.eventType === 'play') handlePlay(data);
        if(data.eventType === 'reload') handleReload(data);
        if(data.eventType === 'leave') navigate('/');
      });
    }
    return () => {
      if(socket) {
        socket.emit('game', {eventType: "leave", roomName});
        socket.off('game');
      }
    }
  }, [socket, roomName, navigate, handlePlay, handleReload]);

  return (
    <div className="Morpion">
      <div id="game-turn-data">{turn}</div>
      <Box><GameBoard cols='3' rows='3' width='300' handleCellClick={handleCellClick} cellsContent={cells} /></Box>
      <div className='reload-handler'>
        {gameEnded && !reloadRequestedBy.includes(appContext.appState.user?.pseudo as string) && (
          <div className='reload-buttons'><Button type='button' callback={() => navigate('/')} label="❌ Quitter la partie"/><Button type='button' callback={() => requestReload()} label="✅ rejouer" /></div>
        )}
        {
          gameEnded && (
            <p>{appContext.appState.user?.pseudo} {reloadRequestedBy.includes(appContext.appState.user?.pseudo as string) ? '✅' : ''} | {reloadRequestedBy.includes(opponent ?? '') ? '✅' : ''} {opponent}</p>
          )
        }
      </div>
    </div>
  )
}
