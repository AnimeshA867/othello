"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, Users, Lock } from "lucide-react";
import { useState } from "react";

interface GameSidebarProps {
  currentPlayer: "black" | "white";
  playerColor?: "black" | "white";
  blackScore: number;
  whiteScore: number;
  playerName?: string;
  opponentName: string;
  opponentRank?: number;
  gameStatus: "playing" | "finished";
  gameMode: string;
  onResign?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  isAiThinking?: boolean;
  onDraw?: () => void;
  onRestart?: () => void;
  // AI mode props
  difficulty?: "easy" | "medium" | "hard";
  onDifficultyChange?: (difficulty: "easy" | "medium" | "hard") => void;
  // Friend mode props
  roomId?: string;
  onCopyRoomId?: () => void;
  onJoinRoom?: (roomId: string) => void;
  // Ranked mode props
  playerElo?: number;
  // Auth state
  isAuthenticated?: boolean;
  // Abandon mode (when both players have moved)
  showAbandon?: boolean;
}

export function GameSidebar({
  currentPlayer,
  playerColor,
  blackScore,
  whiteScore,
  playerName,
  opponentName,
  gameStatus,
  gameMode,
  onResign,
  onUndo,
  onRestart,
  canUndo = false,
  isAiThinking = false,
  onDraw,
  difficulty,
  onDifficultyChange,
  roomId,
  onCopyRoomId,
  onJoinRoom,
  playerElo,
  isAuthenticated = true,
  showAbandon = false,
}: GameSidebarProps) {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");

  const handleResign = () => {
    onResign?.();
  };

  const handleUndo = () => {
    onUndo?.();
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      onJoinRoom?.(joinRoomId.trim());
      setShowJoinDialog(false);
      setJoinRoomId("");
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 h-full overflow-y-auto">
      {/* Players */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:bg-white/15">
        <CardHeader className="pb-2 lg:pb-3">
          <CardTitle className="text-white text-base lg:text-lg">
            Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 lg:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div
                className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-black border-2 border-gray-300"
                style={{
                  boxShadow:
                    "0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                }}
              />
              <span className="text-white font-medium text-sm lg:text-base">
                {!playerColor || playerColor === "black"
                  ? playerName || "You"
                  : opponentName}
              </span>
            </div>
            {currentPlayer === playerColor && playerColor === "black" && (
              <Badge
                variant="secondary"
                className="bg-yellow-500 text-black animate-pulse text-xs lg:text-sm"
              >
                Your Turn
              </Badge>
            )}
            {currentPlayer === "black" && playerColor === "white" && (
              <Badge
                variant="secondary"
                className="bg-yellow-500 text-black animate-pulse text-xs lg:text-sm"
              >
                Their Turn
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div
                className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-white border-2 border-gray-300"
                style={{
                  boxShadow:
                    "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              />
              <span className="text-white font-medium text-sm lg:text-base">
                {playerColor === "white" ? playerName || "You" : opponentName}
              </span>
            </div>
            {currentPlayer === playerColor && playerColor === "white" && (
              <Badge
                variant="secondary"
                className="bg-yellow-500 text-black animate-pulse text-xs lg:text-sm"
              >
                Your Turn
              </Badge>
            )}
            {currentPlayer === "white" && playerColor === "black" && (
              <Badge
                variant="secondary"
                className="bg-yellow-500 text-black animate-pulse text-xs lg:text-sm"
              >
                Their Turn
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:bg-white/15">
        <CardHeader className="pb-2 lg:pb-3">
          <CardTitle className="text-white text-base lg:text-lg">
            Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3">
                <div
                  className="w-4 h-4 rounded-full bg-black"
                  style={{
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
                <span className="text-white text-sm lg:text-base">Black</span>
              </div>
              <span className="text-white font-bold text-xl lg:text-xl transition-all duration-300">
                {blackScore}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3">
                <div
                  className="w-4 h-4 rounded-full bg-white"
                  style={{
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <span className="text-white text-sm lg:text-base">White</span>
              </div>
              <span className="text-white font-bold text-xl lg:text-xl transition-all duration-300">
                {whiteScore}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranked Stats */}
      {gameMode === "ranked" && playerElo && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:bg-white/15">
          <CardHeader className="pb-2 lg:pb-3">
            <CardTitle className="text-white text-base lg:text-lg">
              Your Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {playerElo}
                </div>
                <div className="text-xs text-gray-400">ELO Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Difficulty Selector */}
      {gameMode === "ai" && onDifficultyChange && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:bg-white/15">
          <CardHeader className="pb-2 lg:pb-3">
            <CardTitle className="text-white text-base lg:text-lg">
              AI Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={difficulty === "easy" ? "default" : "outline"}
                className={`text-xs lg:text-sm transition-all duration-300 ${
                  difficulty === "easy"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-transparent border-white/30 text-white hover:bg-white/20"
                }`}
                onClick={() => onDifficultyChange("easy")}
                disabled={gameStatus === "playing"}
              >
                Easy
              </Button>
              <Button
                variant={difficulty === "medium" ? "default" : "outline"}
                className={`text-xs lg:text-sm transition-all duration-300 ${
                  difficulty === "medium"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-transparent border-white/30 text-white hover:bg-white/20"
                }`}
                onClick={() => onDifficultyChange("medium")}
                disabled={gameStatus === "playing"}
              >
                Medium
              </Button>
              <Button
                variant={difficulty === "hard" ? "default" : "outline"}
                className={`text-xs lg:text-sm transition-all duration-300 relative ${
                  difficulty === "hard"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : !isAuthenticated
                    ? "bg-transparent border-white/30 text-white/50 cursor-not-allowed"
                    : "bg-transparent border-white/30 text-white hover:bg-white/20"
                }`}
                onClick={() => onDifficultyChange("hard")}
                disabled={gameStatus === "playing" || !isAuthenticated}
              >
                {!isAuthenticated && <Lock className="w-3 h-3 mr-1" />}
                Hard
              </Button>
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-yellow-400 text-center mt-2">
                🔒 Sign in to unlock hard difficulty
              </p>
            )}
            {gameStatus === "playing" && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Finish current game to change difficulty
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Room Management for Friend Mode */}
      {gameMode === "friend" && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:bg-white/15">
          <CardHeader className="pb-2 lg:pb-3">
            <CardTitle className="text-white text-base lg:text-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {roomId ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={roomId}
                    readOnly
                    className="bg-white/5 border-white/20 text-white text-xs lg:text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300"
                    onClick={onCopyRoomId}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Share this Room ID with your friend
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 text-center py-2">
                  Waiting for room to be created...
                </p>
              </div>
            )}
            {onJoinRoom && !roomId && (
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
                onClick={() => setShowJoinDialog(true)}
              >
                Join Room
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Game Controls */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:bg-white/15">
        <CardHeader className="pb-2 lg:pb-3">
          <CardTitle className="text-white text-base lg:text-lg">
            Game Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 lg:space-y-3">
          {onUndo && gameStatus === "playing" && (
            <Button
              variant="outline"
              className="w-full bg-transparent border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
              onClick={handleUndo}
              disabled={!canUndo || isAiThinking}
            >
              Undo Move
            </Button>
          )}

          {gameStatus !== "finished" && (
            <Button
              variant="destructive"
              className="w-full transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
              onClick={handleResign}
              disabled={isAiThinking}
            >
              {showAbandon ? "Abandon" : "Resign"}
            </Button>
          )}
          {gameStatus == "finished" && (
            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full bg-transparent border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
            >
              Play Again
            </Button>
          )}
          {onDraw && (
            <Button
              variant="outline"
              className="w-full mt-4 bg-transparent border-white/30 text-white hover:bg-white/20 hover:text-white"
              onClick={onDraw}
            >
              Offer Draw
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Game Info */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:bg-white/15">
        <CardHeader className="pb-2 lg:pb-3">
          <CardTitle className="text-white text-base lg:text-lg">
            Game Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs lg:text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="capitalize">{gameMode}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="capitalize">{gameStatus}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Join Room Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Join Room</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the Room ID shared by your friend to join their game.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleJoinRoom();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
                onClick={() => {
                  setShowJoinDialog(false);
                  setJoinRoomId("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleJoinRoom}
                disabled={!joinRoomId.trim()}
              >
                Join
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
