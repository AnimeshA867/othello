"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  OthelloGame,
  type GameState,
  type GameMode,
  type Difficulty,
  type Player,
} from "@/lib/othello-game";

export function useOthelloGame(
  gameMode: GameMode = "ai",
  difficulty: Difficulty = "medium",
  playerColor: "black" | "white" = "black"
) {
  const aiColor = playerColor === "black" ? "white" : "black";
  const [currentDifficulty, setCurrentDifficulty] = useState(difficulty);
  const [game] = useState(
    () => new OthelloGame(gameMode, currentDifficulty, aiColor)
  );
  const [gameState, setGameState] = useState<GameState>(game.getGameState());
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const aiMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateGameState = useCallback(() => {
    setGameState(game.getGameState());
  }, [game]);

  // Trigger AI move if it's the AI's turn
  const triggerAiMoveIfNeeded = useCallback(() => {
    const currentGameState = game.getGameState();
    if (
      gameMode === "ai" &&
      currentGameState.currentPlayer === aiColor &&
      !currentGameState.isGameOver
    ) {
      setIsAiThinking(true);
      aiMoveTimeoutRef.current = setTimeout(() => {
        const aiMove = game.getBestMove();
        if (aiMove) {
          const aiSuccess = game.makeMove(aiMove.row, aiMove.col);
          if (aiSuccess) {
            updateGameState();
          }
        }
        setIsAiThinking(false);
      }, 1000);
    }
  }, [game, gameMode, aiColor, updateGameState]);

  // Start the game explicitly (needed when player is white so AI goes first)
  const startGame = useCallback(() => {
    setGameStarted(true);
    // If AI goes first (player is white, AI is black), trigger AI move
    if (aiColor === "black") {
      triggerAiMoveIfNeeded();
    }
  }, [aiColor, triggerAiMoveIfNeeded]);

  const makeMove = useCallback(
    async (row: number, col: number) => {
      // Auto-start the game on first human move
      if (!gameStarted) {
        setGameStarted(true);
      }

      const success = game.makeMove(row, col);
      if (success) {
        updateGameState();

        // If it's AI mode, trigger AI move after the player's move
        if (gameMode === "ai") {
          triggerAiMoveIfNeeded();
        }
      }
      return success;
    },
    [game, gameMode, gameStarted, updateGameState, triggerAiMoveIfNeeded]
  );

  const restartGame = useCallback(
    (newDifficulty?: Difficulty, newPlayerColor?: "black" | "white") => {
      // Clear any pending AI move
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
        aiMoveTimeoutRef.current = null;
      }

      const targetDifficulty = newDifficulty || currentDifficulty;
      const newAiColor =
        newPlayerColor === "black"
          ? "white"
          : newPlayerColor === "white"
          ? "black"
          : aiColor;

      setCurrentDifficulty(targetDifficulty);
      const newGame = new OthelloGame(gameMode, targetDifficulty, newAiColor);
      // Replace the game instance
      Object.assign(game, newGame);
      updateGameState();
      setIsAiThinking(false);
      setGameStarted(false);
    },
    [game, gameMode, currentDifficulty, aiColor, updateGameState]
  );

  const resignGame = useCallback(() => {
    // Clear any pending AI move
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    // The AI wins when the player resigns
    gameState.winner = aiColor as Player;
    gameState.isGameOver = true;
    gameState.validMoves = [];
    setIsAiThinking(false);
  }, [gameState, aiColor]);

  const changeDifficulty = useCallback(
    (newDifficulty: Difficulty) => {
      restartGame(newDifficulty);
    },
    [restartGame]
  );

  const undoMove = useCallback(() => {
    const success = game.undoLastMove();
    if (success) {
      // Clear any pending AI move
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
        aiMoveTimeoutRef.current = null;
      }
      updateGameState();
      setIsAiThinking(false);
    }
    return success;
  }, [game, updateGameState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
      }
    };
  }, []);

  return {
    gameState,
    isAiThinking,
    gameStarted,
    makeMove,
    startGame,
    restartGame,
    resignGame,
    changeDifficulty,
    updateGameState,
    undoMove,
  };
}
