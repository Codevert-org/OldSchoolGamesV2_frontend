import { useLocation, useNavigate } from 'react-router'
import { useContext, useEffect, useCallback, useRef, useState } from 'react';
import { GameBoard } from "../GameBoard";
import WsContext from "../../../contexts/wsContext";

import './Morpion.scss';
import { AppContext } from '../../../contexts/appContext';
import { Box, Button } from '../../../components';

export function Morpion() {
  const location = useLocation();
  const navigate = useNavigate();
  const wsContext = useContext(WsContext);
  const appContext = useContext(AppContext);
  const socket = wsContext?.Socket;
  //TODO Placer dans un state pour éviter la perte lors d'un re-render ?
  const roomName: string | null = location.state?.roomName;
  const [opponent, setOpponent] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [reloadRequestedBy, setReloadRequestedBy] = useState<string[]>([]);
  const boardEnabledRef = useRef(true);

  const handleCellClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if(!boardEnabledRef.current) return;
    if(socket && roomName) {
      socket.emit('game', {eventType: 'play', roomName, cellName: event.currentTarget.id})
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
          //TODO utiliser useRef ?
          setOpponent(data.result.opponent);
          const turnLabel = document.getElementById('game-turn-data');
          if(turnLabel) {
            turnLabel.innerText = `À ${data.result.turn} de jouer`;
          }
        }
        if(data.eventType === 'play') {
          if(data.result.cellToDraw) {
            const cellElement: HTMLElement | null = document.getElementById(data.result.cellToDraw);
            if(cellElement) {
              cellElement.innerText = data.result.token;
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
              // TODO handle reload requests.
              
            }
          }
          else {
            console.error('turn label not found');
          }
        }
        if(data.eventType === 'reload') {
          // TODO handle reload
          if(data.result.ready) {
            //TODO reset board
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
            //console.log('reload completed !');

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
  }, [socket, roomName, navigate])

  return (
    <div className="Morpion">
      <div id="game-turn-data"></div>
      <Box><GameBoard cols='3' rows='3' width='300' handleCellClick={handleCellClick} /></Box>
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