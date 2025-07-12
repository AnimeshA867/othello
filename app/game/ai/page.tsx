"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OthelloBoard } from "@/components/othello-board";
import { GameInfo } from "@/components/game-info";
import { DifficultySelect } from "@/components/difficulty-select";
import { useOthelloGame } from "@/hooks/use-othello-game";
import type { Difficulty } from "@/lib/othello-game";

export default function AIGamePage() {
  const [currentDifficulty, setCurrentDifficulty] =
    useState<Difficulty>("medium");
  const {
    gameState,
    isAiThinking,
    makeMove,
    restartGame,
    resignGame,
    changeDifficulty,
  } = useOthelloGame("ai", currentDifficulty);

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setCurrentDifficulty(newDifficulty);
    changeDifficulty(newDifficulty);
  };

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
                onMove={makeMove}
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
                onRestart={restartGame}
                onResign={resignGame}
                isAiThinking={isAiThinking}
              />
            </motion.div>

            {/* Difficulty Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
            >
              <DifficultySelect
                difficulty={currentDifficulty}
                onDifficultyChange={handleDifficultyChange}
              />
            </motion.div>

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
    </div>
  );
}
