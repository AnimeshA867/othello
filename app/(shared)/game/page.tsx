"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Copy,
  Share,
  Loader2,
  Info,
  X,
  Link as LinkIcon,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OthelloBoard } from "@/components/othello-board";
import { GameSidebar } from "@/components/game-sidebar";
import { useMultiplayerGame } from "@/hooks/use-multiplayer-game";
import { useRankedMultiplayerGame } from "@/hooks/use-ranked-multiplayer-game";
import { setStorageItem } from "@/lib/storage-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getNameIfAny } from "@/lib/othello-game";

export default function GamePage() {
  const searchParams = useSearchParams();
  const initialMode =
    searchParams.get("mode") === "random" ? "ranked" : "friend";

  // Mode selection state
  const [gameMode, setGameMode] = useState<"friend" | "ranked">(initialMode);

  // Friend game state and methods
  const {
    websocketState: friendWebsocketState,
    gameState: friendGameState,
    makeMove: friendMakeMove,
    restartGame: friendRestartGame,
    resignGame: friendResignGame,
    createGameRoom,
    joinGameRoom,
    leaveRoom: friendLeaveRoom,
    offerDraw: friendOfferDraw,
    acceptDraw: friendAcceptDraw,
    declineDraw: friendDeclineDraw,
  } = useMultiplayerGame();

  // Ranked game state and methods
  const {
    websocketState: rankedWebsocketState,
    gameState: rankedGameState,
    makeMove: rankedMakeMove,
    restartGame: rankedRestartGame,
    resignGame: rankedResignGame,
    joinRandomGame,
    leaveRoom: rankedLeaveRoom,
  } = useRankedMultiplayerGame();

  // Combined state based on selected mode
  const websocketState =
    gameMode === "friend" ? friendWebsocketState : rankedWebsocketState;
  const gameState = gameMode === "friend" ? friendGameState : rankedGameState;

  // Combined methods based on selected mode
  const makeMove = gameMode === "friend" ? friendMakeMove : rankedMakeMove;
  const restartGame =
    gameMode === "friend" ? friendRestartGame : rankedRestartGame;
  const resignGame =
    gameMode === "friend" ? friendResignGame : rankedResignGame;
  const leaveRoom = gameMode === "friend" ? friendLeaveRoom : rankedLeaveRoom;

  const name = getNameIfAny();
  const { toast } = useToast();

  // Friend game UI states
  const [dialogOpen, setDialogOpen] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [playerName, setPlayerName] = useState(name);
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Ranked game UI states
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Common UI states
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showDrawOfferDialog, setShowDrawOfferDialog] = useState(false);

  // Show game over dialog when game ends
  useEffect(() => {
    if (
      (gameMode === "friend" && friendGameState.isGameOver) ||
      (gameMode === "ranked" && rankedGameState.isGameOver)
    ) {
      setShowGameOverDialog(true);
    }
  }, [friendGameState.isGameOver, rankedGameState.isGameOver, gameMode]);

  // Show draw offer dialog when a draw is offered (Friend mode only)
  useEffect(() => {
    if (
      gameMode === "friend" &&
      friendGameState.drawOfferedBy &&
      friendGameState.drawOfferedBy !== friendGameState.localPlayer
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
  }, [
    friendGameState.drawOfferedBy,
    friendGameState.localPlayer,
    gameMode,
    toast,
  ]);

  // Show toast notifications for game over
  useEffect(() => {
    const currentGameState =
      gameMode === "friend" ? friendGameState : rankedGameState;

    if (currentGameState?.isGameOver) {
      const winner = currentGameState.winner;
      if (winner === "draw") {
        toast({
          title: "Game Over",
          description: "It's a draw! Well played!",
        });
      } else if (winner) {
        toast({
          title: "Game Over",
          description: `${winner === "black" ? "Black" : "White"} wins!`,
        });
      }
    }
  }, [
    friendGameState?.isGameOver,
    rankedGameState?.isGameOver,
    friendGameState?.winner,
    rankedGameState?.winner,
    gameMode,
    toast,
  ]);

  // Friend mode methods
  const handleCreateRoom = () => {
    createGameRoom(playerName || undefined);
    setDialogOpen(false);
  };

  const handleJoinRoom = () => {
    if (roomIdToJoin) {
      joinGameRoom(roomIdToJoin, playerName || undefined);
      setJoinDialogOpen(false);
      setDialogOpen(false);
    }
  };

  const handleCopyRoomId = () => {
    if (gameState.roomId) {
      navigator.clipboard.writeText(gameState.roomId);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  // Ranked mode methods
  const handleFindMatch = async () => {
    setIsSearching(true);
    try {
      await joinRandomGame();
      toast({
        title: "Searching for Match",
        description: "Finding an opponent at your skill level...",
      });
    } catch (_error: unknown) {
      toast({
        title: "Matchmaking Failed",
        description: "Please try again",
        variant: "destructive",
      });
      setIsSearching(false);
    }
  };

  const handleCancelSearch = () => {
    rankedLeaveRoom();
    setIsSearching(false);
    toast({
      title: "Search Cancelled",
      description: "You can search for a new match anytime",
    });
  };

  const handleResign = () => {
    if (gameMode === "ranked") {
      setShowResignDialog(true);
    } else {
      resignGame();
      toast({
        title: "Game Resigned",
        description: "You have resigned the game.",
        variant: "destructive",
      });
    }
  };

  const confirmResign = () => {
    resignGame();
    setShowResignDialog(false);
    toast({
      title: "Game Resigned",
      description: "This will affect your ranking",
    });
  };

  // Common methods
  const getPlayerName = (color: "black" | "white") => {
    if (gameMode === "friend") {
      if (friendWebsocketState.playerRole === color) {
        return "You";
      }
      return friendGameState.opponentName || "Opponent";
    } else {
      if (rankedWebsocketState.playerRole === color) {
        return "You";
      }
      return "Opponent";
    }
  };
  const handleMove = async (row: number, col: number) => {
    return await makeMove(row, col);
  };

  const getConnectionStatus = () => {
    if (gameMode === "friend") {
      // Friend mode connection status
      if (websocketState.isConnected) {
        return {
          status: "Connected to Friend Game",
          color: "bg-green-500",
          badge: "default",
        };
      }
      return {
        status: "Ready to create or join room",
        color: "bg-blue-500",
        badge: "outline",
      };
    } else {
      // Ranked mode connection status
      if (isSearching) {
        return {
          status: "Searching for opponent...",
          color: "bg-yellow-500",
          badge: "secondary",
        };
      }
      if (websocketState?.isConnected && gameState) {
        return {
          status: "Match found - Ready to play",
          color: "bg-green-500",
          badge: "default",
        };
      }
      return {
        status: "Ready to search",
        color: "bg-blue-500",
        badge: "outline",
      };
    }
  };

  const status = getConnectionStatus();

  // Save player name
  useEffect(() => {
    if (playerName) {
      setStorageItem("playerName", playerName);
    }
  }, [playerName]);

  // Reset game mode UI states when switching modes
  useEffect(() => {
    if (gameMode === "friend") {
      setIsSearching(false);
      if (!friendGameState.roomId) {
        setDialogOpen(true);
      }
    } else {
      setDialogOpen(false);
      setJoinDialogOpen(false);
    }
  }, [gameMode, friendGameState.roomId]);

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
                {gameMode === "friend" ? (
                  <>
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span className="hidden sm:inline">
                      Multiplayer Othello
                    </span>
                    <span className="sm:hidden">Multiplayer</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span className="hidden sm:inline">Ranked Match</span>
                    <span className="sm:hidden">Ranked</span>
                  </>
                )}
              </h1>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-700 rounded-lg p-1">
                <Button
                  variant={gameMode === "friend" ? "default" : "ghost"}
                  size="sm"
                  className={gameMode === "friend" ? "" : "text-slate-300"}
                  onClick={() => {
                    if (gameMode !== "friend") {
                      if (rankedWebsocketState.isConnected) {
                        rankedLeaveRoom();
                      }
                      setGameMode("friend");
                    }
                  }}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Friend
                </Button>
                <Button
                  variant={gameMode === "ranked" ? "default" : "ghost"}
                  size="sm"
                  className={gameMode === "ranked" ? "" : "text-slate-300"}
                  onClick={() => {
                    if (gameMode !== "ranked") {
                      if (friendWebsocketState.isConnected) {
                        friendLeaveRoom();
                      }
                      setGameMode("ranked");
                    }
                  }}
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Ranked
                </Button>
              </div>
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

              {gameMode === "friend" && gameState.roomId && (
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
        {/* Friend Mode Content */}
        {gameMode === "friend" && (
          <AnimatePresence>
            {friendGameState.isWaitingForPlayer ? (
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

                      {friendGameState.roomId && (
                        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-sm text-slate-400 mb-1">
                            Room Code:
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-xl text-white font-mono tracking-widest">
                              {friendGameState.roomId}
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
                          friendLeaveRoom();
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
                      board={friendGameState.board}
                      currentPlayer={friendGameState.currentPlayer}
                      validMoves={
                        friendGameState.currentPlayer ===
                        friendWebsocketState.playerRole
                          ? friendGameState.validMoves
                          : []
                      }
                      lastMove={friendGameState.lastMove}
                      onMove={friendMakeMove}
                      disabled={
                        friendGameState.currentPlayer !==
                          friendWebsocketState.playerRole ||
                        friendGameState.isGameOver
                      }
                      isAiThinking={false}
                      className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-2xl aspect-square mx-auto"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <GameSidebar
                    currentPlayer={
                      friendGameState.currentPlayer as "black" | "white"
                    }
                    blackScore={friendGameState.blackScore}
                    whiteScore={friendGameState.whiteScore}
                    opponentName={
                      getPlayerName("black") === "You"
                        ? getPlayerName("white")
                        : getPlayerName("black")
                    }
                    gameMode="friend"
                    gameStatus={
                      friendGameState.isGameOver ? "finished" : "playing"
                    }
                    onResign={handleResign}
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleResign}
                      disabled={friendGameState.isGameOver}
                    >
                      Resign
                    </Button>

                    {!friendGameState.drawOfferedBy && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          friendOfferDraw();
                          toast({
                            title: "Draw Offered",
                            description:
                              "You have offered a draw to your opponent.",
                            variant: "default",
                          });
                        }}
                        disabled={friendGameState.isGameOver}
                        className="border-yellow-600 text-yellow-500 hover:bg-yellow-500/10"
                      >
                        Offer Draw
                      </Button>
                    )}

                    {friendGameState.drawOfferedBy ===
                      friendWebsocketState.playerRole && (
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
        )}

        {/* Ranked Mode Content */}
        {gameMode === "ranked" && (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-14rem)]">
            {/* Main Game Area */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
              <div className="w-full max-w-3xl">
                {/* Game Header */}
                <div className="mb-6 text-center">
                  <Badge
                    variant={
                      status.badge as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                    }
                    className="mb-4"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${status.color} mr-2`}
                    />
                    {status.status}
                  </Badge>
                </div>

                {/* Game Board or Search Interface */}
                {rankedGameState && !isSearching ? (
                  <OthelloBoard
                    board={rankedGameState.board}
                    validMoves={
                      rankedGameState.currentPlayer ===
                      rankedWebsocketState.playerRole
                        ? rankedGameState.validMoves
                        : []
                    }
                    lastMove={rankedGameState.lastMove}
                    currentPlayer={rankedGameState.currentPlayer}
                    onMove={rankedMakeMove}
                    disabled={
                      rankedGameState.currentPlayer !==
                        rankedWebsocketState.playerRole ||
                      rankedGameState.isGameOver
                    }
                  />
                ) : (
                  <div className="aspect-square bg-green-800 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      {isSearching ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                          <p className="mb-4">
                            Searching for a ranked opponent...
                          </p>
                          <Button
                            onClick={handleCancelSearch}
                            variant="outline"
                          >
                            Cancel Search
                          </Button>
                        </>
                      ) : (
                        <>
                          <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                          <p className="mb-4">Ready to test your skills?</p>
                          <Button
                            onClick={handleFindMatch}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            Find Ranked Match
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            {rankedGameState && !isSearching && (
              <div className="w-full lg:w-80 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
                <GameSidebar
                  currentPlayer={
                    rankedGameState.currentPlayer as "black" | "white"
                  }
                  blackScore={rankedGameState.blackScore}
                  whiteScore={rankedGameState.whiteScore}
                  opponentName="Ranked Opponent"
                  gameMode="ranked"
                  gameStatus={
                    rankedGameState.isGameOver ? "finished" : "playing"
                  }
                  onResign={handleResign}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create or Join Room Dialog (Friend Mode) */}
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

      {/* Join Room Dialog (Friend Mode) */}
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
            {gameMode === "friend" ? (
              // Friend game outcome
              <>
                {friendGameState.winner === "draw" ? (
                  <div className="text-xl font-medium mb-4">It's a draw!</div>
                ) : friendGameState.winner ===
                  friendWebsocketState.playerRole ? (
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
                    <div className="text-4xl font-bold">
                      {friendGameState.blackScore}
                    </div>
                    <div className="text-sm text-slate-400">Black</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {friendGameState.whiteScore}
                    </div>
                    <div className="text-sm text-slate-400">White</div>
                  </div>
                </div>
              </>
            ) : (
              // Ranked game outcome
              <>
                {rankedGameState.winner === "draw" ? (
                  <div className="text-xl font-medium mb-4">It's a draw!</div>
                ) : rankedGameState.winner ===
                  rankedWebsocketState.playerRole ? (
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
                    <div className="text-4xl font-bold">
                      {rankedGameState.blackScore}
                    </div>
                    <div className="text-sm text-slate-400">Black</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {rankedGameState.whiteScore}
                    </div>
                    <div className="text-sm text-slate-400">White</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                leaveRoom();
                setShowGameOverDialog(false);
                if (gameMode === "friend") {
                  setDialogOpen(true);
                }
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

      {/* Draw Offer Dialog (Friend Mode) */}
      <Dialog open={showDrawOfferDialog} onOpenChange={setShowDrawOfferDialog}>
        <DialogContent className="bg-slate-800 text-white border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl">Draw Offered</DialogTitle>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className="text-xl font-medium mb-4">
              {getPlayerName(
                friendGameState.drawOfferedBy === "black" ? "black" : "white"
              )}{" "}
              has offered a draw
            </div>

            <div className="text-sm text-slate-300 mb-6">
              {friendGameState.drawOfferedBy === friendWebsocketState.playerRole
                ? "Waiting for your opponent to respond..."
                : "Do you want to accept the draw and end the game?"}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {friendGameState.drawOfferedBy !==
              friendWebsocketState.playerRole && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    friendDeclineDraw();
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
                    friendAcceptDraw();
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
            {friendGameState.drawOfferedBy ===
              friendWebsocketState.playerRole && (
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

      {/* Resign Dialog (Ranked Mode) */}
      <Dialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resign Ranked Game?</DialogTitle>
            <DialogDescription>
              Are you sure you want to resign this ranked game? This will count
              as a loss and affect your ranking.
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
    </div>
  );
}
