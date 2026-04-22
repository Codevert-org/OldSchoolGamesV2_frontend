import React from 'react';

interface GameBoardProps {
  cols: string;
  rows: string;
  width: string;
  handleCellClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  cellsContent?: Record<string, React.ReactNode>;
}

export function GameBoard(props: GameBoardProps) {
  const cells = [];
  for(let i = 1; i <= Number(props.rows); i++) {
    for(let j = 1; j <= Number(props.cols); j++) {
      cells.push(`c${j}${i}`);
    }
  }

  let gridColumns = '';
  for(let i=1; i<= Number(props.cols); i++) {
    gridColumns += ' 1fr';
  }

  const cellSize = Number(props.width) / Number(props.cols);

  return (
    <div className="GameBoard">
      <div
        className="game-grid"
        style={{
          display: 'grid',
          width: `${props.width}px`,
          height: `${cellSize * Number(props.rows)}px`,
          gridTemplateColumns: gridColumns,
        }}
      >
        {cells.map((cell) => (
          <button
            id={cell}
            className="cells"
            key={`${cell}-cell`}
            style={{
              borderTop: 'none',
              borderLeft: 'none',
              borderBottom: Number(cell.substring(2)) === Number(props.rows) ? 'none' : '1px solid green',
              borderRight: Number(cell.substring(1,2)) === Number(props.cols) ? 'none' : '1px solid green',
              borderImage: 'none',
              borderRadius: 0,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: cellSize * 0.2,
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'inherit',
            }}
            onClick={props.handleCellClick}
          >{props.cellsContent?.[cell]}</button>
        ))}
      </div>
    </div>
  )
}
