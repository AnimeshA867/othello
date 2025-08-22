"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Trophy,
  Shield,
  Loader2,
  Info,
  X,
  ArrowRight,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OthelloBoard } from "@/components/othello-board";
import { GameInfo } from "@/components/game-info";
import { setStorageItem } from "@/lib/storage-helpers";
import { useRankedMultiplayerGame } from "@/hooks/use-ranked-multiplayer-game";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RankSetType } from "@/shared/gameLogic";
import { getNameIfAny } from "@/lib/othello-game";

export default function RankedGamePage() {
  const {
    gameState,
    makeMove,
    restartGame,
    resignGame,
    offerDraw,
    acceptDraw,
    declineDraw,
    joinRandomGame,
    leaveRoom,
    websocketState,
  } = useRankedMultiplayerGame();

  const { toast } = useToast();
  const name = getNameIfAny();

  const [dialogOpen, setDialogOpen] = useState(true);
  const [selectedRank, setSelectedRank] = useState<RankSetType>("beginner");
  const [playerName, setPlayerName] = useState(name);
  const [copiedMessage, setCopiedMessage] = useState(false);
  // Handle game over state
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  // Handle draw offer dialog
  const [showDrawOfferDialog, setShowDrawOfferDialog] = useState(false);

  useEffect(() => {
    if (gameState.isGameOver) {
      setShowGameOverDialog(true);
    }
  }, [gameState.isGameOver]);

  // Show draw offer dialog when a draw is offered
  useEffect(() => {
    if (
      gameState.drawOfferedBy &&
      gameState.drawOfferedBy !== gameState.localPlayer
    ) {
      setShowDrawOfferDialog(true);
      // Play a notification sound
      // try {
      //   const audio = new Audio("/sounds/notification.mp3");
      //   audio.volume = 0.5;
      //   audio.play().catch((e) => console.log("Audio play failed:", e));
      // } catch (error) {
      //   console.log("Audio failed:", error);
      // }

      // Show toast notification
    } else {
      setShowDrawOfferDialog(false);
    }
  }, [gameState.drawOfferedBy, gameState.localPlayer, toast]);

  const handleFindGame = () => {
    joinRandomGame(
      selectedRank,
      getRankValue(selectedRank),
      playerName || undefined
    );
    setDialogOpen(false);
  };

  const handleCopyRoomId = () => {
    if (gameState.roomId) {
      navigator.clipboard.writeText(gameState.roomId);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  // Get numeric rank value based on rank set type
  const getRankValue = (rankType: RankSetType): number => {
    switch (rankType) {
      case "beginner":
        return 500;
      case "intermediate":
        return 1500;
      case "advanced":
        return 2500;
      default:
        return 1000;
    }
  };

  useEffect(() => {
    if (playerName) {
      setStorageItem("playerName", playerName);
    }
  }, [playerName]);

  // Get display name for player's color
  const getPlayerName = (color: "black" | "white") => {
    if (gameState.localPlayer === color) {
      return "You";
    }
    return gameState.opponentName || "Opponent";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-600/50 bg-slate-800/50 backdrop-blur-sm">
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
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 truncate">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="hidden sm:inline">Ranked Othello</span>
                <span className="sm:hidden">Ranked</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {websocketState.isConnected ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 text-xs"
                >
                  <span className="hidden sm:inline">Connected</span>
                  <span className="sm:hidden">✓</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-red-500/40 text-red-300 bg-red-500/10 text-xs"
                >
                  {websocketState.isConnecting
                    ? "Connecting..."
                    : "Disconnected"}
                </Badge>
              )}

              {gameState.rankSetType && (
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-300 bg-blue-500/10 text-xs"
                >
                  {gameState.rankSetType.charAt(0).toUpperCase() +
                    gameState.rankSetType.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence>
          {gameState.isWaitingForPlayer ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center items-center min-h-[60vh]"
            >
              <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600 max-w-md w-full">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white">
                    Waiting for opponent...
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
                  </div>

                  <div className="text-center">
                    <p className="text-slate-300 mb-4">
                      Looking for a {gameState.rankSetType} level opponent
                    </p>

                    {gameState.roomId && (
                      <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-slate-400 mb-1">
                          Room Code:
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-xl text-white font-mono tracking-widest">
                            {gameState.roomId}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyRoomId}
                            className="p-1 h-auto"
                          >
                            <Copy className="w-4 h-4 text-slate-300" />
                          </Button>
                        </div>
                        {copiedMessage && (
                          <p className="text-xs text-emerald-400 mt-1">
                            Copied to clipboard!
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          You can share this code with a friend to play with
                          them directly
                        </p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        setDialogOpen(true);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto"
            >
              <div className="flex flex-col">
                <div className="flex justify-center items-center h-full">
                  <OthelloBoard
                    board={gameState.board}
                    currentPlayer={gameState.currentPlayer}
                    validMoves={
                      gameState.currentPlayer === gameState.localPlayer
                        ? gameState.validMoves
                        : []
                    }
                    lastMove={gameState.lastMove}
                    onMove={makeMove}
                    disabled={
                      gameState.currentPlayer !== gameState.localPlayer ||
                      gameState.isGameOver
                    }
                    isAiThinking={false}
                    className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-2xl aspect-square mx-auto"
                  />

                  {/* Debug button - remove in production */}
                  <button
                    onClick={() => {
                      console.log("Game state:", gameState);
                      console.log("WebSocket state:", websocketState);
                    }}
                    className="fixed left-4 bottom-4 text-xs bg-gray-800 text-white px-2 py-1 rounded z-50 opacity-50 hover:opacity-100"
                  >
                    Debug
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <GameInfo
                  currentPlayer={gameState.currentPlayer}
                  blackScore={gameState.blackScore}
                  whiteScore={gameState.whiteScore}
                  blackLabel={getPlayerName("black")}
                  whiteLabel={getPlayerName("white")}
                  isMultiplayer={true}
                  yourTurn={gameState.currentPlayer === gameState.localPlayer}
                  gameMode="ranked"
                  winner={gameState.winner}
                  isGameOver={gameState.isGameOver}
                  drawOfferedBy={gameState.drawOfferedBy}
                />

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      resignGame();
                      toast({
                        title: "Game Resigned",
                        description: "You have resigned the game.",
                        variant: "destructive",
                      });
                    }}
                    disabled={gameState.isGameOver}
                  >
                    Resign
                  </Button>

                  {!gameState.drawOfferedBy && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log("Offering draw...");
                        offerDraw();
                        toast({
                          title: "Draw Offered",
                          description:
                            "You have offered a draw to your opponent.",
                          variant: "default",
                        });
                      }}
                      disabled={gameState.isGameOver}
                      className="border-yellow-600 text-yellow-500 hover:bg-yellow-500/10"
                    >
                      Offer Draw
                    </Button>
                  )}

                  {gameState.drawOfferedBy === gameState.localPlayer && (
                    <Button
                      variant="outline"
                      disabled
                      className="border-yellow-600 text-yellow-500 opacity-70"
                    >
                      Draw Offered
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Find Game Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Find a Ranked Game
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                maxLength={20}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">
                Skill Level
              </label>

              <div className="grid grid-cols-1 gap-3">
                <button
                  className={`p-4 rounded-lg flex items-center gap-3 border-2 transition-all ${
                    selectedRank === "beginner"
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  onClick={() => setSelectedRank("beginner")}
                >
                  <div className="bg-emerald-500/20 p-2 rounded-full">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Beginner</div>
                    <div className="text-sm text-slate-400">
                      New to the game or casual player
                    </div>
                  </div>
                </button>

                <button
                  className={`p-4 rounded-lg flex items-center gap-3 border-2 transition-all ${
                    selectedRank === "intermediate"
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  onClick={() => setSelectedRank("intermediate")}
                >
                  <div className="bg-blue-500/20 p-2 rounded-full">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Intermediate</div>
                    <div className="text-sm text-slate-400">
                      Familiar with strategies and tactics
                    </div>
                  </div>
                </button>

                <button
                  className={`p-4 rounded-lg flex items-center gap-3 border-2 transition-all ${
                    selectedRank === "advanced"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  onClick={() => setSelectedRank("advanced")}
                >
                  <div className="bg-purple-500/20 p-2 rounded-full">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Advanced</div>
                    <div className="text-sm text-slate-400">
                      Experienced player with deep understanding
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleFindGame}
              className="gap-2"
              disabled={websocketState.isConnecting}
            >
              {websocketState.isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Find Game <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog open={showGameOverDialog} onOpenChange={setShowGameOverDialog}>
        <DialogContent className="bg-slate-800 text-white border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl">Game Over</DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center">
            {gameState.winner === "draw" ? (
              <div className="text-xl font-medium mb-4">It's a draw!</div>
            ) : gameState.winner === gameState.localPlayer ? (
              <div className="text-xl font-medium text-emerald-400 mb-4">
                You won!
              </div>
            ) : (
              <div className="text-xl font-medium text-red-400 mb-4">
                You lost
              </div>
            )}

            <div className="flex justify-center gap-8 my-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{gameState.blackScore}</div>
                <div className="text-sm text-slate-400">Black</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{gameState.whiteScore}</div>
                <div className="text-sm text-slate-400">White</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                leaveRoom();
                setShowGameOverDialog(false);
                setDialogOpen(true);
              }}
            >
              Leave Room
            </Button>
            <Button
              variant="default"
              onClick={() => {
                restartGame();
                setShowGameOverDialog(false);
              }}
            >
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draw Offer Dialog */}
      <Dialog open={showDrawOfferDialog} onOpenChange={setShowDrawOfferDialog}>
        <DialogContent className="bg-slate-800 text-white border-slate-600 border-2 border-yellow-500">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <span className="text-yellow-500">⚠</span> Draw Offered
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className="text-xl font-medium mb-4">
              {getPlayerName(
                gameState.drawOfferedBy === "black" ? "black" : "white"
              )}{" "}
              has offered a draw
            </div>

            <div className="text-sm text-slate-300 mb-6">
              {gameState.drawOfferedBy === gameState.localPlayer
                ? "Waiting for your opponent to respond..."
                : "Do you want to accept the draw and end the game?"}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {gameState.drawOfferedBy !== gameState.localPlayer && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("Declining draw...");
                    declineDraw();
                    setShowDrawOfferDialog(false);
                    toast({
                      title: "Draw Declined",
                      description:
                        "You have declined the draw offer. The game continues.",
                      variant: "default",
                    });
                  }}
                >
                  Decline
                </Button>
                <Button
                  variant="default"
                  className="bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => {
                    console.log("Accepting draw...");
                    acceptDraw();
                    setShowDrawOfferDialog(false);
                    toast({
                      title: "Draw Accepted",
                      description:
                        "You have accepted the draw offer. Game ended in a draw.",
                      variant: "default",
                    });
                  }}
                >
                  Accept Draw
                </Button>
              </>
            )}
            {gameState.drawOfferedBy === gameState.localPlayer && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowDrawOfferDialog(false);
                }}
              >
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
