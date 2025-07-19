"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Settings, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OthelloBoard } from "@/components/othello-board";
import { GameInfo } from "@/components/game-info";
import { DifficultySelect } from "@/components/difficulty-select";
import { useOthelloGame } from "@/hooks/use-othello-game";
import type { Difficulty } from "@/lib/othello-game";

export default function AIGamePage() {
  const [currentDifficulty, setCurrentDifficulty] =
    useState<Difficulty>("medium");
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showResignDialog, setShowResignDialog] = useState(false);
  const {
    gameState,
    isAiThinking,
    makeMove,
    restartGame,
    resignGame,
    changeDifficulty,
    undoMove,
  } = useOthelloGame("ai", currentDifficulty);

  // Track if the game has started (any moves made)
  const gameHasStarted =
    gameState.moveHistory && gameState.moveHistory.length > 0;

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setCurrentDifficulty(newDifficulty);
    changeDifficulty(newDifficulty);
    setHasGameStarted(false); // Reset game started flag when difficulty changes
  };

  const handleMove = async (row: number, col: number) => {
    const success = await makeMove(row, col);
    if (success && !hasGameStarted) {
      setHasGameStarted(true);
    }
    return success;
  };

  const handleRestart = () => {
    restartGame();
    setHasGameStarted(false);
  };

  const handleResign = () => {
    setShowResignDialog(true);
  };

  const confirmResign = () => {
    resignGame();
    setShowResignDialog(false);
    setHasGameStarted(false);
  };

  const handleUndo = () => {
    const success = undoMove();
    if (success) {
      // Undo was successful, no need to change hasGameStarted
      // since we're just rolling back moves
    }
  };

  // Show difficulty selector when:
  // 1. Game hasn't started yet, OR
  // 2. Game is over (completed)
  const showDifficultySelector = !gameHasStarted || gameState.isGameOver;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      {/* Header */}
      <header className="border-b border-slate-600/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-slate-200 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">Othello vs AI</h1>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-slate-200 hover:bg-slate-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <OthelloBoard
                board={gameState.board}
                validMoves={gameState.validMoves}
                lastMove={gameState.lastMove}
                currentPlayer={gameState.currentPlayer}
                onMove={handleMove}
                disabled={
                  gameState.isGameOver ||
                  gameState.currentPlayer === "white" ||
                  isAiThinking
                }
                isAiThinking={isAiThinking}
                className="w-full max-w-2xl mx-auto"
              />
            </motion.div>
          </div>

          {/* Game Info Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GameInfo
                currentPlayer={gameState.currentPlayer}
                blackScore={gameState.blackScore}
                whiteScore={gameState.whiteScore}
                gameMode={gameState.gameMode}
                difficulty={gameState.difficulty}
                isGameOver={gameState.isGameOver}
                winner={gameState.winner}
                onRestart={handleRestart}
                onResign={handleResign}
                isAiThinking={isAiThinking}
              />
            </motion.div>

            {/* Difficulty Selection - Show before game starts or after game ends */}
            {showDifficultySelector && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
              >
                <DifficultySelect
                  difficulty={currentDifficulty}
                  onDifficultyChange={handleDifficultyChange}
                />
                {!gameHasStarted && (
                  <p className="text-sm text-slate-400 mt-3">
                    Choose your difficulty level to start playing
                  </p>
                )}
                {gameState.isGameOver && (
                  <p className="text-sm text-slate-400 mt-3">
                    Game completed! You can change difficulty for the next game
                  </p>
                )}
              </motion.div>
            )}

            {/* Undo Button - Show when game has started and undo is available */}
            {gameHasStarted && !gameState.isGameOver && gameState.canUndo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
              >
                <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Undo Move
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  You have {gameState.undosRemaining} undo
                  {gameState.undosRemaining !== 1 ? "s" : ""} remaining
                  {gameState.difficulty === "easy" && " (3 max on Easy)"}
                  {gameState.difficulty === "medium" && " (1 max on Medium)"}
                  {gameState.difficulty === "hard" && " (0 max on Hard)"}
                </p>
                <Button
                  onClick={handleUndo}
                  disabled={!gameState.canUndo || isAiThinking}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo Last Move
                </Button>
              </motion.div>
            )}

            {/* Game Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
            >
              <h3 className="font-semibold mb-3 text-white">How to Play</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Place your piece to trap opponent pieces</li>
                <li>• All trapped pieces flip to your color</li>
                <li>• You must make a move that flips at least one piece</li>
                <li>• The player with the most pieces wins</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Resign Confirmation Dialog */}
      <Dialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resign Game</DialogTitle>
            <DialogDescription>
              Are you sure you want to resign? This will end the current game
              and count as a loss.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResignDialog(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmResign}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              Resign Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
