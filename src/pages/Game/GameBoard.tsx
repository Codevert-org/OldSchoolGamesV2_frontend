import './GameBoard.scss';

interface GameBoardProps {
  cols: string;
  rows: string;
  width: string;
  handleCellClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export function GameBoard(props: GameBoardProps) {
  const cells = [];
  for(let i = 1; i <= Number(props.rows); i++) {
    for(let j = 1; j <= Number(props.cols); j++) {
      cells.push(`c${j}${i}`);
    }
  }

  // Set the grid-template-column value
  let gridColumns = '';
  for(let i=1; i<= Number(props.cols); i++) {
    gridColumns += ' 1fr';
  }

  return (
    <div className="GameBoard">
      <div
        className="game-grid"
        style={{
          display: 'grid',
          width: `${props.width}px`,
          height: `${Number(props.width) / Number(props.cols) * Number(props.rows)}px`,
          gridTemplateColumns: gridColumns,
        }}
      >
        {cells.map((cell) => (
          <div
            id={cell}
            className="cells"
            key={`${cell}-cell`}
            style={{
              borderBottom: Number(cell.substring(2)) === Number(props.rows) ? 'none' : '1px solid green',
              borderRight: Number(cell.substring(1,2)) === Number(props.cols) ? 'none' : '1px solid green',
              height: `${Number(props.width) / Number(props.cols)}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: (Number(props.width)/Number(props.cols)) * 0.2,
            }}
            onClick={props.handleCellClick}
          ></div>
        ))}
      </div>
    </div>
  )
}
