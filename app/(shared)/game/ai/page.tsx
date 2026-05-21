"use client";

import { OthelloBoard } from "@/components/othello-board";
import { GameSidebar } from "@/components/game-sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Settings, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { useUser } from "@stackframe/stack";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setShowResignDialog,
  setShowSettingsDialog,
} from "@/lib/redux/slices/uiSlice";
import { setDifficulty, setGameMode } from "@/lib/redux/slices/gameSlice";
import {
  incrementGameStats,
  completeTutorial,
} from "@/lib/redux/slices/userSlice";
import { TutorialDialog } from "@/components/tutorial-dialog";

function getRandomColor(): "black" | "white" {
  return Math.random() < 0.5 ? "black" : "white";
}

export default function AIGamePage() {
  const dispatch = useAppDispatch();
  const currentDifficulty = useAppSelector(
    (state: any) => state.game.difficulty
  );
  const showResignDialog = useAppSelector(
    (state: any) => state.ui.showResignDialog
  );
  const showSettingsDialog = useAppSelector(
    (state: any) => state.ui.showSettingsDialog
  );
  const hasCompletedTutorial = useAppSelector(
    (state: any) => state.user.hasCompletedTutorial
  );
  const { toast } = useToast();
  const user = useUser();
  const gameStartTimeRef = useRef<number>(Date.now());
  const gameRecordedRef = useRef<boolean>(false);
  const gameOverDialogShownRef = useRef<boolean>(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isGameEnding, setIsGameEnding] = useState(false);
  const [playerColor, setPlayerColor] = useState<"black" | "white">(
    getRandomColor
  );

  const {
    gameState,
    isAiThinking,
    gameStarted,
    makeMove,
    startGame,
    restartGame,
    resignGame,
    changeDifficulty,
    undoMove,
  } = useOthelloGame("ai", currentDifficulty, playerColor);

  const aiColor = playerColor === "black" ? "white" : "black";

  // Show tutorial for new users
  useEffect(() => {
    if (!hasCompletedTutorial) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTutorial]);

  // Set game mode and initialize difficulty on mount
  useEffect(() => {
    dispatch(setGameMode("ai"));
    if (!currentDifficulty) {
      dispatch(setDifficulty("easy"));
    }
  }, [dispatch, currentDifficulty]);

  // Record game result when game is over
  useEffect(() => {
    if (
      gameState.isGameOver &&
      !gameRecordedRef.current &&
      !gameOverDialogShownRef.current &&
      user
    ) {
      gameOverDialogShownRef.current = true;
      setIsGameEnding(true);
      const winner = gameState.winner;
      const duration = Math.floor(
        (Date.now() - gameStartTimeRef.current) / 1000
      );

      const playerWon = winner === playerColor;
      const isDraw = winner === "draw";

      // Increment game stats in Redux
      dispatch(
        incrementGameStats({
          won: playerWon,
          draw: isDraw,
          mode: "ai",
        })
      );

      // Record the game result
      fetch("/api/games/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ai",
          won: playerWon,
          draw: isDraw,
          score:
            playerColor === "black"
              ? gameState.blackScore
              : gameState.whiteScore,
          opponentScore:
            playerColor === "black"
              ? gameState.whiteScore
              : gameState.blackScore,
          duration,
          difficulty: currentDifficulty,
        }),
      })
        .then(() => {
          // Check for achievement unlocks
          return fetch("/api/achievements", {
            method: "POST",
          });
        })
        .then((res) => res.json())
        .then((data) => {
          // Show achievement notifications
          if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
            data.newlyUnlocked.forEach((achievement: any) => {
              toast({
                title: "🏆 Achievement Unlocked!",
                description: `${achievement.achievement.name}: ${achievement.achievement.description}`,
                duration: 5000,
              });
            });
          }
        })
        .catch(console.error);

      gameRecordedRef.current = true;

      // Show toast
      if (isDraw) {
        toast({
          title: "Game Over",
          description: "It's a draw! Well played!",
        });
      } else if (playerWon) {
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
  }, [
    gameState.isGameOver,
    gameState.winner,
    gameState.blackScore,
    gameState.whiteScore,
    toast,
    user,
    currentDifficulty,
    dispatch,
    playerColor,
  ]);

  const handleMove = async (row: number, col: number) => {
    return await makeMove(row, col);
  };

  const handleStartGame = useCallback(() => {
    startGame();
    gameStartTimeRef.current = Date.now();
    toast({
      title: `Game Started`,
      description: `You are playing as ${playerColor}. Good luck!`,
    });
  }, [startGame, playerColor, toast]);

  const handleRestart = useCallback(() => {
    const newColor = getRandomColor();
    setPlayerColor(newColor);
    restartGame(undefined, newColor);
    gameStartTimeRef.current = Date.now();
    gameRecordedRef.current = false;
    gameOverDialogShownRef.current = false;
    setIsGameEnding(false);
    toast({
      title: "New Game",
      description: `Starting fresh game against AI. You are ${newColor}.`,
    });
  }, [restartGame, toast]);

  const handleResign = () => {
    dispatch(setShowResignDialog(true));
  };

  const confirmResign = () => {
    setIsGameEnding(true);
    resignGame();
    dispatch(setShowResignDialog(false));
    toast({
      title: "Game Resigned",
      description: "You can start a new game anytime!",
    });
  };

  const handleTutorialComplete = () => {
    dispatch(completeTutorial());
    setShowTutorial(false);
    toast({
      title: "Tutorial Complete!",
      description: "You're ready to play. Good luck!",
    });
  };

  const handleTutorialSkip = () => {
    dispatch(completeTutorial());
    setShowTutorial(false);
    toast({
      title: "Tutorial Skipped",
      description: "You can review the rules in 'How to Play' anytime",
    });
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    // Restrict hard difficulty for non-authenticated users
    if (newDifficulty === "hard" && !user) {
      toast({
        title: "Login Required",
        description: "Please sign in to play on hard difficulty",
        variant: "destructive",
      });
      return;
    }

    // Block difficulty change if game has started and is not over
    if (gameStarted && !gameState.isGameOver) {
      toast({
        title: "Cannot Change Difficulty",
        description: "Resign or finish the current game first",
        variant: "destructive",
      });
      return;
    }

    dispatch(setDifficulty(newDifficulty));
    changeDifficulty(newDifficulty);
    gameStartTimeRef.current = Date.now();
    gameRecordedRef.current = false;
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

  // Determine if the board should be interactive
  const isBoardDisabled =
    gameState.isGameOver || isAiThinking || isGameEnding || !gameStarted;

  // Check if current turn is the player's turn
  const isPlayerTurn = gameState.currentPlayer === playerColor;

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
                    onClick={() => dispatch(setShowSettingsDialog(true))}
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
                {!gameStarted
                  ? `You are ${playerColor}. Press Start to begin!`
                  : isAiThinking
                  ? "AI is thinking..."
                  : `Playing as ${playerColor} against ${currentDifficulty} AI`}
              </p>
            </div>

            {/* Start Game Overlay */}
            {!gameStarted && !gameState.isGameOver && (
              <div className="relative">
                <OthelloBoard
                  board={gameState.board}
                  validMoves={[]}
                  lastMove={gameState.lastMove}
                  currentPlayer={gameState.currentPlayer}
                  onMove={handleMove}
                  disabled={true}
                  isAiThinking={false}
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-white text-lg font-semibold mb-1">
                      You are playing as
                    </p>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div
                        className={`w-8 h-8 rounded-full ${
                          playerColor === "black" ? "bg-black border-2 border-gray-300" : "bg-white"
                        }`}
                        style={{
                          boxShadow:
                            playerColor === "black"
                              ? "0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)"
                              : "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <span className="text-white text-xl font-bold capitalize">
                        {playerColor}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">
                      {playerColor === "black"
                        ? "You go first!"
                        : "AI (Black) will go first"}
                    </p>
                  </div>
                  <Button
                    onClick={handleStartGame}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                </div>
              </div>
            )}

            {/* Active Game Board */}
            {(gameStarted || gameState.isGameOver) && (
              <OthelloBoard
                board={gameState.board}
                validMoves={
                  gameState.isGameOver || isAiThinking || isGameEnding || !isPlayerTurn
                    ? []
                    : gameState.validMoves
                }
                lastMove={gameState.lastMove}
                currentPlayer={gameState.currentPlayer}
                onMove={handleMove}
                disabled={isBoardDisabled || !isPlayerTurn}
                isAiThinking={isAiThinking}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
          <GameSidebar
            currentPlayer={gameState.currentPlayer as "black" | "white"}
            playerColor={playerColor}
            blackScore={gameState.blackScore}
            whiteScore={gameState.whiteScore}
            playerName={
              user?.displayName || user?.primaryEmail?.split("@")[0] || "You"
            }
            opponentName="AI"
            gameMode="ai"
            gameStatus={gameState.isGameOver ? "finished" : "playing"}
            onResign={handleResign}
            onRestart={handleRestart}
            onUndo={handleUndo}
            canUndo={gameState.moveHistory.length > 0 && !isAiThinking}
            isAiThinking={isAiThinking}
            difficulty={currentDifficulty}
            onDifficultyChange={handleDifficultyChange}
            isAuthenticated={!!user}
            undosRemaining={gameState.undosRemaining}
            gameHasStarted={gameStarted}
          />
        </div>
      </div>

      {/* Resign Confirmation Dialog */}
      <Dialog
        open={showResignDialog}
        onOpenChange={(open) => dispatch(setShowResignDialog(open))}
      >
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
              onClick={() => dispatch(setShowResignDialog(false))}
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
      <Dialog
        open={showSettingsDialog}
        onOpenChange={(open) => dispatch(setShowSettingsDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
            <DialogDescription>
              {gameStarted && !gameState.isGameOver
                ? "Resign or finish the current game to change difficulty."
                : "Adjust AI difficulty level. Changing difficulty will start a new game."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-3 text-gray-200">
              AI Difficulty
            </label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map(
                (difficulty) => {
                  const isDisabled =
                    (gameStarted && !gameState.isGameOver) ||
                    (difficulty === "hard" && !user);

                  return (
                    <Button
                      key={difficulty}
                      variant={
                        currentDifficulty === difficulty ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleDifficultyChange(difficulty)}
                      disabled={isDisabled}
                      className={`capitalize ${
                        currentDifficulty === difficulty
                          ? getDifficultyColor(difficulty)
                          : isDisabled
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-400"
                      }`}
                    >
                      {difficulty === "hard" && !user && "🔒 "}
                      {difficulty}
                    </Button>
                  );
                }
              )}
            </div>
            {!user && (
              <p className="text-xs text-yellow-400 mt-2">
                🔒 Sign in to unlock hard difficulty
              </p>
            )}
            {gameStarted && !gameState.isGameOver && (
              <p className="text-xs text-gray-400 mt-2">
                Resign or finish the game to change difficulty
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => dispatch(setShowSettingsDialog(false))}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutorial Dialog */}
      <TutorialDialog
        open={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </div>
  );
}
