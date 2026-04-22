type PlayerColor = "black" | "white";
type Winner = PlayerColor | "draw" | null;
type GameMode = "searching" | "ai" | "multiplayer";

interface Position {
  row: number;
  col: number;
}

interface RankedRenderInput {
  gameMode: GameMode;
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

export function getRankedGameRenderState(input: RankedRenderInput) {
  const {
    gameMode,
    matchSession,
    gameState,
    authoritativeScores,
    authoritativeValidMoves,
    authoritativeLastMove,
  } = input;

  const useAuthoritativeSession =
    gameMode === "multiplayer" && matchSession.syncStatus === "synced";
  const isSyncedBoard = useAuthoritativeSession && matchSession.board.length === 8;

  const boardForRender = isSyncedBoard ? matchSession.board : gameState.board;
  const currentPlayerForRender = useAuthoritativeSession
    ? matchSession.currentPlayer
    : ((gameState.currentPlayer ?? "black") as PlayerColor);
  const isGameOverForRender =
    gameState.isGameOver ||
    (useAuthoritativeSession && matchSession.phase === "game_over");
  const winnerForRender =
    useAuthoritativeSession && matchSession.winner
      ? matchSession.winner
      : gameState.winner;

  const scoresForRender = useAuthoritativeSession
    ? authoritativeScores
    : {
        blackScore: gameState.blackScore,
        whiteScore: gameState.whiteScore,
      };
  const validMovesForRender = useAuthoritativeSession
    ? authoritativeValidMoves
    : gameState.validMoves;
  const lastMoveForRender = useAuthoritativeSession
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

export function getRankedGameOverDialogCopy(params: {
  winnerForRender: Winner;
  gameMode: GameMode;
  playerRole: PlayerColor | null;
  opponentName: string;
}): string {
  const { winnerForRender, gameMode, playerRole, opponentName } = params;
  if (winnerForRender === "draw") {
    return "The game ended in a draw!";
  }

  const isWin =
    (gameMode === "multiplayer" && winnerForRender === playerRole) ||
    (gameMode === "ai" && winnerForRender === "black");

  return isWin
    ? `Congratulations! You defeated ${opponentName}!`
    : `${opponentName} won this game. Better luck next time!`;
}
