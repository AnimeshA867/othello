"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Player, Position } from "@/lib/othello-game";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import 3D component to avoid SSR issues
const OthelloPiece3D = dynamic(
  () =>
    import("./othello-piece-3d.tsx").then((mod) => ({
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
        w-full h-full aspect-square rounded-full 
        border border-slate-600 sm:border-2 shadow-lg
        transition-all duration-300 ease-in-out
        ${
          color === "black"
            ? "bg-gradient-to-br from-gray-700 to-gray-900"
            : "bg-gradient-to-br from-gray-50 to-gray-200"
        }
        hover:shadow-xl hover:scale-105
        active:scale-95
      `}
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
  const [invalidMove, setInvalidMove] = useState<{
    row: number;
    col: number;
  } | null>(null);

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

  const handleMove = (row: number, col: number) => {
    if (disabled) return;
    if (!isValidMove(row, col)) {
      console.log(`Invalid move attempted at ${row}, ${col}`);
      // Show visual feedback for invalid move
      setInvalidMove({ row, col });
      setTimeout(() => setInvalidMove(null), 1000);
      return;
    }
    console.log(`Making move at ${row}, ${col}`);
    onMove(row, col);
  };

  return (
    <div className={cn("relative w-[80%] sm:w-full mx-auto p-4", className)}>
      {/* Board Grid */}
      <div
        className={cn(
          "grid grid-cols-8 gap-0.5 sm:gap-1 lg:gap-2 p-1 sm:p-2 lg:p-4 xl:p-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-modern border border-slate-500 sm:border-2 transition-all duration-300 w-full aspect-square"
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
                  "ring-3 ring-yellow-400 shadow-lg shadow-yellow-400/30",
                // Highlight last move
                isLastMove(rowIndex, colIndex) &&
                  "ring-3 ring-blue-400 shadow-lg shadow-blue-400/30",
                // Cursor style
                isValidMove(rowIndex, colIndex) && !disabled
                  ? "cursor-pointer"
                  : "cursor-default"
                // Remove disabled visual state
              )}
              onClick={() => handleMove(rowIndex, colIndex)}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={!disabled ? { scale: 0.95 } : { scale: 1 }}
            >
              {/* Invalid move indicator */}
              {invalidMove &&
                invalidMove.row === rowIndex &&
                invalidMove.col === colIndex && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-full h-full bg-red-500/30 absolute" />
                    <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-500 shadow-lg animate-pulse" />
                  </motion.div>
                )}

              {/* Valid move indicator */}
              {isValidMove(rowIndex, colIndex) && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 xl:w-4 xl:h-4 rounded-full shadow-lg animate-pulse border bg-yellow-300 border-yellow-500" />
                </motion.div>
              )}

              {/* Game pieces */}
              <AnimatePresence>
                {cell && (
                  <motion.div
                    className="absolute inset-0.5 sm:inset-1 flex items-center justify-center"
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
                    {use3D && cell ? (
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

      {/* Board coordinates overlay (inside board bounds to prevent overflow) */}
      <div className="pointer-events-none absolute inset-0 p-1 sm:p-2 lg:p-4 xl:p-8 select-none">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full gap-0.5 sm:gap-1 lg:gap-2">
          {/* Left-side numbers (8 to 1) */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`num-${i}`}
              style={{ gridColumnStart: 1, gridRowStart: i + 1 }}
              className="flex items-center justify-start"
            >
              <span className="text-[10px] sm:text-xs md:text-sm text-white/90 font-semibold -translate-x-1 sm:-translate-x-1.5 drop-shadow">
                {8 - i}
              </span>
            </div>
          ))}

          {/* Bottom letters (A to H) */}
          {[...Array(8)].map((_, j) => (
            <div
              key={`let-${j}`}
              style={{ gridColumnStart: j + 1, gridRowStart: 8 }}
              className="flex items-end justify-center"
            >
              <span className="text-[10px] sm:text-xs md:text-sm text-white/90 font-semibold translate-y-1 sm:translate-y-1.5 drop-shadow">
                {String.fromCharCode(65 + j)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
