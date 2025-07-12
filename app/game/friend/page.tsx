"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Settings, Users, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OthelloBoard } from "@/components/othello-board";
import { GameInfo } from "@/components/game-info";
import { RoomSetup, WaitingRoom } from "@/components/room-setup";
import { useMultiplayerGame } from "@/hooks/use-multiplayer-game";
import { cn } from "@/lib/utils";

export default function FriendGamePage() {
  const {
    gameState,
    websocketState,
    createGameRoom,
    joinGameRoom,
    makeMove,
    restartGame,
    resignGame,
    leaveRoom,
    isConnected,
    isConnecting,
    error,
  } = useMultiplayerGame();

  const showGameBoard = gameState.roomId && !gameState.isWaitingForPlayer;
  const showWaitingRoom = gameState.roomId && gameState.isWaitingForPlayer;
  const showRoomSetup = !gameState.roomId;

  // Debug logging
  console.log("🎯 Friend Game State:", {
    roomId: gameState.roomId,
    isWaitingForPlayer: gameState.isWaitingForPlayer,
    localPlayer: gameState.localPlayer,
    showGameBoard,
    showWaitingRoom,
    showRoomSetup,
  });

  const getConnectionStatus = () => {
    if (isConnecting)
      return { icon: WifiOff, text: "Connecting...", color: "text-yellow-400" };
    if (isConnected)
      return { icon: Wifi, text: "Connected", color: "text-green-400" };
    return { icon: WifiOff, text: "Disconnected", color: "text-red-400" };
  };

  const connectionStatus = getConnectionStatus();
  const ConnectionIcon = connectionStatus.icon;

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
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                Multiplayer Othello
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <Badge
                variant="outline"
                className={cn(
                  "border-opacity-50 bg-opacity-10",
                  connectionStatus.color.includes("green") &&
                    "border-green-500 bg-green-500",
                  connectionStatus.color.includes("yellow") &&
                    "border-yellow-500 bg-yellow-500",
                  connectionStatus.color.includes("red") &&
                    "border-red-500 bg-red-500"
                )}
              >
                <ConnectionIcon
                  className={`w-3 h-3 mr-1 ${connectionStatus.color}`}
                />
                <span className={connectionStatus.color}>
                  {connectionStatus.text}
                </span>
              </Badge>

              {/* Room ID Display */}
              {gameState.roomId && (
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-300 bg-blue-500/10 font-mono"
                >
                  Room: {gameState.roomId}
                </Badge>
              )}

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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {showRoomSetup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <RoomSetup
              onCreateRoom={createGameRoom}
              onJoinRoom={joinGameRoom}
              isConnecting={isConnecting}
              error={error}
            />
          </motion.div>
        )}

        {showWaitingRoom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <WaitingRoom
              roomId={gameState.roomId!}
              playerRole={gameState.localPlayer!}
              onLeaveRoom={leaveRoom}
            />
          </motion.div>
        )}

        {showGameBoard && (
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
                    gameState.currentPlayer !== gameState.localPlayer ||
                    !isConnected
                  }
                  className="w-full max-w-2xl mx-auto"
                />

                {/* Turn Indicator Overlay */}
                {gameState.currentPlayer !== gameState.localPlayer &&
                  !gameState.isGameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                      <div className="bg-slate-800/90 backdrop-blur-sm px-6 py-3 rounded-lg border border-slate-600">
                        <div className="text-white text-center">
                          <div className="text-lg font-semibold">
                            Opponent's Turn
                          </div>
                          <div className="text-sm text-slate-300">
                            Waiting for their move...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  isGameOver={gameState.isGameOver}
                  winner={gameState.winner}
                  onRestart={restartGame}
                  onResign={resignGame}
                />
              </motion.div>

              {/* Player Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
              >
                <h3 className="font-semibold mb-4 text-white">Players</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-gray-800 to-black rounded-full border border-gray-600" />
                      <span className="text-white">
                        {gameState.localPlayer === "black"
                          ? "You"
                          : gameState.opponentName || "Opponent"}
                      </span>
                    </div>
                    {gameState.localPlayer === "black" && (
                      <Badge
                        variant="outline"
                        className="border-blue-500/40 text-blue-300 bg-blue-500/10 text-xs"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-gray-100 to-white rounded-full border border-gray-300" />
                      <span className="text-white">
                        {gameState.localPlayer === "white"
                          ? "You"
                          : gameState.opponentName || "Opponent"}
                      </span>
                    </div>
                    {gameState.localPlayer === "white" && (
                      <Badge
                        variant="outline"
                        className="border-blue-500/40 text-blue-300 bg-blue-500/10 text-xs"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Game Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
              >
                <h3 className="font-semibold mb-3 text-white">
                  Multiplayer Tips
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Games are played in real-time</li>
                  <li>• Wait for your turn to make a move</li>
                  <li>
                    • If your opponent disconnects, you can wait for them to
                    return
                  </li>
                  <li>• Use the room code to invite friends</li>
                </ul>
              </motion.div>

              {/* Leave Room Button */}
              <Button
                onClick={leaveRoom}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Leave Room
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
