"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useWebSocketGame, type WebSocketMessage } from "./use-websocket-game";
import type { GameState, Player } from "@/lib/othello-game";

interface MultiplayerGameState extends GameState {
  localPlayer: Player | null;
  opponentName?: string;
  isWaitingForPlayer: boolean;
  roomId: string | null;
}

export function useMultiplayerGame() {
  const {
    websocketState,
    sendMessage,
    createRoom,
    joinRoom,
    makeMove: sendMove,
    restartGame: sendRestart,
    resignGame: sendResign,
    disconnect,
    onMessage,
  } = useWebSocketGame();

  const [gameState, setGameState] = useState<MultiplayerGameState>({
    board: Array(8)
      .fill(null)
      .map(() => Array(8).fill(null)),
    currentPlayer: "black",
    blackScore: 2,
    whiteScore: 2,
    validMoves: [],
    lastMove: null,
    isGameOver: false,
    winner: null,
    gameMode: "friend",
    localPlayer: null,
    isWaitingForPlayer: true,
    roomId: null,
  });

  const messageHandlers = useRef(new Map<string, (message: any) => void>());

  // Initialize message handlers
  useEffect(() => {
    messageHandlers.current.set("room_created", (message) => {
      console.log("🏠 Room created:", message);
      setGameState((prev) => ({
        ...prev,
        localPlayer: message.player,
        roomId: message.roomId,
        isWaitingForPlayer: true,
      }));
    });

    messageHandlers.current.set("player_joined", (message) => {
      console.log("👤 Player joined:", message);
      setGameState((prev) => {
        // If this message contains the player role, it means it's assigning our role
        if (message.player && !prev.localPlayer) {
          console.log(`🎭 Setting local player role to: ${message.player}`);
          return {
            ...prev,
            localPlayer: message.player,
            opponentName: message.playerName,
          };
        }
        // Otherwise, just update opponent info
        return {
          ...prev,
          opponentName: message.playerName || prev.opponentName,
        };
      });
    });

    messageHandlers.current.set("game_ready", (message) => {
      console.log("🎮 Game ready received:", message);

      setGameState((prev) => {
        console.log("🔄 Current state before game_ready update:", {
          roomId: prev.roomId,
          isWaitingForPlayer: prev.isWaitingForPlayer,
          localPlayer: prev.localPlayer,
        });

        const newState = {
          ...prev,
          isWaitingForPlayer: false,
          opponentName:
            prev.localPlayer === "black"
              ? message.players.white
              : message.players.black,
        };

        console.log("✅ New state after game_ready:", {
          roomId: newState.roomId,
          isWaitingForPlayer: newState.isWaitingForPlayer,
          localPlayer: newState.localPlayer,
          opponentName: newState.opponentName,
        });

        return newState;
      });
    });

    messageHandlers.current.set("game_state", (message) => {
      console.log("🎲 Game state received:", message.gameState);
      setGameState((prev) => {
        const newState = {
          ...prev,
          ...message.gameState,
          localPlayer: prev.localPlayer,
          roomId: prev.roomId,
          opponentName: prev.opponentName,
          // Don't override isWaitingForPlayer if it's already false (game is ready)
          isWaitingForPlayer: prev.isWaitingForPlayer,
        };
        console.log("📊 Game state updated:", {
          board: newState.board ? "8x8 board" : "no board",
          currentPlayer: newState.currentPlayer,
          isWaitingForPlayer: newState.isWaitingForPlayer,
          localPlayer: newState.localPlayer,
        });
        return newState;
      });
    });

    messageHandlers.current.set("move_made", (message) => {
      // The game state will be updated via the 'game_state' message
      // This is just for any additional move-specific logic
      console.log(
        `Move made: ${message.player} at (${message.row}, ${message.col})`
      );
    });

    messageHandlers.current.set("game_restarted", () => {
      // The game state will be updated via the 'game_state' message
      console.log("Game restarted");
    });

    messageHandlers.current.set("player_resigned", (message) => {
      const winner = message.player === "black" ? "white" : "black";
      setGameState((prev) => ({
        ...prev,
        isGameOver: true,
        winner,
      }));
    });

    messageHandlers.current.set("player_disconnected", (message) => {
      setGameState((prev) => ({
        ...prev,
        isWaitingForPlayer: true,
      }));
    });

    messageHandlers.current.set("invalid_move", () => {
      console.warn("Invalid move attempted");
    });
  }, []);

  // Listen for WebSocket messages using the proper callback system
  useEffect(() => {
    return onMessage((message) => {
      const handler = messageHandlers.current.get(message.type);
      if (handler) {
        handler(message);
      }
    });
  }, [onMessage]);

  const createGameRoom = useCallback(
    (playerName?: string) => {
      createRoom(playerName);
    },
    [createRoom]
  );

  const joinGameRoom = useCallback(
    (roomId: string, playerName?: string) => {
      joinRoom(roomId, playerName);
      setGameState((prev) => ({
        ...prev,
        roomId,
      }));
    },
    [joinRoom]
  );

  const makeMove = useCallback(
    (row: number, col: number) => {
      // Check if it's the local player's turn
      if (gameState.localPlayer !== gameState.currentPlayer) {
        console.warn("Not your turn");
        return false;
      }

      // Check if it's a valid move
      const isValidMove = gameState.validMoves.some(
        (move) => move.row === row && move.col === col
      );

      if (!isValidMove) {
        console.warn("Invalid move");
        return false;
      }

      sendMove(row, col);
      return true;
    },
    [
      gameState.localPlayer,
      gameState.currentPlayer,
      gameState.validMoves,
      sendMove,
    ]
  );

  const restartGame = useCallback(() => {
    sendRestart();
  }, [sendRestart]);

  const resignGame = useCallback(() => {
    sendResign();
  }, [sendResign]);

  const leaveRoom = useCallback(() => {
    disconnect();
    setGameState({
      board: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
      currentPlayer: "black",
      blackScore: 2,
      whiteScore: 2,
      validMoves: [],
      lastMove: null,
      isGameOver: false,
      winner: null,
      gameMode: "friend",
      localPlayer: null,
      isWaitingForPlayer: true,
      roomId: null,
    });
  }, [disconnect]);

  // Initialize the board when component mounts
  useEffect(() => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    initialBoard[3][3] = "white";
    initialBoard[3][4] = "black";
    initialBoard[4][3] = "black";
    initialBoard[4][4] = "white";

    setGameState((prev) => ({
      ...prev,
      board: initialBoard,
      blackScore: 2,
      whiteScore: 2,
    }));
  }, []);

  return {
    gameState,
    websocketState,
    createGameRoom,
    joinGameRoom,
    makeMove,
    restartGame,
    resignGame,
    leaveRoom,
    isConnected: websocketState.isConnected,
    isConnecting: websocketState.isConnecting,
    error: websocketState.error,
  };
}
