"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Player, Position } from "@/lib/othello-game";

export type WebSocketMessage =
  | { type: "join_room"; roomId: string; playerName?: string }
  | { type: "create_room"; playerName?: string }
  | { type: "make_move"; row: number; col: number }
  | { type: "restart_game" }
  | { type: "resign_game" }
  | { type: "offer_draw" }
  | { type: "accept_draw" }
  | { type: "decline_draw" }
  | {
      type: "player_joined";
      player: Player;
      playerName?: string;
      rank?: number;
    }
  | { type: "room_created"; roomId: string; player: Player }
  | { type: "game_state"; gameState: any }
  | { type: "move_made"; row: number; col: number; player: Player }
  | { type: "game_restarted" }
  | { type: "player_resigned"; player: Player }
  | { type: "draw_offered"; player: Player }
  | { type: "draw_declined"; player: Player }
  | { type: "game_over"; winner: "black" | "white" | "draw" }
  | { type: "player_disconnected" }
  | {
      type: "game_ready";
      roomId: string;
      players: { black: string; white: string };
    }
  | { type: "error"; message: string }
  | { type: "room_full" }
  | { type: "invalid_move" }
  | { type: "waiting_for_player" }
  | {
      type: "join_random";
      rankSetType: string;
      rank: number;
      playerName?: string;
    };

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  roomId: string | null;
  playerRole: Player | null;
  error: string | null;
  isWaitingForPlayer: boolean;
}

interface UseWebSocketGameReturn {
  websocketState: WebSocketState;
  sendMessage: (message: WebSocketMessage) => void;
  createRoom: (playerName?: string) => void;
  joinRoom: (roomId: string, playerName?: string) => void;
  makeMove: (row: number, col: number) => void;
  restartGame: () => void;
  resignGame: () => void;
  offerDraw: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  disconnect: () => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => () => void;
}

export function useWebSocketGame(): UseWebSocketGameReturn {
  const [websocketState, setWebSocketState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    roomId: null,
    playerRole: null,
    error: null,
    isWaitingForPlayer: false,
  });

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const messageCallbacks = useRef<Set<(message: WebSocketMessage) => void>>(
    new Set()
  );

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setWebSocketState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Use appropriate WebSocket URL based on environment
      const wsUrl =
        process.env.NODE_ENV === "production"
          ? `wss://${window.location.host}/api/websocket`
          : "ws://localhost:3003";

      console.log(`Connecting to WebSocket at ${wsUrl}`);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setWebSocketState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("Received WebSocket message:", message);
          handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          console.error("Raw message data:", event.data);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWebSocketState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Failed to connect to game server",
        }));
      };

      ws.current.onclose = (event) => {
        console.log(
          `WebSocket closed with code ${event.code}. Reason: ${event.reason}`
        );
        setWebSocketState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        console.log("WebSocket disconnected:", event.code, event.reason);
        setWebSocketState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Attempt to reconnect if not a normal closure
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000));
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWebSocketState((prev) => ({
          ...prev,
          error: "Connection failed. Please try again.",
          isConnecting: false,
        }));
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setWebSocketState((prev) => ({
        ...prev,
        error: "Failed to connect to game server.",
        isConnecting: false,
      }));
    }
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Handle connection-related messages
    switch (message.type) {
      case "room_created":
        setWebSocketState((prev) => ({
          ...prev,
          roomId: message.roomId,
          playerRole: message.player,
          isWaitingForPlayer: true,
        }));
        break;

      case "player_joined":
        setWebSocketState((prev) => ({
          ...prev,
          playerRole: message.player,
          isWaitingForPlayer: false,
        }));
        break;

      case "game_ready":
        setWebSocketState((prev) => ({
          ...prev,
          isWaitingForPlayer: false,
        }));
        break;

      case "waiting_for_player":
        setWebSocketState((prev) => ({
          ...prev,
          isWaitingForPlayer: true,
        }));
        break;

      case "room_full":
        setWebSocketState((prev) => ({
          ...prev,
          error: "Room is full. Please try a different room.",
        }));
        break;

      case "error":
        setWebSocketState((prev) => ({
          ...prev,
          error: message.message,
        }));
        break;

      default:
        // Game-specific messages will be handled by the game component
        break;
    }

    // Call all registered message callbacks
    messageCallbacks.current.forEach((callback) => callback(message));
  }, []);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        console.log("Sending WebSocket message:", message);
        ws.current.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket is not connected, attempting to connect first");
        connect();
        // Queue message to be sent once connection is established
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            console.log("Sending delayed message:", message);
            ws.current.send(JSON.stringify(message));
          } else {
            console.error("Failed to send message after reconnection attempt");
          }
        }, 1000);
      }
    },
    [connect]
  );

  const createRoom = useCallback(
    (playerName?: string) => {
      if (!websocketState.isConnected) {
        connect();
      }
      sendMessage({ type: "create_room", playerName });
    },
    [websocketState.isConnected, connect, sendMessage]
  );

  const joinRoom = useCallback(
    (roomId: string, playerName?: string) => {
      if (!websocketState.isConnected) {
        connect();
      }
      sendMessage({ type: "join_room", roomId, playerName });
    },
    [websocketState.isConnected, connect, sendMessage]
  );

  const makeMove = useCallback(
    (row: number, col: number) => {
      sendMessage({ type: "make_move", row, col });
    },
    [sendMessage]
  );

  const restartGame = useCallback(() => {
    sendMessage({ type: "restart_game" });
  }, [sendMessage]);

  const resignGame = useCallback(() => {
    sendMessage({ type: "resign_game" });
  }, [sendMessage]);

  const offerDraw = useCallback(() => {
    console.log("Sending offer_draw message");
    sendMessage({ type: "offer_draw" });
  }, [sendMessage]);

  const acceptDraw = useCallback(() => {
    console.log("Sending accept_draw message");
    sendMessage({ type: "accept_draw" });
  }, [sendMessage]);

  const declineDraw = useCallback(() => {
    console.log("Sending decline_draw message");
    sendMessage({ type: "decline_draw" });
  }, [sendMessage]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, "User disconnected");
      ws.current = null;
    }
    setWebSocketState({
      isConnected: false,
      isConnecting: false,
      roomId: null,
      playerRole: null,
      error: null,
      isWaitingForPlayer: false,
    });
  }, []);

  const onMessage = useCallback(
    (callback: (message: WebSocketMessage) => void) => {
      messageCallbacks.current.add(callback);

      // Return cleanup function
      return () => {
        messageCallbacks.current.delete(callback);
      };
    },
    []
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    websocketState,
    sendMessage,
    createRoom,
    joinRoom,
    makeMove,
    restartGame,
    resignGame,
    offerDraw,
    acceptDraw,
    declineDraw,
    disconnect,
    onMessage,
  };
}
