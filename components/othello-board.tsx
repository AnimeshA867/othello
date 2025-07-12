"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Player, Position } from "@/lib/othello-game";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import 3D component to avoid SSR issues
const OthelloPiece3D = dynamic(
  () =>
    import("./othello-piece-3d").then((mod) => ({
      default: mod.OthelloPiece3D,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse" />
    ),
  }
);

// Fallback 2D piece component
function OthelloPiece2D({
  color,
  isFlipping = false,
  flipDirection,
  size = 60,
  className = "",
}: {
  color: Player;
  isFlipping?: boolean;
  flipDirection?: "toWhite" | "toBlack";
  size?: number;
  className?: string;
}) {
  const animationClass = isFlipping
    ? flipDirection === "toWhite"
      ? "piece-flip-to-white"
      : "piece-flip-to-black"
    : "";

  return (
    <div
      className={`
        ${className}
        ${animationClass}
        rounded-full border-2 border-slate-600 shadow-lg
        ${
          color === "black"
            ? "bg-gradient-to-br from-gray-700 to-gray-900"
            : "bg-gradient-to-br from-gray-50 to-gray-200"
        }
      `}
      style={{
        width: size,
        height: size,
        transform: "translateZ(0)", // Enable hardware acceleration
      }}
    />
  );
}

interface OthelloBoardProps {
  board: Player[][];
  validMoves: Position[];
  lastMove: Position | null;
  currentPlayer: Player;
  onMove: (row: number, col: number) => void;
  disabled?: boolean;
  className?: string;
  isAiThinking?: boolean;
}

export function OthelloBoard({
  board,
  validMoves,
  lastMove,
  currentPlayer,
  onMove,
  disabled = false,
  className,
  isAiThinking = false,
}: OthelloBoardProps) {
  const [flippingPieces, setFlippingPieces] = useState<Set<string>>(new Set());
  const [previousBoard, setPreviousBoard] = useState<Player[][]>(board);
  const [use3D, setUse3D] = useState(true);

  // Error boundary for 3D component
  useEffect(() => {
    const handleError = () => {
      console.warn("3D rendering failed, falling back to 2D");
      setUse3D(false);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Track flipping pieces when board changes
  useEffect(() => {
    const newFlippingPieces = new Set<string>();

    // Only track changes if we have a previous board state and it's different
    if (previousBoard.length > 0) {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          // Check if the piece changed from the previous state (piece flipped)
          if (
            previousBoard[row] &&
            previousBoard[row][col] !== board[row][col] &&
            previousBoard[row][col] !== null && // Was a piece before
            board[row][col] !== null // Still a piece after, but different color
          ) {
            newFlippingPieces.add(`${row}-${col}`);
          }
        }
      }
    }

    if (newFlippingPieces.size > 0) {
      setFlippingPieces(newFlippingPieces);

      // Clear flipping animation after animation completes
      setTimeout(() => {
        setFlippingPieces(new Set());
      }, 600);
    }

    // Update previous board state
    setPreviousBoard(board.map((row) => [...row]));
  }, [board]);

  const isValidMove = (row: number, col: number) => {
    return validMoves.some((move) => move.row === row && move.col === col);
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove?.row === row && lastMove?.col === col;
  };

  const isFlipping = (row: number, col: number) => {
    return flippingPieces.has(`${row}-${col}`);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Board Grid */}
      <div
        className={cn(
          "grid grid-cols-8 gap-2 p-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-modern border-2 border-slate-500 transition-all duration-300",
          isAiThinking && "opacity-80 scale-[0.98]"
        )}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.button
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "relative aspect-square rounded-lg transition-all duration-200 overflow-hidden border border-slate-400/20",
                "focus:outline-none focus:ring-3 focus:ring-blue-400 focus:ring-opacity-60",
                // Square colors (alternating green board pattern)
                (rowIndex + colIndex) % 2 === 0
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-emerald-700 hover:bg-emerald-600",
                // Highlight valid moves
                isValidMove(rowIndex, colIndex) &&
                  !disabled &&
                  "ring-3 ring-yellow-400 shadow-lg shadow-yellow-400/30",
                // Highlight last move
                isLastMove(rowIndex, colIndex) &&
                  "ring-3 ring-blue-400 shadow-lg shadow-blue-400/30",
                // Disabled state
                disabled && "cursor-not-allowed opacity-60"
              )}
              onClick={() => !disabled && onMove(rowIndex, colIndex)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
            >
              {/* Valid move indicator */}
              {isValidMove(rowIndex, colIndex) && !disabled && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <div className="w-4 h-4 bg-yellow-300 rounded-full shadow-lg animate-pulse border-2 border-yellow-500" />
                </motion.div>
              )}

              {/* Game pieces */}
              <AnimatePresence>
                {cell && (
                  <motion.div
                    className="absolute inset-1 flex items-center justify-center"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    exit={{ scale: 0, rotate: -180 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      duration: 0.4,
                    }}
                  >
                    {use3D ? (
                      <OthelloPiece3D
                        color={cell}
                        isFlipping={isFlipping(rowIndex, colIndex)}
                        flipDirection={
                          isFlipping(rowIndex, colIndex)
                            ? cell === "black"
                              ? "toBlack"
                              : "toWhite"
                            : undefined
                        }
                        size={50}
                        className={cn(
                          "transition-all duration-200",
                          // Add glow effect for current player's pieces
                          currentPlayer === cell && "drop-shadow-lg",
                          currentPlayer === "black" &&
                            cell === "black" &&
                            "drop-shadow-[0_0_8px_rgba(156,163,175,0.7)]",
                          currentPlayer === "white" &&
                            cell === "white" &&
                            "drop-shadow-[0_0_8px_rgba(229,231,235,0.7)]"
                        )}
                      />
                    ) : (
                      <OthelloPiece2D
                        color={cell}
                        isFlipping={isFlipping(rowIndex, colIndex)}
                        flipDirection={
                          isFlipping(rowIndex, colIndex)
                            ? cell === "black"
                              ? "toBlack"
                              : "toWhite"
                            : undefined
                        }
                        size={50}
                        className={cn(
                          "transition-all duration-200",
                          // Add glow effect for current player's pieces
                          currentPlayer === cell && "ring-2 ring-opacity-70",
                          currentPlayer === "black" &&
                            cell === "black" &&
                            "ring-gray-400",
                          currentPlayer === "white" &&
                            cell === "white" &&
                            "ring-gray-200"
                        )}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coordinate labels (for accessibility) */}
              <span className="sr-only">
                {String.fromCharCode(65 + colIndex)}
                {8 - rowIndex}
              </span>
            </motion.button>
          ))
        )}
      </div>

      {/* Board coordinates */}
      <div className="absolute -left-12 top-8 flex flex-col justify-around h-full text-lg text-white font-bold">
        {[8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
          <div key={num} className="flex items-center justify-center h-12">
            {num}
          </div>
        ))}
      </div>
      <div className="absolute -bottom-12 left-8 flex justify-around w-full text-lg text-white font-bold">
        {["A", "B", "C", "D", "E", "F", "G", "H"].map((letter) => (
          <div key={letter} className="flex items-center justify-center w-12">
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}
