type PlayerColor = "black" | "white";
type Winner = PlayerColor | "draw" | null;

interface Position {
  row: number;
  col: number;
}

interface FriendGameRenderInput {
  matchSession: {
    syncStatus: "synced" | "stale";
    board: (PlayerColor | null)[][];
    currentPlayer: PlayerColor;
    phase:
      | "idle"
      | "waiting_for_players"
      | "active_turn"
      | "pass_pending"
      | "game_over"
      | "restarting";
    winner: Winner;
  };
  gameState: {
    board: (PlayerColor | null)[][];
    currentPlayer: PlayerColor | null;
    isGameOver: boolean;
    winner: Winner;
    blackScore: number;
    whiteScore: number;
    validMoves: Position[];
    lastMove: Position | null;
  };
  authoritativeScores: {
    blackScore: number;
    whiteScore: number;
  };
  authoritativeValidMoves: Position[];
  authoritativeLastMove: Position | null;
}

export function getFriendGameRenderState(input: FriendGameRenderInput) {
  const {
    matchSession,
    gameState,
    authoritativeScores,
    authoritativeValidMoves,
    authoritativeLastMove,
  } = input;

  const isSyncedBoard =
    matchSession.syncStatus === "synced" && matchSession.board.length === 8;

  const boardForRender = isSyncedBoard ? matchSession.board : gameState.board;
  const currentPlayerForRender =
    matchSession.syncStatus === "synced"
      ? matchSession.currentPlayer
      : ((gameState.currentPlayer ?? "black") as PlayerColor);
  const isGameOverForRender =
    gameState.isGameOver || matchSession.phase === "game_over";
  const winnerForRender =
    matchSession.syncStatus === "synced" && matchSession.winner
      ? matchSession.winner
      : gameState.winner;

  const scoresForRender =
    matchSession.syncStatus === "synced"
      ? authoritativeScores
      : {
          blackScore: gameState.blackScore,
          whiteScore: gameState.whiteScore,
        };
  const validMovesForRender =
    matchSession.syncStatus === "synced"
      ? authoritativeValidMoves
      : gameState.validMoves;
  const lastMoveForRender =
    matchSession.syncStatus === "synced"
      ? authoritativeLastMove
      : gameState.lastMove;

  return {
    boardForRender,
    currentPlayerForRender,
    isGameOverForRender,
    winnerForRender,
    scoresForRender,
    validMovesForRender,
    lastMoveForRender,
  };
}

export function getFriendGameOverDialogCopy(
  winnerForRender: Winner,
  playerRole: PlayerColor | null,
): string {
  if (winnerForRender === "draw") {
    return "The game ended in a draw!";
  }
  if (winnerForRender && winnerForRender === playerRole) {
    return "Congratulations! You won the game!";
  }
  return "You lost this game. Better luck next time!";
}
