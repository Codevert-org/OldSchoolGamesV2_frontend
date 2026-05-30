import React from 'react';
import './GameBoard.css';

type GameBoardProps = Readonly<{
  cols: string;
  rows: string;
  gameName: string;
  handleCellClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  cellsContent?: Record<string, React.ReactNode>;
}>;

export function GameBoard(props: GameBoardProps) {
  const cells = [];
  for (let i = 1; i <= Number(props.rows); i++) {
    for (let j = 1; j <= Number(props.cols); j++) {
      cells.push(`c${j}${i}`);
    }
  }

  return (
    <div
      className="GameBoard"
      style={{
        '--cols': props.cols,
        '--rows': props.rows,
        '--min-playable-width': `calc(${props.cols} * 44px)`,
      } as React.CSSProperties}
    >
      <div className="jouability-guard">
        Screen too small to play {props.gameName}. Try on a larger device or rotate your screen.
      </div>
      <div className="game-grid">
        {cells.map((cell) => (
          <button
            id={cell}
            className="cells"
            key={`${cell}-cell`}
            style={{
              borderTop: 'none',
              borderLeft: 'none',
              borderBottom: Number(cell.substring(2)) === Number(props.rows) ? 'none' : '1px solid green',
              borderRight: Number(cell.substring(1, 2)) === Number(props.cols) ? 'none' : '1px solid green',
              borderImage: 'none',
              borderRadius: 0,
            }}
            onClick={props.handleCellClick}
          >{props.cellsContent?.[cell]}</button>
        ))}
      </div>
    </div>
  );
}
