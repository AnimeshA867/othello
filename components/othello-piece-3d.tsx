"use client";

import { type Player } from "@/lib/othello-game";

interface OthelloPiece3DProps {
  color: Player;
  isFlipping?: boolean;
  flipDirection?: "toWhite" | "toBlack";
  size?: number;
  className?: string;
}

export function OthelloPiece3D({
  color,
  isFlipping = false,
  flipDirection,
  size = 60,
  className = "",
}: OthelloPiece3DProps) {
  // For now, just use 2D pieces since 3D is having issues
  return (
    <OthelloPiece2D
      color={color}
      isFlipping={isFlipping}
      flipDirection={flipDirection}
      size={size}
      className={className}
    />
  );
}

// Responsive 2D piece component
export function OthelloPiece2D({
  color,
  isFlipping = false,
  flipDirection,
  className = "",
}: OthelloPiece3DProps) {
  const animationClass = isFlipping
    ? flipDirection === "toWhite"
      ? "animate-pulse"
      : "animate-pulse"
    : "";

  return (
    <div
      className={`
        ${className} 
        ${animationClass}
        w-full h-full aspect-square rounded-full 
        border-2 border-slate-600 shadow-lg 
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
