"use client";

import { motion } from "framer-motion";
import { Clock, User, Bot, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Player, GameMode, Difficulty } from "@/lib/othello-game";
import { cn } from "@/lib/utils";

interface GameInfoProps {
  currentPlayer: Player;
  blackScore: number;
  whiteScore: number;
  gameMode: GameMode;
  difficulty?: Difficulty;
  isGameOver: boolean;
  winner: Player;
  onRestart: () => void;
  onResign?: () => void;
  className?: string;
  isAiThinking?: boolean;
}

export function GameInfo({
  currentPlayer,
  blackScore,
  whiteScore,
  gameMode,
  difficulty,
  isGameOver,
  winner,
  onRestart,
  onResign,
  className,
  isAiThinking = false,
}: GameInfoProps) {
  const getPlayerIcon = (player: Player) => {
    if (gameMode === "ai") {
      return player === "black" ? (
        <User className="w-4 h-4" />
      ) : (
        <Bot className="w-4 h-4" />
      );
    }
    return <User className="w-4 h-4" />;
  };

  const getPlayerLabel = (player: Player) => {
    if (gameMode === "ai") {
      return player === "black" ? "You" : `AI`;
    }
    return player === "black" ? "Black" : "White";
  };

  return (
    <Card
      className={cn(
        "w-full bg-slate-800/60 backdrop-blur-sm border-slate-600",
        className
      )}
    >
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {/* Game Status */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isAiThinking ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-400 flex-shrink-0"></div>
            ) : (
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium text-white truncate">
              {isGameOver
                ? "Game Over"
                : isAiThinking
                ? "AI thinking..."
                : `${
                    getPlayerLabel(currentPlayer) === "You"
                      ? "Your"
                      : getPlayerLabel(currentPlayer)
                  }'s Turn`}
            </span>
          </div>

          {isGameOver && winner && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40 shadow-lg text-xs sm:text-sm px-1 sm:px-2"
              >
                <span className="hidden sm:inline">
                  🎉 {getPlayerLabel(winner)} Wins!
                </span>
                <span className="sm:hidden">🎉 {getPlayerLabel(winner)}</span>
              </Badge>
            </motion.div>
          )}

          {isGameOver && !winner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="flex-shrink-0"
            >
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 text-slate-300 border-slate-500/40 shadow-lg text-xs sm:text-sm px-1 sm:px-2"
              >
                🤝 Tie!
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Player Scores */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
          {/* Black Player */}
          <motion.div
            className={cn(
              "flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg border transition-all duration-300",
              currentPlayer === "black" && !isGameOver
                ? "border-blue-400/60 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                : "border-slate-600 bg-slate-700/50"
            )}
            animate={{
              scale: currentPlayer === "black" && !isGameOver ? 1.02 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0">
              {getPlayerIcon("black")}
              <div className="min-w-0">
                <div className="font-semibold text-white text-xs sm:text-sm lg:text-base truncate">
                  {getPlayerLabel("black")}
                </div>
                <div className="text-xs text-slate-300 hidden sm:block">
                  Black
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                {blackScore}
              </div>
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-gray-800 to-black rounded-full border border-gray-600 mx-auto mt-1 shadow-sm" />
            </div>
          </motion.div>

          {/* White Player */}
          <motion.div
            className={cn(
              "flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg border transition-all duration-300",
              currentPlayer === "white" && !isGameOver
                ? "border-blue-400/60 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                : "border-slate-600 bg-slate-700/50"
            )}
            animate={{
              scale: currentPlayer === "white" && !isGameOver ? 1.02 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0">
              {getPlayerIcon("white")}
              <div className="min-w-0">
                <div className="font-semibold text-white text-xs sm:text-sm lg:text-base truncate">
                  {getPlayerLabel("white")}
                </div>
                <div className="text-xs text-slate-300 hidden sm:block">
                  White
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                {whiteScore}
              </div>
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-gray-100 to-white rounded-full border border-gray-300 mx-auto mt-1 shadow-sm" />
            </div>
          </motion.div>
        </div>

        {/* Game Controls */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={onRestart}
            variant="outline"
            size="sm"
            className="flex-1 border-slate-600 text-white hover:bg-slate-700 hover:text-white text-xs sm:text-sm px-2 sm:px-3"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Game</span>
            <span className="sm:hidden">New</span>
          </Button>

          {onResign && !isGameOver && (
            <Button
              onClick={onResign}
              variant="destructive"
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-2 sm:px-3"
            >
              Resign
            </Button>
          )}
        </div>

        {/* Game Mode Info */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-600">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300">
            <span>Mode: {gameMode === "ai" ? "vs AI" : "vs Friend"}</span>
            {difficulty && (
              <Badge
                variant="outline"
                className="capitalize border-blue-500/40 text-blue-300 bg-blue-500/10 text-xs px-1 sm:px-2"
              >
                {difficulty}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
