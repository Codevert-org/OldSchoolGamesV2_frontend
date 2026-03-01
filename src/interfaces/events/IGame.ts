export interface IGameResult {
  winner?: string;
  draw?: boolean;
}

export interface IGameEventData {
  eventType: 'getGameData' | 'play' | 'reload' | 'leave';
  // Backend renvoie error dans result (pas dans eventType) quand une action échoue
  result: {
    opponent?: string;
    turn?: string;
    cells?: Record<string, string | false>;
    cellToDraw?: string;
    token?: string;
    flippedCells?: string[];
    pass?: string;
    ready?: boolean;
    requestedBy?: string[];
    result?: IGameResult;
    error?: string;
  };
}
