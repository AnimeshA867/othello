"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useWebSocketGame, type WebSocketMessage } from "./use-websocket-game";
import type { GameState, Player } from "@/lib/othello-game";
import { getValidMoves } from "@/shared/gameLogic";

interface MultiplayerGameState extends GameState {
  localPlayer: Player | null;
  opponentName?: string;
  isWaitingForPlayer: boolean;
  roomId: string | null;
  drawOfferedBy?: "black" | "white" | null;
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
    offerDraw: sendDrawOffer,
    acceptDraw: sendAcceptDraw,
    declineDraw: sendDeclineDraw,
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
    moveHistory: [],
    canUndo: false,
    undosRemaining: 0,
    drawOfferedBy: null,
  });
  // Register message handlers
  useEffect(() => {
    const unsubscribe = onMessage((message: WebSocketMessage) => {
      switch (message.type) {
        case "room_created":
          setGameState((prev) => {
            console.log(
              "Room created, setting local player to:",
              message.player
            );
            return {
              ...prev,
              localPlayer: message.player === "black" ? "black" : "white",
              roomId: message.roomId,
              isWaitingForPlayer: true,
            };
          });
          break;

        case "player_joined":
          setGameState((prev) => {
            console.log(
              "Player joined, current localPlayer:",
              prev.localPlayer,
              "joined player:",
              message.player
            );
            if (message.player && !prev.localPlayer) {
              return {
                ...prev,
                localPlayer: message.player === "black" ? "black" : "white",
                opponentName: message.playerName,
                opponentRank: message.rank,
              };
            }
            return {
              ...prev,
              opponentName: message.playerName,
              opponentRank: message.rank,
            };
          });
          break;

        case "game_ready":
          setGameState((prev) => {
            console.log("Game ready event received, players:", message.players);
            // Initialize the standard starting board
            const initialBoard = Array(8)
              .fill(null)
              .map(() => Array(8).fill(null)) as ("black" | "white" | null)[][];

            // Set the four center pieces
            initialBoard[3][3] = "white";
            initialBoard[3][4] = "black";
            initialBoard[4][3] = "black";
            initialBoard[4][4] = "white";

            // Calculate valid moves for the initial state
            const validMoves = getValidMoves(initialBoard, "black");

            return {
              ...prev,
              board: initialBoard,
              currentPlayer: "black", // Black always starts
              blackScore: 2,
              whiteScore: 2,
              validMoves: validMoves,
              isWaitingForPlayer: false,
              opponentName:
                prev.localPlayer === "black"
                  ? message.players.white
                  : message.players.black,
            };
          });
          break;

        case "game_state":
          console.log("Ranked game state received:", message.gameState);
          setGameState((prev) => {
            // Log valid moves for debugging
            if (message.gameState.validMoves) {
              console.log(
                `Valid moves in ranked game: ${message.gameState.validMoves.length}`,
                message.gameState.validMoves
              );
            } else {
              console.warn("No valid moves in ranked game state");
            }

            // Ensure we don't lose board state if it's not included in the update
            const updatedBoard = message.gameState.board || prev.board;

            // Log board state for debugging
            console.log(
              "Board state in game_state update:",
              updatedBoard
                ? `${
                    updatedBoard
                      .flat()
                      .filter((cell: "black" | "white" | null) => cell !== null)
                      .length
                  } pieces`
                : "No board in update"
            );

            // Keep the original validMoves from the server
            const newState: MultiplayerGameState = {
              ...prev,
              ...message.gameState,
              board: updatedBoard,
              localPlayer: prev.localPlayer,
              roomId: prev.roomId,
              isWaitingForPlayer: prev.isWaitingForPlayer,
              opponentName: prev.opponentName,
            };

            return newState;
          });
          break;

        case "waiting_for_player":
          setGameState((prev) => ({
            ...prev,
            isWaitingForPlayer: true,
          }));
          break;

        case "draw_offered":
          setGameState((prev) => ({
            ...prev,
            drawOfferedBy: message.player,
          }));
          break;

        case "draw_declined":
          setGameState((prev) => ({
            ...prev,
            drawOfferedBy: null,
          }));
          break;

        case "game_over":
          setGameState((prev) => ({
            ...prev,
            isGameOver: true,
            winner: message.winner,
            drawOfferedBy: null,
          }));
          break;

        case "player_disconnected":
          setGameState((prev) => {
            const newState: MultiplayerGameState = {
              ...prev,
              isGameOver: true,
              winner: prev.localPlayer as "black" | "white" | null,
            };
            return newState;
          });
          break;

        case "error":
          console.error("WebSocket error:", message.message);
          break;
      }
    });

    return unsubscribe;
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
      console.log("Attempting move at", row, col);
      console.log("Current state:", {
        playerRole: websocketState.playerRole,
        currentPlayer: gameState.currentPlayer,
        validMovesCount: gameState.validMoves.length,
      });

      // Check if it's the local player's turn
      if (websocketState.playerRole !== gameState.currentPlayer) {
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

      console.log("Sending move to server:", row, col);
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

  const offerDraw = useCallback(() => {
    sendDrawOffer();
  }, [sendDrawOffer]);

  const acceptDraw = useCallback(() => {
    sendAcceptDraw();
  }, [sendAcceptDraw]);

  const declineDraw = useCallback(() => {
    sendDeclineDraw();
  }, [sendDeclineDraw]);

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
      moveHistory: [],
      canUndo: false,
      undosRemaining: 0,
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
    offerDraw,
    acceptDraw,
    declineDraw,
    leaveRoom,
    isConnected: websocketState.isConnected,
    isConnecting: websocketState.isConnecting,
    error: websocketState.error,
  };
}
