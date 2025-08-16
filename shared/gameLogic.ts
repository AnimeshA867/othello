"use strict";

export interface Player {
  id: string;
  name?: string;
  rank: number;
  color: "black" | "white";
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: ("black" | "white" | null)[][];
  currentPlayer: "black" | "white";
  validMoves: Position[];
  lastMove: Position | null;
  blackScore: number;
  whiteScore: number;
  isGameOver: boolean;
  winner: "black" | "white" | "draw" | null;
  drawOfferedBy?: "black" | "white" | null;
  moveHistory: Position[];
}

export interface Room {
  roomId: string;
  players: Player[];
  rankSetType: "beginner" | "intermediate" | "advanced" | "custom";
  status: "waiting" | "active" | "finished";

  gameState: GameState;
  createdAt: Date;
}

export type RankSetType = "beginner" | "intermediate" | "advanced" | "custom";

export const rankRanges = {
  beginner: { min: 0, max: 1000 },
  intermediate: { min: 1001, max: 2000 },
  advanced: { min: 2001, max: 3000 },
};

export function isValidRankSetType(type: string): type is RankSetType {
  return ["beginner", "intermediate", "advanced", "custom"].includes(type);
}

export function generateRoomId(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function createInitialGameState(): GameState {
  // Create an 8x8 board filled with null
  const board: ("black" | "white" | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Set up the initial pieces
  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";

  // Calculate valid moves for the starting player (black)
  const validMoves = getValidMoves(board, "black");

  return {
    board,
    currentPlayer: "black",
    blackScore: 2,
    whiteScore: 2,
    validMoves,
    lastMove: null,
    isGameOver: false,
    winner: null,
    moveHistory: [],
  };
}

export function getValidMoves(
  board: ("black" | "white" | null)[][],
  player: "black" | "white"
): Position[] {
  const validMoves: Position[] = [];
  const opponent = player === "black" ? "white" : "black";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] !== null) continue;

      const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];

      let isValidMove = false;

      for (const [dx, dy] of directions) {
        let r = row + dx;
        let c = col + dy;
        let foundOpponent = false;

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          if (board[r][c] === opponent) {
            foundOpponent = true;
          } else if (board[r][c] === player && foundOpponent) {
            isValidMove = true;
            break;
          } else {
            break;
          }
          r += dx;
          c += dy;
        }

        if (isValidMove) break;
      }

      if (isValidMove) {
        validMoves.push({ row, col });
      }
    }
  }

  return validMoves;
}

export function makeMove(
  gameState: GameState,
  row: number,
  col: number
): GameState {
  if (!isValidMove(gameState, row, col)) {
    throw new Error("Invalid move");
  }

  const newBoard = gameState.board.map((r) => [...r]);
  const player = gameState.currentPlayer;
  const opponent = player === "black" ? "white" : "black";

  // Place the piece
  newBoard[row][col] = player;

  // Flip opponent pieces
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    const piecesToFlip: Position[] = [];

    while (r >= 0 && r < 8 && c >= 0 && c < 8 && newBoard[r][c] === opponent) {
      piecesToFlip.push({ row: r, col: c });
      r += dx;
      c += dy;
    }

    if (
      r >= 0 &&
      r < 8 &&
      c >= 0 &&
      c < 8 &&
      newBoard[r][c] === player &&
      piecesToFlip.length > 0
    ) {
      for (const pos of piecesToFlip) {
        newBoard[pos.row][pos.col] = player;
      }
    }
  }

  // Count the scores
  let blackScore = 0;
  let whiteScore = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (newBoard[r][c] === "black") blackScore++;
      else if (newBoard[r][c] === "white") whiteScore++;
    }
  }

  // Switch player
  const nextPlayer = player === "black" ? "white" : "black";
  const validMoves = getValidMoves(newBoard, nextPlayer);

  // If next player has no valid moves, check if current player has moves
  let currentPlayerTurn: "black" | "white" = nextPlayer;
  let currentValidMoves = validMoves;

  if (validMoves.length === 0) {
    const currentPlayerMoves = getValidMoves(newBoard, player);
    if (currentPlayerMoves.length > 0) {
      currentPlayerTurn = player;
      currentValidMoves = currentPlayerMoves;
    }
  }

  // Check for game over
  const isGameOver =
    blackScore + whiteScore === 64 || currentValidMoves.length === 0;
  let winner: "black" | "white" | "draw" | null = null;

  if (isGameOver) {
    if (blackScore > whiteScore) {
      winner = "black";
    } else if (whiteScore > blackScore) {
      winner = "white";
    } else {
      winner = "draw";
    }
  }

  // Update move history
  const moveHistory = [...gameState.moveHistory, { row, col }];

  return {
    board: newBoard,
    currentPlayer: currentPlayerTurn,
    blackScore,
    whiteScore,
    validMoves: currentValidMoves,
    lastMove: { row, col },
    isGameOver,
    winner,
    moveHistory,
  };
}

export function isValidMove(
  gameState: GameState,
  row: number,
  col: number
): boolean {
  return gameState.validMoves.some(
    (move) => move.row === row && move.col === col
  );
}
