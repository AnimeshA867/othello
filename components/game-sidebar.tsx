"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GameSidebarProps {
  currentPlayer: "black" | "white";
  playerColor?: "black" | "white";
  blackScore: number;
  whiteScore: number;
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
}

export function GameSidebar({
  currentPlayer,
  playerColor,
  blackScore,
  whiteScore,
  opponentName,
  gameStatus,
  gameMode,
  onResign,
  onUndo,
  onRestart,
  canUndo = false,
  isAiThinking = false,
  onDraw,
}: GameSidebarProps) {
  const handleResign = () => {
    onResign?.();
  };

  const handleUndo = () => {
    onUndo?.();
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
                {playerColor === "black" ? "You" : opponentName}
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
                {playerColor === "white" ? "You" : opponentName}
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
              className="w-full bg-transparent border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
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
              Resign
            </Button>
          )}
          {gameStatus == "finished" && (
            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full bg-transparent border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
            >
              Play Again
            </Button>
          )}
          {onDraw && (
            <Button
              variant="outline"
              className="w-full mt-4 bg-transparent border-white/30 text-white hover:bg-white hover:text-black"
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
    </div>
  );
}
