"use strict";

import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import {
  findOrCreateRoom,
  createRoom,
  joinRoom,
  updateGameState,
  getRoom,
  getRoomByPlayerId,
  removePlayerFromRoom,
  cleanupRooms,
} from "./controllers/roomController";
import {
  makeMove,
  isValidMove,
  Player,
  RankSetType,
  isValidRankSetType,
} from "../shared/gameLogic";
import http from "http";
import { createInitialGameState } from "../shared/gameLogic";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface ExtendedWebSocket extends WebSocket {
  playerId?: string;
}

class EnhancedOthelloWebSocketServer {
  private wss: WebSocketServer;

  constructor(serverOrPort: http.Server | number = 3003) {
    if (typeof serverOrPort === "number") {
      // Use port number
      const port = serverOrPort;
      this.wss = new WebSocketServer({ port, host: "0.0.0.0" });
      console.log(`Enhanced WebSocket server running on port ${port}`);
    } else {
      // Use HTTP server
      this.wss = new WebSocketServer({ server: serverOrPort });
      console.log(`Enhanced WebSocket server attached to HTTP server`);
    }

    this.wss.on("connection", (ws: ExtendedWebSocket) => {
      console.log("New client connected");

      // Assign a unique ID to this connection for tracking
      const connectionId = uuidv4().substring(0, 8);
      console.log(`Assigned connection ID: ${connectionId}`);

      ws.on("message", async (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          console.log(
            `[${connectionId}] Received message: ${JSON.stringify(message)}`
          );
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error(`[${connectionId}] Failed to parse message:`, error);
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected");
        this.handleDisconnect(ws);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });

    // Clean up old rooms every hour
    setInterval(() => {
      cleanupRooms();
    }, 60 * 60 * 1000);
  }

  private async handleMessage(
    ws: ExtendedWebSocket,
    message: WebSocketMessage
  ) {
    console.log(`Received message: ${message.type}`);

    switch (message.type) {
      // Existing handlers
      case "create_room":
        this.createRoom(ws, message.playerName);
        break;
      case "join_room":
        this.joinRoom(ws, message.roomId, message.playerName);
        break;
      case "make_move":
        this.makeMove(ws, message.row, message.col);
        break;
      case "restart_game":
        this.restartGame(ws);
        break;
      case "resign_game":
        this.resignGame(ws);
        break;
      case "offer_draw":
        this.offerDraw(ws);
        break;
      case "accept_draw":
        this.acceptDraw(ws);
        break;
      case "decline_draw":
        this.declineDraw(ws);
        break;
      case "offer_rematch":
        console.log("This is working.");

        this.offerRematch(ws);
        break;
      case "accept_rematch":
        this.acceptRematch(ws);
        break;
      case "decline_rematch":
        this.declineRematch(ws);
        break;
      case "send_chat_message":
        this.handleChatMessage(ws, message.message, message.senderName);
        break;

      // New handlers for ranked matchmaking
      case "join_random":
        await this.joinRandom(
          ws,
          message.rankSetType,
          message.rank,
          message.playerName
        );
        break;
      case "get_room_info":
        this.getRoomInfo(ws, message.roomId);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  private createRoom(ws: ExtendedWebSocket, playerName?: string) {
    const playerId = uuidv4();
    ws.playerId = playerId;

    try {
      const room = createRoom(playerId, playerName);

      this.sendMessage(ws, {
        type: "room_created",
        roomId: room.roomId,
        player: "black",
      });

      this.sendMessage(ws, {
        type: "waiting_for_player",
      });

      console.log(`Room ${room.roomId} created by ${playerName || playerId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      this.sendError(ws, "Failed to create room");
    }
  }

  private joinRoom(ws: ExtendedWebSocket, roomId: string, playerName?: string) {
    console.log(
      `Attempting to join room ${roomId} with player ${
        playerName || "Anonymous"
      }`
    );

    const playerId = uuidv4();
    ws.playerId = playerId;

    try {
      const room = joinRoom(roomId, playerId, playerName);
      console.log(`Player ${playerId} successfully joined room ${roomId}`);

      // Send confirmation to the joining player
      this.sendMessage(ws, {
        type: "player_joined",
        player: "white",
        playerName,
      });

      // Send game state to the joining player
      this.sendMessage(ws, {
        type: "game_state",
        gameState: room.gameState,
      });

      // Find the other player
      const blackPlayer = room.players.find((p) => p.color === "black");

      // Notify both players that the game is ready
      this.broadcastToRoom(room.roomId, {
        type: "game_ready",
        roomId: room.roomId,
        players: {
          black: blackPlayer?.name || "Player 1",
          white: playerName || "Player 2",
        },
      });

      console.log(`Player ${playerName || playerId} joined room ${roomId}`);
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error);
      this.sendError(
        ws,
        error instanceof Error ? error.message : "Failed to join room"
      );
    }
  }

  private async joinRandom(
    ws: ExtendedWebSocket,
    rankSetType: string,
    rank: number,
    playerName?: string
  ) {
    const playerId = uuidv4();
    ws.playerId = playerId;

    // Validate rank set type
    if (!isValidRankSetType(rankSetType)) {
      this.sendError(ws, "Invalid rank set type");
      return;
    }

    try {
      // Find or create a room with matching rank set type
      const room = await findOrCreateRoom(
        playerId,
        playerName,
        rank || 1000,
        rankSetType as RankSetType
      );

      // If room is in waiting status, this is the first player
      if (room.status === "waiting") {
        this.sendMessage(ws, {
          type: "room_created",
          roomId: room.roomId,
          player: "black",
        });

        this.sendMessage(ws, {
          type: "waiting_for_player",
        });

        console.log(
          `Player ${playerName || playerId} waiting in room ${room.roomId}`
        );
      } else {
        // If room is active, this is the second player

        // Send confirmation to the joining player
        this.sendMessage(ws, {
          type: "player_joined",
          player: "white",
          playerName,
        });

        // Send game state to the joining player
        this.sendMessage(ws, {
          type: "game_state",
          gameState: room.gameState,
        });

        // Find the other player
        const blackPlayer = room.players.find((p) => p.color === "black");

        // Notify both players that the game is ready
        this.broadcastToRoom(room.roomId, {
          type: "game_ready",
          roomId: room.roomId,
          players: {
            black: blackPlayer?.name || "Player 1",
            white: playerName || "Player 2",
          },
        });

        console.log(
          `Player ${playerName || playerId} matched in room ${room.roomId}`
        );
      }
    } catch (error) {
      console.error("Error finding/creating room:", error);
      this.sendError(ws, "Failed to find or create room");
    }
  }

  private makeMove(ws: ExtendedWebSocket, row: number, col: number) {
    const playerId = ws.playerId;
    if (!playerId) {
      this.sendError(ws, "Player ID not found");
      return;
    }

    try {
      // Get the room for this player
      const room = getRoomByPlayerId(playerId);

      if (!room) {
        this.sendError(ws, "Room not found");
        return;
      }

      // Check if it's this player's turn
      const player = room.players.find((p) => p.id === playerId);

      if (!player) {
        this.sendError(ws, "Player not found in room");
        return;
      }

      if (player.color !== room.gameState.currentPlayer) {
        this.sendError(ws, "Not your turn");
        return;
      }

      // Validate the move
      if (!isValidMove(room.gameState, row, col)) {
        this.sendError(ws, "Invalid move");
        return;
      }

      // Make the move
      const newGameState = makeMove(room.gameState, row, col);

      // Update room with new game state
      updateGameState(room.roomId, playerId, newGameState);

      // Broadcast the move to all players in the room
      this.broadcastToRoom(room.roomId, {
        type: "move_made",
        row,
        col,
        player: player.color,
      });

      // Broadcast the updated game state
      this.broadcastToRoom(room.roomId, {
        type: "game_state",
        gameState: newGameState,
      });

      // If the game is over, broadcast game over message
      if (newGameState.isGameOver) {
        this.broadcastToRoom(room.roomId, {
          type: "game_over",
          winner: newGameState.winner,
          blackScore: newGameState.blackScore,
          whiteScore: newGameState.whiteScore,
        });
      }

      console.log(
        `Player ${player.name || playerId} made move at ${row},${col} in room ${
          room.roomId
        }`
      );
    } catch (error) {
      console.error("Error making move:", error);
      this.sendError(ws, "Failed to make move");
    }
  }

  private restartGame(ws: ExtendedWebSocket) {
    // Implementation similar to existing websocket-server.ts
  }

  private getRoomInfo(ws: ExtendedWebSocket, roomId: string) {
    try {
      const room = getRoom(roomId);

      if (!room) {
        this.sendError(ws, "Room not found");
        return;
      }

      this.sendMessage(ws, {
        type: "room_info",
        roomId: room.roomId,
        status: room.status,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          rank: p.rank,
        })),
        rankSetType: room.rankSetType,
        createdAt: room.createdAt,
      });
    } catch (error) {
      console.error("Error getting room info:", error);
      this.sendError(ws, "Failed to get room info");
    }
  }

  private resignGame(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    const room = getRoomByPlayerId(playerId);

    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    this.broadcastToRoom(room.roomId, {
      type: "player_resigned",
      player: player.color,
    });
  }

  private offerDraw(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    const room = getRoomByPlayerId(playerId);

    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }

    const roomId = room.roomId;
    console.log(
      `[SERVER] Draw offer from player ${playerId} in room ${roomId}`
    );

    if (!roomId) {
      console.log("[SERVER] No room ID found for player offering draw");
      return;
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      console.log("[SERVER] Player not found in room for draw offer");
      return;
    }

    console.log(`[SERVER] Setting drawOfferedBy to ${player.color}`);

    // Set a flag in the game state
    room.gameState = {
      ...room.gameState,
      drawOfferedBy: player.color,
    };

    // Broadcast the draw offer to all players
    this.broadcastToRoom(roomId, {
      type: "draw_offered",
      player: player.color,
    });

    console.log(`[SERVER] Draw offer broadcast to room ${roomId}`);
  }

  private acceptDraw(ws: WebSocket) {
    const playerId = (ws as any).playerId;

    const room = getRoomByPlayerId(playerId);
    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }
    const roomId = room.roomId;

    if (!roomId) return;

    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    // Verify there's an active draw offer and it wasn't made by this player
    if (
      !room.gameState.drawOfferedBy ||
      room.gameState.drawOfferedBy === player.color
    ) {
      return;
    }

    // End the game in a draw
    room.gameState = {
      ...room.gameState,
      isGameOver: true,
      winner: "draw",
      drawOfferedBy: null,
    };

    // Broadcast the game over message
    this.broadcastToRoom(roomId, {
      type: "game_over",
      winner: "draw",
    });

    // Broadcast the final game state
    this.broadcastToRoom(roomId, {
      type: "game_state",
      gameState: room.gameState,
    });
  }

  private declineDraw(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    const room = getRoomByPlayerId(playerId);
    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }

    const roomId = room.roomId;
    if (!roomId) return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    // Remove the draw offer
    room.gameState = {
      ...room.gameState,
      drawOfferedBy: null,
    };

    // Broadcast the decline
    this.broadcastToRoom(roomId, {
      type: "draw_declined",
      player: player.color,
    });
  }

  private offerRematch(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    const room = getRoomByPlayerId(playerId);

    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }

    const roomId = room.roomId;
    console.log(
      `[SERVER] Rematch offer from player ${playerId} in room ${roomId}`
    );

    if (!roomId) {
      console.log("[SERVER] No room ID found for player offering rematch");
      return;
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      console.log("[SERVER] Player not found in room for rematch offer");
      return;
    }

    console.log(`[SERVER] Setting rematchOfferedBy to ${player.color}`);

    // Set a flag in the game state
    room.gameState = {
      ...room.gameState,
      rematchOfferedBy: player.color,
    };

    // Broadcast the rematch offer to all players
    this.broadcastToRoom(roomId, {
      type: "rematch_offered",
      player: player.color,
    });

    console.log(`[SERVER] Rematch offer broadcast to room ${roomId}`);
  }

  private acceptRematch(ws: WebSocket) {
    const playerId = (ws as any).playerId;

    const room = getRoomByPlayerId(playerId);
    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }
    const roomId = room.roomId;

    if (!roomId) return;

    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    // Verify there's an active rematch offer and it wasn't made by this player
    if (
      !room.gameState.rematchOfferedBy ||
      room.gameState.rematchOfferedBy === player.color
    ) {
      return;
    }

    // Reset the game state
    room.gameState = createInitialGameState();
    room.status = "active";

    // Broadcast the game restart
    this.broadcastToRoom(roomId, {
      type: "game_restarted",
    });

    // Find the other player
    const blackPlayer = room.players.find((p) => p.color === "black");

    // Notify both players that the game is ready
    this.broadcastToRoom(room.roomId, {
      type: "game_ready",
      roomId: room.roomId,
      players: {
        black: blackPlayer?.name || "Player 1",
        white: player.name || "Player 2",
      },
    });

    // Broadcast the new game state
    this.broadcastToRoom(roomId, {
      type: "game_state",
      gameState: room.gameState,
    });
  }

  private declineRematch(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    const room = getRoomByPlayerId(playerId);
    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }

    const roomId = room.roomId;
    if (!roomId) return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    // Remove the rematch offer
    room.gameState = {
      ...room.gameState,
      rematchOfferedBy: null,
    };

    // Broadcast the decline
    this.broadcastToRoom(roomId, {
      type: "rematch_declined",
      player: player.color,
    });
  }

  private handleChatMessage(
    ws: WebSocket,
    message: string,
    senderName?: string
  ) {
    const playerId = (ws as any).playerId;
    const room = getRoomByPlayerId(playerId);

    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      this.sendError(ws, "Player not found in room");
      return;
    }

    // Broadcast the chat message to all players in the room
    this.broadcastToRoom(room.roomId, {
      type: "chat_message",
      message: message,
      sender: player.color,
      senderName: senderName || player.name || "Anonymous",
      timestamp: Date.now(),
    });
  }

  private handleDisconnect(ws: ExtendedWebSocket) {
    const playerId = ws.playerId;

    if (!playerId) {
      return;
    }

    try {
      const room = getRoomByPlayerId(playerId);

      if (!room) {
        return;
      }

      const player = room.players.find((p) => p.id === playerId);

      if (!player) {
        return;
      }

      // If game is active, notify the other player
      if (room.status === "active") {
        this.broadcastToRoom(room.roomId, {
          type: "player_disconnected",
          player: player.color,
          name: player.name,
        });

        // Set game as finished, with other player as winner
        const otherPlayer = room.players.find((p) => p.id !== playerId);

        if (otherPlayer) {
          room.gameState.isGameOver = true;
          room.gameState.winner = otherPlayer.color;

          this.broadcastToRoom(room.roomId, {
            type: "game_over",
            winner: otherPlayer.color,
            reason: "disconnect",
          });
        }
      }

      // Remove player from room
      removePlayerFromRoom(playerId);
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  }

  private sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        console.log(`Sending message: ${JSON.stringify(message)}`);
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message: ${error}`);
      }
    } else {
      console.warn(
        `Cannot send message, socket is not open (readyState=${
          ws.readyState
        }): ${JSON.stringify(message)}`
      );
    }
  }

  private sendError(ws: WebSocket, message: string) {
    this.sendMessage(ws, { type: "error", message });
  }

  private broadcastToRoom(roomId: string, message: any) {
    const room = getRoom(roomId);

    if (!room) {
      return;
    }

    for (const player of room.players) {
      // Find the socket for this player
      const clients = Array.from(this.wss.clients) as ExtendedWebSocket[];
      const socket = clients.find((client) => client.playerId === player.id);

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    }
  }
}

// Start the server when this file is run directly
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;
  new EnhancedOthelloWebSocketServer(port);
}

export default EnhancedOthelloWebSocketServer;
