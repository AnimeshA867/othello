import { describe, expect, it } from "vitest";
import {
  getFriendGameOverDialogCopy,
  getFriendGameRenderState,
} from "./view-state";

const emptyBoard = Array(8)
  .fill(null)
  .map(() => Array(8).fill(null));

describe("friend view state", () => {
  it("uses authoritative board and scores when session is synced", () => {
    const renderState = getFriendGameRenderState({
      matchSession: {
        syncStatus: "synced",
        board: emptyBoard,
        currentPlayer: "white",
        phase: "active_turn",
        winner: null,
      },
      gameState: {
        board: [["black"]],
        currentPlayer: "black",
        isGameOver: false,
        winner: null,
        blackScore: 4,
        whiteScore: 3,
        validMoves: [{ row: 1, col: 2 }],
        lastMove: { row: 2, col: 3 },
      },
      authoritativeScores: {
        blackScore: 10,
        whiteScore: 12,
      },
      authoritativeValidMoves: [{ row: 4, col: 5 }],
      authoritativeLastMove: { row: 6, col: 7 },
    });

    expect(renderState.boardForRender).toEqual(emptyBoard);
    expect(renderState.scoresForRender).toEqual({
      blackScore: 10,
      whiteScore: 12,
    });
    expect(renderState.validMovesForRender).toEqual([{ row: 4, col: 5 }]);
    expect(renderState.lastMoveForRender).toEqual({ row: 6, col: 7 });
  });

  it("falls back to local game state when session is stale", () => {
    const localBoard = [["black", "white"]];
    const renderState = getFriendGameRenderState({
      matchSession: {
        syncStatus: "stale",
        board: emptyBoard,
        currentPlayer: "white",
        phase: "active_turn",
        winner: null,
      },
      gameState: {
        board: localBoard,
        currentPlayer: "black",
        isGameOver: false,
        winner: null,
        blackScore: 7,
        whiteScore: 5,
        validMoves: [{ row: 0, col: 2 }],
        lastMove: { row: 0, col: 1 },
      },
      authoritativeScores: {
        blackScore: 99,
        whiteScore: 99,
      },
      authoritativeValidMoves: [{ row: 7, col: 7 }],
      authoritativeLastMove: { row: 7, col: 6 },
    });

    expect(renderState.boardForRender).toEqual(localBoard);
    expect(renderState.scoresForRender).toEqual({
      blackScore: 7,
      whiteScore: 5,
    });
    expect(renderState.validMovesForRender).toEqual([{ row: 0, col: 2 }]);
    expect(renderState.lastMoveForRender).toEqual({ row: 0, col: 1 });
  });

  it("builds game-over dialog copy from winner and player role", () => {
    expect(getFriendGameOverDialogCopy("draw", "black")).toBe(
      "The game ended in a draw!",
    );
    expect(getFriendGameOverDialogCopy("black", "black")).toBe(
      "Congratulations! You won the game!",
    );
    expect(getFriendGameOverDialogCopy("white", "black")).toBe(
      "You lost this game. Better luck next time!",
    );
  });
});
