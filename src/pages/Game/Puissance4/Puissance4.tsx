import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WsContext, AppContext } from "../../../contexts";
import { GameBoard } from "../GameBoard";
import { Box, Button } from '../../../components';
import type { IGameEventData } from "../../../interfaces/events/IGame";

import './Puissance4.scss'

export function Puissance4() {
  const wsContext = useContext(WsContext);
  const appContext = useContext(AppContext);
  const socket = wsContext?.Socket;
  const location = useLocation();
  const navigate = useNavigate();
  const roomName: string | null = location.state?.roomName;
  const [opponent, setOpponent] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [reloadRequestedBy, setReloadRequestedBy] = useState<string[]>([]);
  const [cells, setCells] = useState<Record<string, React.ReactNode>>({});
  const [turn, setTurn] = useState<string>('Puissance 4 works !');
  const boardEnabledRef = useRef(true);

  // Animation impérative : on anime le SVG directement via requestAnimationFrame
  // car React state ne peut pas piloter une animation frame-by-frame
  const drawToken = (cellElement: HTMLElement, color: string, rowIndex: number) => {
    const svgContent = `<svg width="46" height="46"><circle cx="23" cy="23" r="20" stroke="black" stroke-width="2" fill="${color}"/></svg>`;
    cellElement.innerHTML = svgContent;

    const svg = cellElement.querySelector('svg') as SVGElement;
    if(!svg) return;

    // Calculate initial position (above the gameboard, based on row index)
    let tokenPosition = rowIndex * -100 - 100;
    let requestId: number;

    const animate = () => {
      tokenPosition += 50;
      svg.style.transform = `translate3d(0, ${tokenPosition}px, 0)`;
      if(tokenPosition === 0) {
        cancelAnimationFrame(requestId);
      } else {
        requestId = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const handleCellClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if(!boardEnabledRef.current) return;
    if(socket && roomName) {
      // Puissance4 envoie la colonne, pas la cellule exacte (le serveur trouve la ligne)
      socket.emit('game', {eventType: 'play', roomName, col: event.currentTarget.id.substring(1, 2)})
    }
  }, [socket, roomName]);

  const requestReload = () => {
    socket?.emit('game', {eventType: 'reload', roomName});
  }

  const handlePlay = useCallback((data: IGameEventData) => {
    if(data.result.cellToDraw && data.result.token) {
      const cellId = data.result.cellToDraw;
      const token = data.result.token;
      const rowIndex = Number(cellId.substring(2));
      // On injecte un span dont la ref déclenche l'animation dès le montage DOM
      setCells((prev) => ({
        ...prev,
        [cellId]: <span ref={(el) => { if(el) drawToken(el as unknown as HTMLElement, token, rowIndex); }} />,
      }));
    }
    if(data.result.turn) {
      setTurn(`À ${data.result.turn} de jouer`);
    } else {
      const gameResult = data.result.result;
      if(gameResult?.winner) {
        setTurn(`${gameResult.winner} a gagné !`);
        // TODO color cells.
        setGameEnded(true);
      } else if(gameResult?.draw) {
        setTurn('match nul !');
        setGameEnded(true);
      }
      boardEnabledRef.current = !gameResult?.winner && !gameResult?.draw;
    }
  }, []);

  const handleReload = useCallback((data: IGameEventData) => {
    console.log('reload event received : ', data);
    if(data.result.ready) {
      // empty cells
      setCells({});
      // set turn
      setTurn(`À ${data.result.turn} de jouer`);
      // reset reloadRequestedBy and gameEnded
      setReloadRequestedBy([]);
      setGameEnded(false);
      boardEnabledRef.current = true;
    } else {
      setReloadRequestedBy(data.result.requestedBy ?? []);
    }
  }, []);

  useEffect(() => {
    if(!roomName) {
      console.log('no room name, redirecting to dashboard');
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
          //TODO utiliser useRef ?
          setOpponent(data.result.opponent);
          setTurn(`À ${data.result.turn} de jouer`);
        }
        if(data.eventType === 'play') handlePlay(data);
        if(data.eventType === 'reload') handleReload(data);
        if(data.eventType === 'leave') {
          console.log('game left');
          navigate('/');
        }
      });
    }
    return () => {
      if(socket) {
        socket.emit('game', {eventType: "leave", roomName});
        socket.off('game');
      }
    }
  }, [socket, roomName, navigate, handlePlay, handleReload]);

  return <div className="Puissance4">
    <div id="game-turn-data">{turn}</div>
    <Box><GameBoard cols='7' rows='6' width='350' handleCellClick={handleCellClick} cellsContent={cells} /></Box>
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
}
