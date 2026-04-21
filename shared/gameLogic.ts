"use strict";

import { createInitialState, transition } from "../core/othello/stateMachine";
import type { DiscColor, MatrixGameState } from "../core/othello/types";

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
  rematchOfferedBy?: "black" | "white" | null;
  moveHistory: Position[];
  revision?: number;
  gameId?: string;
  passCount?: number;
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

function fromCoreState(state: MatrixGameState): GameState {
  return {
    board: state.board,
    currentPlayer: state.currentPlayer,
    validMoves: state.validMoves,
    lastMove: state.lastMove,
    blackScore: state.blackScore,
    whiteScore: state.whiteScore,
    isGameOver: state.isGameOver,
    winner: state.winner,
    drawOfferedBy: state.drawOfferedBy ?? null,
    rematchOfferedBy: state.rematchOfferedBy ?? null,
    moveHistory: state.moveHistory,
    revision: state.revision,
    gameId: state.gameId,
    passCount: state.passCount,
  };
}

function toCoreState(state: GameState): MatrixGameState {
  return {
    board: state.board,
    currentPlayer: state.currentPlayer,
    validMoves: state.validMoves,
    lastMove: state.lastMove,
    blackScore: state.blackScore,
    whiteScore: state.whiteScore,
    isGameOver: state.isGameOver,
    winner: state.winner,
    drawOfferedBy: state.drawOfferedBy ?? null,
    rematchOfferedBy: state.rematchOfferedBy ?? null,
    moveHistory: state.moveHistory,
    revision: state.revision ?? 0,
    gameId: state.gameId ?? generateRoomId(),
    passCount: state.passCount ?? 0,
  };
}

export function createInitialGameState(): GameState {
  return fromCoreState(createInitialState());
}

export function getValidMoves(
  board: ("black" | "white" | null)[][],
  player: "black" | "white",
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
  col: number,
): GameState {
  const coreState = toCoreState(gameState);
  const result = transition(coreState, {
    type: "make_move",
    player: gameState.currentPlayer as DiscColor,
    row,
    col,
  });

  if (result.error) {
    throw new Error(result.error.reason || "Invalid move");
  }

  const updated = fromCoreState(result.state);
  return {
    ...updated,
    drawOfferedBy: gameState.drawOfferedBy ?? null,
    rematchOfferedBy: gameState.rematchOfferedBy ?? null,
  };
}

export function isValidMove(
  gameState: GameState,
  row: number,
  col: number,
): boolean {
  return gameState.validMoves.some(
    (move) => move.row === row && move.col === col,
  );
}
