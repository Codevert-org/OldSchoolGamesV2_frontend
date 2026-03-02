import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WsContext, AppContext } from '../../../contexts';
import { GameBoard } from '../GameBoard';
import { Box, Button } from '../../../components';
import type { IGameEventData } from '../../../interfaces/events/IGame';

import './Reversi.scss';

// Couleurs des tokens par joueur (player1 = white, player2 = black)
const TOKEN_COLORS: Record<string, string> = {
  white: 'white',
  black: 'black',
};

function drawToken(el: HTMLElement, color: string) {
  el.innerHTML = `<svg width="46" height="46"><circle cx="23" cy="23" r="20" stroke="black" stroke-width="2" fill="${color}"/></svg>`;
}

/**
 * Animation de retournement : ellipse qui s'aplatit dans l'ancienne couleur,
 * bascule vers la nouvelle, puis se regonfle.
 */
function flipToken(el: HTMLElement, fromColor: string, toColor: string) {
  const steps = [25, 20, 15, 10, 5];
  el.innerHTML = `<svg width="46" height="46"><ellipse cx="23" cy="23" rx="20" ry="20" stroke="black" stroke-width="2" fill="${fromColor}"/></svg>`;
  const ellipse = el.querySelector('ellipse') as SVGEllipseElement;
  if (!ellipse) return;

  steps.forEach((rx, i) => {
    setTimeout(() => { ellipse.setAttribute('rx', String(rx)); }, i * 50);
  });
  setTimeout(() => { ellipse.setAttribute('fill', toColor); }, steps.length * 50);
  steps.slice().reverse().forEach((rx, i) => {
    setTimeout(() => { ellipse.setAttribute('rx', String(rx)); }, (steps.length + 1 + i) * 50);
  });
  setTimeout(() => {
    el.innerHTML = `<svg width="46" height="46"><circle cx="23" cy="23" r="20" stroke="black" stroke-width="2" fill="${toColor}"/></svg>`;
  }, (steps.length * 2 + 1) * 50);
}

export function Reversi() {
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
  const [turn, setTurn] = useState<string>('');
  const boardEnabledRef = useRef(true);
  // Référence aux couleurs actuelles des cellules pour l'animation flip
  const cellColorsRef = useRef<Record<string, string>>({});

  const handleCellClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!boardEnabledRef.current) return;
    if (socket && roomName) {
      socket.emit('game', { eventType: 'play', roomName, cellName: event.currentTarget.id });
    }
  }, [socket, roomName]);

  const requestReload = () => {
    socket?.emit('game', { eventType: 'reload', roomName });
  };

  const handlePlay = useCallback((data: IGameEventData) => {
    if (data.result.cellToDraw && data.result.token) {
      const cellId = data.result.cellToDraw;
      const token = data.result.token;
      const flipped = data.result.flippedCells ?? [];

      setCells((prev) => {
        const next = { ...prev, [cellId]: null }; // placeholder, remplacé ci-dessous
        // On pose le nouveau pion (pas de flip)
        next[cellId] = <span ref={(el) => {
          if (!el) return;
          cellColorsRef.current[cellId] = token;
          drawToken(el as unknown as HTMLElement, TOKEN_COLORS[token] ?? token);
        }} />;
        // On retourne les pions adverses avec animation
        for (const fid of flipped) {
          const fromColor = cellColorsRef.current[fid];
          cellColorsRef.current[fid] = token;
          next[fid] = <span ref={(el) => {
            if (!el) return;
            if (fromColor) {
              flipToken(el as unknown as HTMLElement, TOKEN_COLORS[fromColor] ?? fromColor, TOKEN_COLORS[token] ?? token);
            } else {
              drawToken(el as unknown as HTMLElement, TOKEN_COLORS[token] ?? token);
            }
          }} />;
        }
        return next;
      });
    }

    if (data.result.pass) {
      setTurn(`${data.result.pass} ne peut pas jouer — ${data.result.turn} rejoue`);
      return;
    }
    if (data.result.turn) {
      setTurn(`À ${data.result.turn} de jouer`);
    } else {
      const gameResult = data.result.result;
      if (gameResult?.winner) {
        setTurn(`${gameResult.winner} a gagné !`);
        setGameEnded(true);
      } else if (gameResult?.draw) {
        setTurn('Match nul !');
        setGameEnded(true);
      }
      boardEnabledRef.current = !gameResult?.winner && !gameResult?.draw;
    }
  }, []);

  const handleReload = useCallback((data: IGameEventData) => {
    if (data.result.ready) {
      setCells({});
      cellColorsRef.current = {};
      setTurn(`À ${data.result.turn} de jouer`);
      setReloadRequestedBy([]);
      setGameEnded(false);
      boardEnabledRef.current = true;
    } else {
      setReloadRequestedBy(data.result.requestedBy ?? []);
    }
  }, []);

  useEffect(() => {
    if (!roomName) {
      console.log('no room name, redirecting to dashboard');
      navigate('/');
      return;
    }
    if (socket) {
      socket.emit('game', { eventType: 'getGameData', roomName });

      socket.on('game', (data) => {
        if (data.result?.error) {
          setTurn(`Erreur : ${data.result.error}`);
          return;
        }
        if (data.eventType === 'getGameData') {
          setOpponent(data.result.opponent);
          setTurn(`À ${data.result.turn} de jouer`);
          // Recharger l'état initial des pions (partie en cours après reconnexion)
          if (data.result.cells) {
            const initialCells: Record<string, React.ReactNode> = {};
            for (const [cellId, color] of Object.entries(data.result.cells as Record<string, string>)) {
              if (color) {
                cellColorsRef.current[cellId] = color;
                initialCells[cellId] = <span ref={(el) => {
                  if (el) drawToken(el as unknown as HTMLElement, TOKEN_COLORS[color] ?? color);
                }} />;
              }
            }
            setCells(initialCells);
          }
        }
        if (data.eventType === 'play') handlePlay(data);
        if (data.eventType === 'reload') handleReload(data);
        if (data.eventType === 'leave') {
          console.log('game left');
          navigate('/');
        }
      });
    }
    return () => {
      if (socket) {
        socket.emit('game', { eventType: 'leave', roomName });
        socket.off('game');
      }
    };
  }, [socket, roomName, navigate, handlePlay, handleReload]);

  return (
    <div className="Reversi">
      <div id="game-turn-data">{turn}</div>
      <Box>
        <GameBoard cols='8' rows='8' width='400' handleCellClick={handleCellClick} cellsContent={cells} />
      </Box>
      <div className='reload-handler'>
        {gameEnded && !reloadRequestedBy.includes(appContext.appState.user?.pseudo as string) && (
          <div className='reload-buttons'>
            <Button type='button' callback={() => navigate('/')} label="❌ Quitter la partie" />
            <Button type='button' callback={() => requestReload()} label="✅ Rejouer" />
          </div>
        )}
        {gameEnded && (
          <p>
            {appContext.appState.user?.pseudo} {reloadRequestedBy.includes(appContext.appState.user?.pseudo as string) ? '✅' : ''} | {reloadRequestedBy.includes(opponent ?? '') ? '✅' : ''} {opponent}
          </p>
        )}
      </div>
    </div>
  );
}
