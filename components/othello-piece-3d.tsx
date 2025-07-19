"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { type Player } from "@/lib/othello-game";

interface OthelloPieceProps {
  color: Player;
  isFlipping?: boolean;
  flipDirection?: "toWhite" | "toBlack";
  rotation?: [number, number, number];
}

function PieceModel({
  color,
  isFlipping,
  flipDirection,
  rotation = [0, 0, 0],
}: OthelloPieceProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [flipProgress, setFlipProgress] = useState(0);

  // Use cylinder geometry for the othello piece

  // Animation for flipping
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isFlipping && flipDirection) {
        // Animate the flip
        setFlipProgress((prev) => {
          const newProgress = Math.min(prev + delta * 3, 1); // 3 is the speed

          // Rotation during flip
          const flipRotation = newProgress * Math.PI;
          meshRef.current!.rotation.x = rotation[0] + flipRotation;

          return newProgress;
        });
      } else {
        // Reset flip progress when not flipping
        setFlipProgress(0);
        meshRef.current.rotation.set(...rotation);
      }
      // Remove the scale override - let the geometry size be consistent
    }
  });

  // Reset flip progress when flipping stops
  useEffect(() => {
    if (!isFlipping) {
      setFlipProgress(0);
    }
  }, [isFlipping]);

  return (
    <group ref={meshRef}>
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.15, 32]} />
        <meshStandardMaterial
          color={color === "black" ? 0x1f2937 : 0xf9fafb}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>
    </group>
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
  const [use3D, setUse3D] = useState(true);

  // Fallback to 2D if 3D fails
  if (!use3D) {
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

  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Suspense
        fallback={
          <OthelloPiece2D
            color={color}
            isFlipping={isFlipping}
            flipDirection={flipDirection}
            size={size}
            className={className}
          />
        }
      >
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }}
          onError={() => setUse3D(false)}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-5, -5, -5]} intensity={0.3} />

          <PieceModel
            color={color}
            isFlipping={isFlipping}
            flipDirection={flipDirection}
            rotation={[-Math.PI / 2, 0, 0]} // Rotate to lay flat
          />

          <Environment preset="studio" />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Fallback 2D piece component for cases where 3D might not load
export function OthelloPiece2D({
  color,
  isFlipping = false,
  flipDirection,
  size = 60,
  className = "",
}: OthelloPiece3DProps) {
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
