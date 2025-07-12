"use client";

import { motion } from "framer-motion";
import { Brain, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/othello-game";

interface DifficultySelectProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  className?: string;
}

const difficultyOptions = [
  {
    value: "easy" as Difficulty,
    label: "Easy",
    description: "Perfect for beginners",
    icon: Zap,
    color: "from-green-500 to-emerald-600",
    gradient: "bg-gradient-to-r from-green-500/10 to-emerald-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
  },
  {
    value: "medium" as Difficulty,
    label: "Medium",
    description: "Balanced challenge",
    icon: Brain,
    color: "from-blue-500 to-cyan-600",
    gradient: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  {
    value: "hard" as Difficulty,
    label: "Hard",
    description: "Expert level AI",
    icon: Target,
    color: "from-red-500 to-pink-600",
    gradient: "bg-gradient-to-r from-red-500/10 to-pink-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
  },
];

export function DifficultySelect({
  difficulty,
  onDifficultyChange,
  className,
}: DifficultySelectProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-medium text-white">Select Difficulty</h3>
      <div className="grid gap-3">
        {difficultyOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = difficulty === option.value;

          return (
            <motion.button
              key={option.value}
              onClick={() => onDifficultyChange(option.value)}
              className={cn(
                "relative w-full p-4 rounded-xl border text-left transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? `${option.gradient} ${option.border} ring-2 ring-opacity-40`
                  : "bg-slate-700/50 border-slate-600 hover:border-slate-500"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    isSelected
                      ? `bg-gradient-to-r ${option.color}`
                      : "bg-slate-600"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isSelected ? "text-white" : "text-slate-300"
                    )}
                  />
                </div>

                <div className="flex-1">
                  <div
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? option.text : "text-white"
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-300">
                    {option.description}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "w-3 h-3 rounded-full",
                      `bg-gradient-to-r ${option.color}`
                    )}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
