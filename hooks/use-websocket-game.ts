"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Player, Position } from "@/lib/othello-game";
import { config } from "@/lib/config";

export type WebSocketMessage =
  | { type: "join_room"; roomId: string; playerName?: string }
  | { type: "create_room"; playerName?: string }
  | { type: "make_move"; row: number; col: number }
  | { type: "restart_game" }
  | { type: "resign_game" }
  | { type: "offer_draw" }
  | { type: "accept_draw" }
  | { type: "decline_draw" }
  | { type: "offer_rematch" }
  | { type: "accept_rematch" }
  | { type: "decline_rematch" }
  | { type: "send_chat_message"; message: string; senderName?: string }
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
  | { type: "rematch_offered"; player: Player }
  | { type: "rematch_accepted"; player: Player }
  | { type: "rematch_declined"; player: Player }
  | {
      type: "chat_message";
      message: string;
      sender: Player;
      senderName: string;
      timestamp: number;
    }
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
  abandonGame: () => void;
  offerDraw: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  offerRematch: () => void;
  acceptRematch: () => void;
  declineRematch: () => void;
  sendChatMessage: (message: string, senderName?: string) => void;
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
  // Message queue for storing messages that couldn't be sent immediately
  const messageQueue = useRef<WebSocketMessage[]>([]);

  const connect = useCallback(() => {
    // If there's an existing connection, close it properly first
    if (ws.current) {
      if (ws.current.readyState === WebSocket.OPEN) {
        console.log("WebSocket already connected");
        return;
      } else if (ws.current.readyState === WebSocket.CONNECTING) {
        console.log("WebSocket already connecting");
        return;
      } else {
        console.log("Closing existing WebSocket connection");
        try {
          ws.current.close(1000, "Reconnecting");
        } catch (error) {
          console.error("Error closing existing connection:", error);
        }
      }
    }

    setWebSocketState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Use the centralized config to get the WebSocket URL
      const wsUrl = config.getWebSocketUrl();

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

        // Process any queued messages
        if (messageQueue.current.length > 0) {
          console.log(
            `Processing ${messageQueue.current.length} queued messages`
          );
          messageQueue.current.forEach((message) => {
            if (ws.current?.readyState === WebSocket.OPEN) {
              console.log("Sending queued message:", message);
              ws.current.send(JSON.stringify(message));
            }
          });
          // Clear the queue after processing
          messageQueue.current = [];
        }
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
        // Add more detailed debugging information
        console.error("WebSocket URL:", wsUrl);
        console.error("WebSocket readyState:", ws.current?.readyState);

        setWebSocketState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Failed to connect to game server. See console for details.",
        }));
      };

      ws.current.onclose = (event) => {
        console.log(
          `WebSocket closed with code ${event.code}. Reason: ${
            event.reason || "No reason provided"
          }`
        );

        let errorMessage = null;
        if (event.code === 1006) {
          errorMessage =
            "Connection closed abnormally. The server may be down or unreachable.";
        } else if (event.code === 1015) {
          errorMessage =
            "Connection failed due to TLS handshake failure. Check if WSS is properly configured.";
        } else if (event.code !== 1000) {
          errorMessage = `Connection closed with code ${event.code}${
            event.reason ? ": " + event.reason : ""
          }`;
        }

        setWebSocketState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: errorMessage,
        }));

        // Attempt to reconnect if not a normal closure
        if (
          event.code !== 1000 &&
          event.code !== 1001 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          console.log(
            `Attempting to reconnect (attempt ${
              reconnectAttempts.current + 1
            }/${maxReconnectAttempts})...`
          );

          // Exponential backoff for reconnection
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            10000
          );
          console.log(`Reconnecting in ${delay}ms`);

          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error(
            `Maximum reconnection attempts (${maxReconnectAttempts}) reached`
          );
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
        try {
          ws.current.send(JSON.stringify(message));
        } catch (error) {
          console.error("Error sending message:", error);
          // Queue the message for retry
          messageQueue.current.push(message);
        }
      } else {
        console.warn(
          "WebSocket is not connected, queueing message and attempting to connect"
        );
        // Add to message queue
        messageQueue.current.push(message);

        // Try to connect if not already connecting
        if (!websocketState.isConnecting) {
          connect();
        }
      }
    },
    [connect, websocketState.isConnecting]
  );

  const createRoom = useCallback(
    (playerName?: string) => {
      console.log(
        `Creating room with player name: ${playerName || "anonymous"}`
      );

      // Always queue the message first to ensure it gets sent
      messageQueue.current.push({ type: "create_room", playerName });

      if (!websocketState.isConnected) {
        console.log("WebSocket not connected, connecting first");
        connect();
      } else {
        // If already connected, send the message immediately
        sendMessage({ type: "create_room", playerName });
      }
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
  const abandonGame = useCallback(() => {
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

  const offerRematch = useCallback(() => {
    console.log("Sending offer_rematch message");
    sendMessage({ type: "offer_rematch" });
  }, [sendMessage]);

  const acceptRematch = useCallback(() => {
    console.log("Sending accept_rematch message");
    sendMessage({ type: "accept_rematch" });
  }, [sendMessage]);

  const declineRematch = useCallback(() => {
    console.log("Sending decline_rematch message");
    sendMessage({ type: "decline_rematch" });
  }, [sendMessage]);

  const sendChatMessage = useCallback(
    (message: string, senderName?: string) => {
      console.log("Sending chat message:", message);
      sendMessage({ type: "send_chat_message", message, senderName });
    },
    [sendMessage]
  );

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
    abandonGame,
    offerDraw,
    acceptDraw,
    declineDraw,
    offerRematch,
    acceptRematch,
    declineRematch,
    sendChatMessage,
    disconnect,
    onMessage,
  };
}
