import type { Player, Position } from "@/lib/othello-game";

type GameMode = "searching" | "ai" | "multiplayer";

interface GameRenderState {
  boardForRender: Player[][];
  currentPlayerForRender: Player;
  isGameOverForRender: boolean;
  winnerForRender: "black" | "white" | "draw" | null;
  scoresForRender: {
    blackScore: number;
    whiteScore: number;
  };
  validMovesForRender: Position[];
  lastMoveForRender: Position | null;
}

interface MatchSession {
  board?: Player[][];
  currentPlayer?: Player;
  isGameOver?: boolean;
  winner?: "black" | "white" | "draw" | null;
  blackScore?: number;
  whiteScore?: number;
  validMoves?: Position[];
  lastMove?: Position;
  authoritiveScores?: {
    blackScore: number;
    whiteScore: number;
  };
  authoritiveValidMoves?: Position[];
  authoritiveLastMove?: Position;
}

interface GameStateType {
  board: Player[][];
  currentPlayer: Player;
  isGameOver: boolean;
  winner: "black" | "white" | "draw" | null;
  blackScore: number;
  whiteScore: number;
  validMoves: Position[];
  lastMove: Position | null;
}

interface GetRankedGameRenderStateParams {
  gameMode: GameMode;
  matchSession: MatchSession | null;
  gameState: Partial<GameStateType>;
  authoritativeScores: { blackScore: number; whiteScore: number } | null;
  authoritativeValidMoves: Position[] | null;
  authoritativeLastMove: Position | null;
}

export function getRankedGameRenderState({
  gameMode,
  matchSession,
  gameState,
  authoritativeScores,
  authoritativeValidMoves,
  authoritativeLastMove,
}: GetRankedGameRenderStateParams): GameRenderState {
  if (gameMode === "multiplayer" && matchSession) {
    // Use authoritative multiplayer state from match session
    return {
      boardForRender:
        (matchSession.board as Player[][]) ||
        (gameState.board as Player[][]) ||
        [],
      currentPlayerForRender:
        (matchSession.currentPlayer as Player) ||
        (gameState.currentPlayer as Player) ||
        null,
      isGameOverForRender:
        matchSession.isGameOver ?? (gameState.isGameOver as boolean) ?? false,
      winnerForRender:
        matchSession.winner ??
        (gameState.winner as "black" | "white" | "draw" | null) ??
        null,
      scoresForRender: authoritativeScores || {
        blackScore:
          (matchSession.blackScore as number) ||
          (gameState.blackScore as number) ||
          0,
        whiteScore:
          (matchSession.whiteScore as number) ||
          (gameState.whiteScore as number) ||
          0,
      },
      validMovesForRender:
        authoritativeValidMoves ||
        convertToPositions(
          matchSession.validMoves || (gameState.validMoves as unknown[]) || [],
        ),
      lastMoveForRender:
        authoritativeLastMove ??
        (matchSession.lastMove as Position | null) ??
        null,
    };
  }

  // Use local AI game state
  return {
    boardForRender: (gameState.board as Player[][]) || [],
    currentPlayerForRender: (gameState.currentPlayer as Player) || null,
    isGameOverForRender: (gameState.isGameOver as boolean) ?? false,
    winnerForRender:
      (gameState.winner as "black" | "white" | "draw" | null) ?? null,
    scoresForRender: {
      blackScore: (gameState.blackScore as number) ?? 0,
      whiteScore: (gameState.whiteScore as number) ?? 0,
    },
    validMovesForRender: convertToPositions(
      (gameState.validMoves as unknown[]) || [],
    ),
    lastMoveForRender: (gameState.lastMove as Position | null) ?? null,
  };
}

function convertToPositions(items: unknown[]): Position[] {
  return items
    .map((item) => {
      if (
        Array.isArray(item) &&
        item.length === 2 &&
        typeof item[0] === "number" &&
        typeof item[1] === "number"
      ) {
        return { row: item[0], col: item[1] };
      }
      if (item && typeof item === "object" && "row" in item && "col" in item) {
        return item as Position;
      }
      return null;
    })
    .filter((item): item is Position => item !== null);
}

interface GetRankedGameOverDialogCopyParams {
  winnerForRender: "black" | "white" | "draw" | null;
  gameMode: GameMode;
  playerRole?: Player;
  opponentName?: string;
}

export function getRankedGameOverDialogCopy({
  winnerForRender,
  gameMode,
  playerRole,
  opponentName = "Opponent",
}: GetRankedGameOverDialogCopyParams): string {
  if (winnerForRender === "draw") {
    return "The game ended in a draw!";
  }

  if (gameMode === "multiplayer" && playerRole && playerRole !== null) {
    if (winnerForRender === playerRole) {
      return `🎉 You won! Congratulations on your victory against ${opponentName}!`;
    } else if (winnerForRender === null) {
      return "The game is still in progress.";
    } else {
      return `😔 You lost against ${opponentName}. Better luck next time!`;
    }
  }

  // AI mode
  if (winnerForRender === "black") {
    return "🎉 You won! Congratulations on your victory!";
  } else if (winnerForRender === "white") {
    return `😔 ${opponentName} won this round. Better luck next time!`;
  }

  return "The game is complete.";
}
