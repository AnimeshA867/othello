"use client";

import { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { type Player } from "@/lib/othello-game";

function SimplePiece({ color }: { color: Player }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshStandardMaterial
        color={color === "black" ? "#2d3748" : "#f7fafc"}
        metalness={0.2}
        roughness={0.1}
      />
    </mesh>
  );
}

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

// Fallback 2D piece component
export function OthelloPiece2D({
  color,
  isFlipping = false,
  flipDirection,
  size = 60,
  className = "",
}: OthelloPiece3DProps) {
  return (
    <div
      className={`${className} rounded-full border-2 border-slate-600 shadow-lg ${
        color === "black"
          ? "bg-gradient-to-br from-gray-700 to-gray-900"
          : "bg-gradient-to-br from-gray-50 to-gray-200"
      }`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
