"use client";

import { useState, useCallback, useEffect } from "react";
import {
  OthelloGame,
  type GameState,
  type GameMode,
  type Difficulty,
} from "@/lib/othello-game";

export function useOthelloGame(
  gameMode: GameMode = "ai",
  difficulty: Difficulty = "medium"
) {
  const [currentDifficulty, setCurrentDifficulty] = useState(difficulty);
  const [game] = useState(() => new OthelloGame(gameMode, currentDifficulty));
  const [gameState, setGameState] = useState<GameState>(game.getGameState());
  const [isAiThinking, setIsAiThinking] = useState(false);

  const updateGameState = useCallback(() => {
    setGameState(game.getGameState());
  }, [game]);

  const makeMove = useCallback(
    async (row: number, col: number) => {
      const success = game.makeMove(row, col);
      if (success) {
        updateGameState();

        // If it's AI mode and now it's white's turn (AI), make AI move
        if (gameMode === "ai") {
          const currentGameState = game.getGameState();
          if (
            currentGameState.currentPlayer === "white" &&
            !currentGameState.isGameOver
          ) {
            // Set AI thinking state for smooth UX
            setIsAiThinking(true);

            // Make AI move after exactly 1 second for smooth experience
            setTimeout(() => {
              const aiMove = game.getBestMove();
              if (!aiMove) {
                // Handle case where AI has no valid moves
                gameState.currentPlayer = "black"; // Pass turn back to player
                setIsAiThinking(false);

                return;
              }
              if (aiMove) {
                const aiSuccess = game.makeMove(aiMove.row, aiMove.col);
                if (aiSuccess) {
                  updateGameState();
                }
              }
              setIsAiThinking(false);
            }, 1000); // Exactly 1 second delay
          }
        }
      }
      return success;
    },
    [game, gameMode, updateGameState]
  );

  const restartGame = useCallback(
    (newDifficulty?: Difficulty) => {
      const targetDifficulty = newDifficulty || currentDifficulty;
      setCurrentDifficulty(targetDifficulty);
      const newGame = new OthelloGame(gameMode, targetDifficulty);
      // Replace the game instance
      Object.assign(game, newGame);
      updateGameState();
      setIsAiThinking(false);
    },
    [game, gameMode, currentDifficulty, updateGameState]
  );

  const resignGame = useCallback(() => {
    // Implementation for resignation
    // For now, just restart the game
    gameState.winner = "white";
    gameState.isGameOver = true;
    gameState.validMoves = [];
    // restartGame();
  }, [gameState]);

  const changeDifficulty = useCallback(
    (newDifficulty: Difficulty) => {
      restartGame(newDifficulty);
    },
    [restartGame]
  );

  const undoMove = useCallback(() => {
    const success = game.undoLastMove();
    if (success) {
      updateGameState();
      setIsAiThinking(false);
    }
    return success;
  }, [game, updateGameState]);

  // Handle initial AI move if AI goes first (in some variants)
  useEffect(() => {
    if (
      gameMode === "ai" &&
      gameState.currentPlayer === "white" &&
      !gameState.isGameOver
    ) {
      // In standard Othello, black goes first, so this won't trigger initially
      // But it's here for completeness
    }
  }, [gameMode, gameState.currentPlayer, gameState.isGameOver]);

  return {
    gameState,
    isAiThinking,
    makeMove,
    restartGame,
    resignGame,
    changeDifficulty,
    updateGameState,
    undoMove,
  };
}
