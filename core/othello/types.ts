export type DiscColor = "black" | "white";
export type Winner = DiscColor | "draw" | null;

export interface Position {
  row: number;
  col: number;
}

export interface MatrixGameState {
  board: (DiscColor | null)[][];
  currentPlayer: DiscColor;
  validMoves: Position[];
  lastMove: Position | null;
  blackScore: number;
  whiteScore: number;
  isGameOver: boolean;
  winner: Winner;
  moveHistory: Position[];
  drawOfferedBy?: DiscColor | null;
  rematchOfferedBy?: DiscColor | null;
  revision: number;
  gameId: string;
  passCount: number;
}

export interface BitboardGameState {
  blackBits: bigint;
  whiteBits: bigint;
  currentPlayer: DiscColor;
  validMoveMask: bigint;
  lastMoveIndex: number | null;
  blackScore: number;
  whiteScore: number;
  isGameOver: boolean;
  winner: Winner;
  moveHistory: number[];
  revision: number;
  gameId: string;
  passCount: number;
}

export interface MoveValidationResult {
  valid: boolean;
  reason?:
    | "GAME_OVER"
    | "OUT_OF_TURN"
    | "STALE_REVISION"
    | "STALE_GAME"
    | "INVALID_MOVE";
}

export type OthelloEvent =
  | { type: "move_applied"; row: number; col: number; player: DiscColor }
  | { type: "turn_passed"; player: DiscColor }
  | {
      type: "game_over";
      winner: Winner;
      blackScore: number;
      whiteScore: number;
      reason: "no_moves_both";
    }
  | { type: "restarted"; gameId: string };

export type OthelloCommand =
  | {
      type: "make_move";
      player: DiscColor;
      row: number;
      col: number;
      expectedRevision?: number;
      expectedGameId?: string;
    }
  | { type: "restart" };

export interface TransitionResult {
  state: MatrixGameState;
  events: OthelloEvent[];
  error?: MoveValidationResult;
}
