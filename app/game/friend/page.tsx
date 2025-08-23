"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Copy,
  Share,
  Loader2,
  X,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OthelloBoard } from "@/components/othello-board";
import { GameInfo } from "@/components/game-info";
import { useMultiplayerGame } from "@/hooks/use-multiplayer-game";
import { setStorageItem } from "@/lib/storage-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getNameIfAny } from "@/lib/othello-game";

export default function FriendGamePage() {
  const {
    websocketState,
    gameState,
    makeMove,
    restartGame,
    resignGame,
    createGameRoom,
    joinGameRoom,
    leaveRoom,
    offerDraw,
    acceptDraw,
    declineDraw,
  } = useMultiplayerGame();

  const name = getNameIfAny();

  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [playerName, setPlayerName] = useState(name);
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Game over state
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
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch((e) => console.log("Audio play failed:", e));
      } catch (error) {
        console.log("Audio failed:", error);
      }

      // Show toast notification
      toast({
        title: "Draw Offer",
        description: "Your opponent has offered a draw. Accept or decline?",
        variant: "default",
      });
    } else {
      setShowDrawOfferDialog(false);
    }
  }, [gameState.drawOfferedBy, gameState.localPlayer]);

  // Handle room creation
  const handleCreateRoom = () => {
    createGameRoom(playerName || undefined);
    setDialogOpen(false);
  };

  // Handle joining a room
  const handleJoinRoom = () => {
    if (roomIdToJoin) {
      joinGameRoom(roomIdToJoin, playerName || undefined);
      setJoinDialogOpen(false);
      setDialogOpen(false);
    }
  };

  // Handle copying room ID to clipboard
  const handleCopyRoomId = () => {
    if (gameState.roomId) {
      navigator.clipboard.writeText(gameState.roomId);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  // Get display name for player's color
  const getPlayerName = (color: "black" | "white") => {
    if (gameState.localPlayer === color) {
      return "You";
    }
    return gameState.opponentName || "Opponent";
  };

  useEffect(() => {
    if (playerName) {
      setStorageItem("playerName", playerName);
    }
  }, [playerName]);

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
                <Users className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="hidden sm:inline">Multiplayer Othello</span>
                <span className="sm:hidden">Multiplayer</span>
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

              {gameState.roomId && (
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-300 bg-blue-500/10 cursor-pointer text-xs"
                  onClick={handleCopyRoomId}
                >
                  <span className="hidden sm:inline">
                    Room: {gameState.roomId}
                  </span>
                  <span className="sm:hidden">{gameState.roomId}</span>
                  <Copy className="w-3 h-3 ml-1" />
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
                      Share this room code with your friend to join
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
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        leaveRoom();
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
                  gameMode="friend"
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

      {/* Create or Join Room Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Users className="w-5 h-5" /> Multiplayer Othello
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

            <div className="grid grid-cols-1 gap-4">
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 font-semibold"
                onClick={handleCreateRoom}
              >
                <Share className="w-5 h-5 mr-2" />
                Create New Room
              </Button>

              <div className="text-center">
                <span className="text-slate-400 text-sm">OR</span>
              </div>

              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white py-6 font-semibold"
                onClick={() => setJoinDialogOpen(true)}
              >
                <LinkIcon className="w-5 h-5 mr-2" />
                Join Existing Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Room Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-xl">Join a Room</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Enter Room Code
              </label>
              <input
                type="text"
                value={roomIdToJoin}
                onChange={(e) => {
                  // Only allow uppercase letters and numbers, max 6 characters
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .substring(0, 6);
                  setRoomIdToJoin(value);
                }}
                placeholder="e.g. ABCD12"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleJoinRoom}
              disabled={!roomIdToJoin || roomIdToJoin.length < 6}
            >
              Join Room
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
        <DialogContent className="bg-slate-800 text-white border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl">Draw Offered</DialogTitle>
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
