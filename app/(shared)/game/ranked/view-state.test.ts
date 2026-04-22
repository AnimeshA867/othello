import { describe, expect, it } from "vitest";
import {
  getRankedGameOverDialogCopy,
  getRankedGameRenderState,
} from "./view-state";

const emptyBoard = Array(8)
  .fill(null)
  .map(() => Array(8).fill(null));

describe("ranked view state", () => {
  it("uses authoritative multiplayer state when synced", () => {
    const renderState = getRankedGameRenderState({
      gameMode: "multiplayer",
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
        blackScore: 9,
        whiteScore: 11,
      },
      authoritativeValidMoves: [{ row: 4, col: 5 }],
      authoritativeLastMove: { row: 6, col: 7 },
    });

    expect(renderState.boardForRender).toEqual(emptyBoard);
    expect(renderState.currentPlayerForRender).toBe("white");
    expect(renderState.scoresForRender).toEqual({ blackScore: 9, whiteScore: 11 });
    expect(renderState.validMovesForRender).toEqual([{ row: 4, col: 5 }]);
    expect(renderState.lastMoveForRender).toEqual({ row: 6, col: 7 });
  });

  it("falls back to local state when multiplayer session is stale", () => {
    const localBoard = [["black", "white"]];
    const renderState = getRankedGameRenderState({
      gameMode: "multiplayer",
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
    expect(renderState.currentPlayerForRender).toBe("black");
    expect(renderState.scoresForRender).toEqual({ blackScore: 7, whiteScore: 5 });
    expect(renderState.validMovesForRender).toEqual([{ row: 0, col: 2 }]);
    expect(renderState.lastMoveForRender).toEqual({ row: 0, col: 1 });
  });

  it("keeps AI mode on local state even if selector snapshot exists", () => {
    const localBoard = [["black", null]];
    const renderState = getRankedGameRenderState({
      gameMode: "ai",
      matchSession: {
        syncStatus: "synced",
        board: emptyBoard,
        currentPlayer: "white",
        phase: "game_over",
        winner: "white",
      },
      gameState: {
        board: localBoard,
        currentPlayer: "black",
        isGameOver: true,
        winner: "black",
        blackScore: 40,
        whiteScore: 24,
        validMoves: [],
        lastMove: { row: 5, col: 5 },
      },
      authoritativeScores: {
        blackScore: 1,
        whiteScore: 63,
      },
      authoritativeValidMoves: [{ row: 7, col: 7 }],
      authoritativeLastMove: { row: 7, col: 7 },
    });

    expect(renderState.boardForRender).toEqual(localBoard);
    expect(renderState.winnerForRender).toBe("black");
    expect(renderState.scoresForRender).toEqual({ blackScore: 40, whiteScore: 24 });
  });

  it("builds ranked game-over dialog copy for draw, multiplayer win, and loss", () => {
    expect(
      getRankedGameOverDialogCopy({
        winnerForRender: "draw",
        gameMode: "multiplayer",
        playerRole: "black",
        opponentName: "Rival",
      }),
    ).toBe("The game ended in a draw!");

    expect(
      getRankedGameOverDialogCopy({
        winnerForRender: "black",
        gameMode: "multiplayer",
        playerRole: "black",
        opponentName: "Rival",
      }),
    ).toBe("Congratulations! You defeated Rival!");

    expect(
      getRankedGameOverDialogCopy({
        winnerForRender: "white",
        gameMode: "ai",
        playerRole: "black",
        opponentName: "Bot",
      }),
    ).toBe("Bot won this game. Better luck next time!");
  });
});
