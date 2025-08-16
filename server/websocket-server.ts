import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

export interface Player {
  id: string;
  name?: string;
  color: "black" | "white";
  socket: WebSocket;
}

export interface GameRoom {
  id: string;
  players: Map<string, Player>;
  gameState: any;
  createdAt: Date;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

class OthelloWebSocketServer {
  private wss: WebSocketServer;
  private rooms = new Map<string, GameRoom>();
  private playerToRoom = new Map<string, string>();

  constructor(port: number = 3003) {
    this.wss = new WebSocketServer({ port });
    console.log(`WebSocket server running on port ${port}`);

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New client connected");

      ws.on("message", (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Failed to parse message:", error);
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

    // Clean up empty rooms every 30 minutes
    setInterval(() => {
      this.cleanupEmptyRooms();
    }, 30 * 60 * 1000);
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
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
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  private createRoom(ws: WebSocket, playerName?: string) {
    const roomId = this.generateRoomId();
    const playerId = uuidv4();

    const player: Player = {
      id: playerId,
      name: playerName,
      color: "black", // First player is always black
      socket: ws,
    };

    const room: GameRoom = {
      id: roomId,
      players: new Map([[playerId, player]]),
      gameState: this.createInitialGameState(),
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    this.playerToRoom.set(playerId, roomId);

    // Store player ID in WebSocket for cleanup
    (ws as any).playerId = playerId;

    console.log(
      `📦 Created room ${roomId} for ${playerName || "Anonymous"} (black)`
    );

    this.sendMessage(ws, {
      type: "room_created",
      roomId,
      player: "black",
    });

    this.sendMessage(ws, {
      type: "waiting_for_player",
    });

    console.log(
      `✅ Room ${roomId} created successfully - waiting for second player`
    );
  }

  private joinRoom(ws: WebSocket, roomId: string, playerName?: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      console.log(`❌ Room ${roomId} not found`);
      this.sendError(ws, "Room not found");
      return;
    }

    if (room.players.size >= 2) {
      console.log(`❌ Room ${roomId} is full`);
      this.sendMessage(ws, { type: "room_full" });
      return;
    }

    const playerId = uuidv4();
    const player: Player = {
      id: playerId,
      name: playerName,
      color: "white", // Second player is always white
      socket: ws,
    };

    room.players.set(playerId, player);
    this.playerToRoom.set(playerId, roomId);

    // Store player ID in WebSocket for cleanup
    (ws as any).playerId = playerId;

    console.log(
      `👥 ${playerName || "Anonymous"} joining room ${roomId} as white player`
    );

    // Send the joining player their role first
    this.sendMessage(ws, {
      type: "player_joined",
      player: "white",
      playerName,
    });

    // Send initial game state to the new player
    this.sendMessage(ws, {
      type: "game_state",
      gameState: room.gameState,
    });

    console.log("Game state sent to joining player:", {
      pieces: room.gameState.board.flat().filter(cell => cell).length,
      validMoves: room.gameState.validMoves.length,
      currentPlayer: room.gameState.currentPlayer
    });

    // Now that both players are connected, start the game
    const blackPlayer = Array.from(room.players.values()).find(
      (p) => p.color === "black"
    );
    const whitePlayer = Array.from(room.players.values()).find(
      (p) => p.color === "white"
    );

    console.log(`🎮 Both players connected - starting game in room ${roomId}`);
    console.log(`   Black: ${blackPlayer?.name || "Player 1"}`);
    console.log(`   White: ${whitePlayer?.name || "Player 2"}`);

    // Broadcast that the game is ready to start
    this.broadcastToRoom(roomId, {
      type: "game_ready",
      roomId,
      players: {
        black: blackPlayer?.name || "Player 1",
        white: whitePlayer?.name || "Player 2",
      },
    });

    console.log(`✅ Game ready message sent to all players in room ${roomId}`);
  }

  private makeMove(ws: WebSocket, row: number, col: number) {
    const playerId = (ws as any).playerId;
    const roomId = this.playerToRoom.get(playerId);

    if (!roomId) {
      this.sendError(ws, "You are not in a game room");
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      this.sendError(ws, "Room not found");
      return;
    }

    const player = room.players.get(playerId);
    if (!player) {
      this.sendError(ws, "Player not found");
      return;
    }

    // Check if it's the player's turn
    if (room.gameState.currentPlayer !== player.color) {
      this.sendError(ws, "Not your turn");
      return;
    }

    // Validate and make the move (simplified - you'd integrate with your game logic)
    const moveResult = this.processMove(room.gameState, row, col, player.color);

    if (!moveResult.valid) {
      this.sendMessage(ws, { type: "invalid_move" });
      return;
    }

    // Update game state
    room.gameState = moveResult.newGameState;

    // Broadcast the move to all players in the room
    this.broadcastToRoom(roomId, {
      type: "move_made",
      row,
      col,
      player: player.color,
    });

    // Broadcast updated game state
    this.broadcastToRoom(roomId, {
      type: "game_state",
      gameState: room.gameState,
    });
  }

  private restartGame(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    const roomId = this.playerToRoom.get(playerId);

    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameState = this.createInitialGameState();

    this.broadcastToRoom(roomId, {
      type: "game_restarted",
    });

    this.broadcastToRoom(roomId, {
      type: "game_state",
      gameState: room.gameState,
    });
  }

  private resignGame(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    const roomId = this.playerToRoom.get(playerId);

    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    this.broadcastToRoom(roomId, {
      type: "player_resigned",
      player: player.color,
    });
  }

  private offerDraw(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    const roomId = this.playerToRoom.get(playerId);

    console.log(`[SERVER] Draw offer from player ${playerId} in room ${roomId}`);

    if (!roomId) {
      console.log("[SERVER] No room ID found for player offering draw");
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      console.log("[SERVER] Room not found for draw offer");
      return;
    }

    const player = room.players.get(playerId);
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
    const roomId = this.playerToRoom.get(playerId);

    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    // Verify there's an active draw offer and it wasn't made by this player
    if (!room.gameState.drawOfferedBy || room.gameState.drawOfferedBy === player.color) {
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
    const roomId = this.playerToRoom.get(playerId);

    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
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

  private handleDisconnect(ws: WebSocket) {
    const playerId = (ws as any).playerId;
    if (!playerId) return;

    const roomId = this.playerToRoom.get(playerId);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.players.delete(playerId);

        // If room is empty, delete it
        if (room.players.size === 0) {
          this.rooms.delete(roomId);
        } else {
          // Notify remaining players
          this.broadcastToRoom(roomId, {
            type: "player_disconnected",
            playerId,
          });
        }
      }
      this.playerToRoom.delete(playerId);
    }
  }

  private sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, message: string) {
    this.sendMessage(ws, { type: "error", message });
  }

  private broadcastToRoom(roomId: string, message: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.forEach((player) => {
      this.sendMessage(player.socket, message);
    });
  }

  private generateRoomId(): string {
    // Generate a 6-character room ID
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private createInitialGameState() {
    // Create an 8x8 board with initial Othello setup
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Initial pieces
    board[3][3] = "white";
    board[3][4] = "black";
    board[4][3] = "black";
    board[4][4] = "white";

    // Calculate valid moves for black
    const validMoves = this.calculateValidMoves(board, "black");
    console.log(`Initial game state created with ${validMoves.length} valid moves for black:`, validMoves);

    return {
      board,
      currentPlayer: "black",
      blackScore: 2,
      whiteScore: 2,
      isGameOver: false,
      winner: null,
      validMoves: validMoves,
      lastMove: null,
      gameMode: "friend",
      moveHistory: [],
    };
  }
  }

  private calculateValidMoves(
    board: any[][],
    player: "black" | "white"
  ): Array<{ row: number; col: number }> {
    // Simplified valid move calculation - you'd integrate with your game logic
    const validMoves = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === null) {
          // Check if this position would result in flipping opponent pieces
          if (this.wouldFlipPieces(board, row, col, player)) {
            validMoves.push({ row, col });
          }
        }
      }
    }

