"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Users, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoomSetupProps {
  onCreateRoom: (playerName?: string) => void;
  onJoinRoom: (roomId: string, playerName?: string) => void;
  isConnecting: boolean;
  error: string | null;
  className?: string;
}

export function RoomSetup({
  onCreateRoom,
  onJoinRoom,
  isConnecting,
  error,
  className,
}: RoomSetupProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  const handleCreateRoom = () => {
    onCreateRoom(playerName || undefined);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), playerName || undefined);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            <Users className="w-6 h-6" />
            Multiplayer Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Name Input */}
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

          {/* Tab Selection */}
          <div className="flex rounded-lg bg-slate-700/50 p-1">
            <button
              onClick={() => setActiveTab("create")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                activeTab === "create"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white"
              )}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Create Room
            </button>
            <button
              onClick={() => setActiveTab("join")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                activeTab === "join"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white"
              )}
            >
              <Hash className="w-4 h-4 inline mr-1" />
              Join Room
            </button>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "create" ? (
              <div className="space-y-4">
                <div className="text-center text-slate-300 text-sm">
                  Create a new game room and share the room code with your
                  friend
                </div>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Room...
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Room
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character room code..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent uppercase tracking-wider text-center font-mono"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={isConnecting || !roomId.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3"
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Joining Room...
                    </div>
                  ) : (
                    <>
                      <Hash className="w-4 h-4 mr-2" />
                      Join Room
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="text-red-300 text-sm text-center">{error}</div>
            </motion.div>
          )}

          {/* Info */}
          <div className="text-center text-xs text-slate-400 space-y-1">
            <div>Room codes are 6 characters long</div>
            <div>Games are real-time and require both players to be online</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface WaitingRoomProps {
  roomId: string;
  playerRole: "black" | "white";
  onLeaveRoom: () => void;
  className?: string;
}

export function WaitingRoom({
  roomId,
  playerRole,
  onLeaveRoom,
  className,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy room ID:", error);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            <Users className="w-6 h-6" />
            Waiting for Player
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {/* Room Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-slate-300 text-sm">Room Code</div>
              <div className="flex items-center justify-center gap-2">
                <div className="bg-slate-700 px-4 py-2 rounded-lg font-mono text-xl text-white tracking-widest">
                  {roomId}
                </div>
                <Button
                  onClick={copyRoomId}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {copied ? (
                    "Copied!"
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-slate-300 text-sm">You are playing as</div>
              <Badge
                variant="outline"
                className={cn(
                  "px-3 py-1 text-sm font-medium",
                  playerRole === "black"
                    ? "border-gray-600 text-gray-300 bg-gray-600/20"
                    : "border-gray-400 text-gray-200 bg-gray-400/20"
                )}
              >
                {playerRole === "black" ? "Black" : "White"} Player
              </Badge>
            </div>
          </div>

          {/* Waiting Animation */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
            <div className="text-slate-300">
              Share the room code with your friend to start playing!
            </div>
          </div>

          {/* Leave Room Button */}
          <Button
            onClick={onLeaveRoom}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Leave Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
