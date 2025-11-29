import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WsContext, AppContext } from "../../../contexts";
import { GameBoard } from "../GameBoard";
import { Box, Button } from '../../../components';

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
  const boardEnabledRef = useRef(true);

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
      socket.emit('game', {eventType: 'play', roomName, col: event.currentTarget.id.substring(1, 2)})
    }
    }, [socket, roomName]);

  const requestReload = () => {
    socket?.emit('game', {eventType: 'reload', roomName});
  }

  useEffect(() => {
    if(!roomName) {
      console.log('no room name, redirecting to dashboard');
      navigate('/');
      return;
    }
    if(socket) {
      socket.emit('game', {eventType: 'getGameData', roomName});

      socket.on('game', (data) => {
        if(data.eventType === 'getGameData') {
          const turnLabel = document.getElementById('game-turn-data');
          //TODO utiliser useRef ?
          setOpponent(data.result.opponent);
          if(turnLabel) {
            turnLabel.innerText = `À ${data.result.turn} de jouer`;
          }
        }
        if(data.eventType === 'play') {
          if(data.result.cellToDraw) {
            const cellElement: HTMLElement | null = document.getElementById(data.result.cellToDraw);
            if(cellElement) {
              const rowIndex = Number(data.result.cellToDraw.substring(2));
              drawToken(cellElement, data.result.token, rowIndex);
            }
            else {
              console.error('cell not found');
            }
          }

          const turnLabel = document.getElementById('game-turn-data');
          if(turnLabel) {
            if(data.result.turn) {
              turnLabel.innerText = `À ${data.result.turn} de jouer`;
            }
            else {
              if(data.result.result.winner) {
                turnLabel.innerText = `${data.result.result.winner} a gagné !`;
                // TODO color cells.
                setGameEnded(true);
              }
              else if(data.result.result.draw) {
                turnLabel.innerText = "match nul !";
                setGameEnded(true);
              }
              boardEnabledRef.current = !data.result.result.winner && !data.result.result.draw;
            }
          }
          else {
            console.error('turn label not found');
          }
        }
        if(data.eventType === 'reload') {
          console.log('reload event received : ', data);
          if(data.result.ready) {
            // empty cells
            const cellElements = document.querySelectorAll('.cells');
            cellElements.forEach((cell) => cell.innerHTML = '');
            // set turn
            const turnLabel = document.getElementById('game-turn-data');
            if(turnLabel) {
              turnLabel.innerText = `À ${data.result.turn} de jouer`;
            }
            // reset reloadRequestedBy and gameEnded
            setReloadRequestedBy([]);
            setGameEnded(false);
            boardEnabledRef.current = true;
          } else {
            setReloadRequestedBy(data.result.requestedBy);
          }
        }
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
  }, [socket, roomName, navigate]);
  
  return <div className="Puissance4">
    <div id="game-turn-data">Puissance 4 works !</div>
    <Box><GameBoard cols='7' rows='6' width='350' handleCellClick={handleCellClick} /></Box>
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