    return validMoves;
  }

  private wouldFlipPieces(
    board: any[][],
    row: number,
    col: number,
    player: "black" | "white"
  ): boolean {
    // Simplified check - you'd integrate with your actual game logic
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      let foundOpponent = false;

      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board[r][c] === null) break;
        if (board[r][c] !== player) {
          foundOpponent = true;
          r += dr;
          c += dc;
        } else {
          if (foundOpponent) return true;
          break;
        }
      }
    }

    return false;
  }

  private processMove(
    gameState: any,
    row: number,
    col: number,
    player: "black" | "white"
  ) {
    // This is a simplified version - you'd integrate with your actual OthelloGame class
    const board = gameState.board.map((r: any[]) => [...r]);

    if (board[row][col] !== null) {
      return { valid: false, newGameState: gameState };
    }

    if (!this.wouldFlipPieces(board, row, col, player)) {
      return { valid: false, newGameState: gameState };
    }

    // Place the piece
    board[row][col] = player;

    // Flip pieces (simplified)
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const toFlip = [];
      let r = row + dr;
      let c = col + dc;

      while (
        r >= 0 &&
        r < 8 &&
        c >= 0 &&
        c < 8 &&
        board[r][c] !== null &&
        board[r][c] !== player
      ) {
        toFlip.push([r, c]);
        r += dr;
        c += dc;
      }

      if (
        r >= 0 &&
        r < 8 &&
        c >= 0 &&
        c < 8 &&
        board[r][c] === player &&
        toFlip.length > 0
      ) {
        toFlip.forEach(([fr, fc]) => {
          board[fr][fc] = player;
        });
      }
    }

    // Calculate scores
    let blackScore = 0;
    let whiteScore = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === "black") blackScore++;
        if (board[r][c] === "white") whiteScore++;
      }
    }

    const nextPlayer = player === "black" ? "white" : "black";
    const validMoves = this.calculateValidMoves(board, nextPlayer);

    // Check if game is over
    const isGameOver =
      validMoves.length === 0 &&
      this.calculateValidMoves(board, player).length === 0;
    let winner = null;

    if (isGameOver) {
      if (blackScore > whiteScore) winner = "black";
      else if (whiteScore > blackScore) winner = "white";
    }

    return {
      valid: true,
      newGameState: {
        ...gameState,
        board,
        currentPlayer: validMoves.length > 0 ? nextPlayer : player,
        blackScore,
        whiteScore,
        validMoves:
          validMoves.length > 0
            ? validMoves
            : this.calculateValidMoves(board, player),
        lastMove: { row, col },
        isGameOver,
        winner,
      },
    };
  }

  private cleanupEmptyRooms() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const roomsToDelete: string[] = [];

    this.rooms.forEach((room, roomId) => {
      if (room.players.size === 0 || room.createdAt < oneHourAgo) {
        roomsToDelete.push(roomId);
      }
    });

    roomsToDelete.forEach((roomId) => {
      this.rooms.delete(roomId);
      console.log(`Cleaned up room ${roomId}`);
    });
  }
}

// Start the server if this file is run directly
const isMain = process.argv[1] && process.argv[1].includes("websocket-server");
if (isMain) {
  new OthelloWebSocketServer(3003);
}

export default OthelloWebSocketServer;
