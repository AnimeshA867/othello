"use client";

import { OthelloBoard } from "@/components/othello-board";
import { GameSidebar } from "@/components/game-sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOthelloGame } from "@/hooks/use-othello-game";
import { useToast } from "@/hooks/use-toast";
import type { Difficulty } from "@/lib/othello-game";

export default function AIGamePage() {
  const [currentDifficulty, setCurrentDifficulty] =
    useState<Difficulty>("medium");
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showGameOverStatusDialog, setShowGameOverStatusDialog] =
    useState(false);
  const { toast } = useToast();

  const {
    gameState,
    isAiThinking,
    makeMove,
    restartGame,
    resignGame,
    changeDifficulty,
    undoMove,
  } = useOthelloGame("ai", currentDifficulty);

  // Show toast when game is over
  useEffect(() => {
    if (gameState.isGameOver) {
      setShowGameOverStatusDialog(true);

      const winner = gameState.winner;
      if (winner === "draw") {
        toast({
          title: "Game Over",
          description: "It's a draw! Well played!",
        });
      } else if (winner === "black") {
        toast({
          title: "You Win!",
          description: "Congratulations! You beat the AI!",
        });
      } else {
        toast({
          title: "Game Over",
          description: "AI wins this round. Try again!",
        });
      }
    }
  }, [gameState.isGameOver, gameState.winner]);

  const handleMove = async (row: number, col: number) => {
    return await makeMove(row, col);
  };

  const handleRestart = () => {
    restartGame();
    toast({
      title: "New Game",
      description: "Starting fresh game against AI",
    });
  };

  const handleResign = () => {
    setShowResignDialog(true);
  };

  const confirmResign = () => {
    resignGame();

    setShowResignDialog(false);
    toast({
      title: "Game Resigned",
      description: "You can start a new game anytime!",
    });
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setCurrentDifficulty(newDifficulty);
    changeDifficulty(newDifficulty);
    toast({
      title: "Difficulty Changed",
      description: `AI difficulty set to ${newDifficulty}`,
    });
  };

  const handleUndo = () => {
    const success = undoMove();
    if (success) {
      toast({
        title: "Move Undone",
        description: "Previous move has been undone",
      });
    } else {
      toast({
        title: "Cannot Undo",
        description: "No moves to undo",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `
               linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
               linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
             `,
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] relative z-10">
        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            {/* Game Header */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-between mb-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettingsDialog(true)}
                    className="text-gray-300 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRestart}
                    className="text-gray-300 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                VS AI ({currentDifficulty})
              </h1>
              <p className={`text-sm ${getDifficultyColor(currentDifficulty)}`}>
                {isAiThinking
                  ? "AI is thinking..."
                  : `Playing against ${currentDifficulty} AI`}
              </p>
            </div>

            <OthelloBoard
              board={gameState.board}
              validMoves={gameState.validMoves}
              lastMove={gameState.lastMove}
              currentPlayer={gameState.currentPlayer}
              onMove={handleMove}
              disabled={gameState.isGameOver || isAiThinking}
              isAiThinking={isAiThinking}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
          <GameSidebar
            currentPlayer={gameState.currentPlayer as "black" | "white"}
            playerColor="black"
            blackScore={gameState.blackScore}
            whiteScore={gameState.whiteScore}
            opponentName="AI"
            gameMode="ai"
            gameStatus={gameState.isGameOver ? "finished" : "playing"}
            onResign={handleResign}
            onRestart={handleRestart}
            onUndo={handleUndo}
            canUndo={gameState.moveHistory.length > 0 && !isAiThinking}
            isAiThinking={isAiThinking}
          />
        </div>
      </div>

      {/* Win Status */}
      <Dialog
        open={showGameOverStatusDialog}
        onOpenChange={setShowGameOverStatusDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {gameState.winner !== "draw"
              ? gameState.winner == "black"
                ? `Congratulations! You win!`
                : `Better luck next time!`
              : "It's a draw!"}
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowGameOverStatusDialog(false);
                handleRestart();
              }}
            >
              Play Again
            </Button>
            <Button onClick={() => setShowGameOverStatusDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resign Confirmation Dialog */}
      <Dialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resign Game?</DialogTitle>
            <DialogDescription>
              Are you sure you want to resign this game? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResignDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmResign}>
              Resign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
            <DialogDescription>
              Adjust AI difficulty level. Changing difficulty will start a new
              game.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-3 text-gray-200">
              AI Difficulty
            </label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map(
                (difficulty) => (
                  <Button
                    key={difficulty}
                    variant={
                      currentDifficulty === difficulty ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleDifficultyChange(difficulty)}
                    className={`capitalize ${
                      currentDifficulty === difficulty
                        ? getDifficultyColor(difficulty)
                        : "text-gray-400"
                    }`}
                  >
                    {difficulty}
                  </Button>
                )
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettingsDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
