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
      return player === "black" ? "You" : `AI (${difficulty})`;
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
      <CardContent className="p-6">
        {/* Game Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {isAiThinking ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            ) : (
              <Clock className="w-5 h-5 text-slate-300" />
            )}
            <span className="text-sm font-medium text-white">
              {isGameOver
                ? "Game Over"
                : isAiThinking
                ? "AI is thinking..."
                : `${getPlayerLabel(currentPlayer)}'s Turn`}
            </span>
          </div>

          {isGameOver && winner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
              >
                {getPlayerLabel(winner)} Wins!
              </Badge>
            </motion.div>
          )}

          {isGameOver && !winner && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Badge
                variant="secondary"
                className="bg-slate-500/20 text-slate-300 border-slate-500/40"
              >
                It's a Tie!
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Player Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Black Player */}
          <motion.div
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-all",
              currentPlayer === "black" && !isGameOver
                ? "border-blue-400/60 bg-blue-500/20 shadow-lg"
                : "border-slate-600 bg-slate-700/50"
            )}
            animate={{
              scale: currentPlayer === "black" && !isGameOver ? 1.02 : 1,
            }}
          >
            <div className="flex items-center gap-3">
              {getPlayerIcon("black")}
              <div>
                <div className="font-semibold text-white">
                  {getPlayerLabel("black")}
                </div>
                <div className="text-sm text-slate-300">Black</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{blackScore}</div>
              <div className="w-5 h-5 bg-gradient-to-br from-gray-800 to-black rounded-full border border-gray-600 mx-auto mt-1" />
            </div>
          </motion.div>

          {/* White Player */}
          <motion.div
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-all",
              currentPlayer === "white" && !isGameOver
                ? "border-blue-400/60 bg-blue-500/20 shadow-lg"
                : "border-slate-600 bg-slate-700/50"
            )}
            animate={{
              scale: currentPlayer === "white" && !isGameOver ? 1.02 : 1,
            }}
          >
            <div className="flex items-center gap-3">
              {getPlayerIcon("white")}
              <div>
                <div className="font-semibold text-white">
                  {getPlayerLabel("white")}
                </div>
                <div className="text-sm text-slate-300">White</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{whiteScore}</div>
              <div className="w-5 h-5 bg-gradient-to-br from-gray-100 to-white rounded-full border border-gray-300 mx-auto mt-1" />
            </div>
          </motion.div>
        </div>

        {/* Game Controls */}
        <div className="flex gap-3">
          <Button
            onClick={onRestart}
            variant="outline"
            className="flex-1 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>

          {onResign && !isGameOver && (
            <Button
              onClick={onResign}
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Resign
            </Button>
          )}
        </div>

        {/* Game Mode Info */}
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Mode: {gameMode === "ai" ? "vs AI" : "vs Friend"}</span>
            {difficulty && (
              <Badge
                variant="outline"
                className="capitalize border-blue-500/40 text-blue-300 bg-blue-500/10"
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
