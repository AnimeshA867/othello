"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const roomController_1 = require("./controllers/roomController");
const gameLogic_1 = require("../shared/gameLogic");
class EnhancedOthelloWebSocketServer {
    constructor(port = 3003) {
        this.wss = new ws_1.WebSocketServer({ port });
        console.log(`Enhanced WebSocket server running on port ${port}`);
        this.wss.on("connection", (ws) => {
            console.log("New client connected");
            ws.on("message", async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    console.log(`Received message: ${JSON.stringify(message)}`);
                    await this.handleMessage(ws, message);
                }
                catch (error) {
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
        // Clean up old rooms every hour
        setInterval(() => {
            (0, roomController_1.cleanupRooms)();
        }, 60 * 60 * 1000);
    }
    async handleMessage(ws, message) {
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
            // New handlers for ranked matchmaking
            case "join_random":
                await this.joinRandom(ws, message.rankSetType, message.rank, message.playerName);
                break;
            case "get_room_info":
                this.getRoomInfo(ws, message.roomId);
                break;
            default:
                this.sendError(ws, `Unknown message type: ${message.type}`);
        }
    }
    createRoom(ws, playerName) {
        const playerId = (0, uuid_1.v4)();
        ws.playerId = playerId;
        try {
            const room = (0, roomController_1.createRoom)(playerId, playerName);
            this.sendMessage(ws, {
                type: "room_created",
                roomId: room.roomId,
                player: "black",
            });
            this.sendMessage(ws, {
                type: "waiting_for_player",
            });
            console.log(`Room ${room.roomId} created by ${playerName || playerId}`);
        }
        catch (error) {
            console.error("Error creating room:", error);
            this.sendError(ws, "Failed to create room");
        }
    }
    joinRoom(ws, roomId, playerName) {
        console.log(`Attempting to join room ${roomId} with player ${playerName || "Anonymous"}`);
        const playerId = (0, uuid_1.v4)();
        ws.playerId = playerId;
        try {
            const room = (0, roomController_1.joinRoom)(roomId, playerId, playerName);
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
                    black: (blackPlayer === null || blackPlayer === void 0 ? void 0 : blackPlayer.name) || "Player 1",
                    white: playerName || "Player 2",
                },
            });
            console.log(`Player ${playerName || playerId} joined room ${roomId}`);
        }
        catch (error) {
            console.error(`Error joining room ${roomId}:`, error);
            this.sendError(ws, error instanceof Error ? error.message : "Failed to join room");
        }
    }
    async joinRandom(ws, rankSetType, rank, playerName) {
        const playerId = (0, uuid_1.v4)();
        ws.playerId = playerId;
        // Validate rank set type
        if (!(0, gameLogic_1.isValidRankSetType)(rankSetType)) {
            this.sendError(ws, "Invalid rank set type");
            return;
        }
        try {
            // Find or create a room with matching rank set type
            const room = await (0, roomController_1.findOrCreateRoom)(playerId, playerName, rank || 1000, rankSetType);
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
                console.log(`Player ${playerName || playerId} waiting in room ${room.roomId}`);
            }
            else {
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
                        black: (blackPlayer === null || blackPlayer === void 0 ? void 0 : blackPlayer.name) || "Player 1",
                        white: playerName || "Player 2",
                    },
                });
                console.log(`Player ${playerName || playerId} matched in room ${room.roomId}`);
            }
        }
        catch (error) {
            console.error("Error finding/creating room:", error);
            this.sendError(ws, "Failed to find or create room");
        }
    }
    makeMove(ws, row, col) {
        const playerId = ws.playerId;
        if (!playerId) {
            this.sendError(ws, "Player ID not found");
            return;
        }
        try {
            // Get the room for this player
            const room = (0, roomController_1.getRoomByPlayerId)(playerId);
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
            if (!(0, gameLogic_1.isValidMove)(room.gameState, row, col)) {
                this.sendError(ws, "Invalid move");
                return;
            }
            // Make the move
            const newGameState = (0, gameLogic_1.makeMove)(room.gameState, row, col);
            // Update room with new game state
            (0, roomController_1.updateGameState)(room.roomId, playerId, newGameState);
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
            console.log(`Player ${player.name || playerId} made move at ${row},${col} in room ${room.roomId}`);
        }
        catch (error) {
            console.error("Error making move:", error);
            this.sendError(ws, "Failed to make move");
        }
    }
    restartGame(ws) {
        // Implementation similar to existing websocket-server.ts
    }
    resignGame(ws) {
        // Implementation similar to existing websocket-server.ts
    }
    getRoomInfo(ws, roomId) {
        try {
            const room = (0, roomController_1.getRoom)(roomId);
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
        }
        catch (error) {
            console.error("Error getting room info:", error);
            this.sendError(ws, "Failed to get room info");
        }
    }
    offerDraw(ws) {
        const playerId = ws.playerId;
        if (!playerId) {
            this.sendError(ws, "Player not found");
            return;
        }
        try {
            const room = (0, roomController_1.getRoomByPlayerId)(playerId);
            if (!room) {
                this.sendError(ws, "Room not found");
                return;
            }
            const player = room.players.find(p => p.id === playerId);
            if (!player) {
                this.sendError(ws, "Player not found in room");
                return;
            }
            console.log(`[SERVER] Player ${player.name || player.id} (${player.color}) offered a draw`);
            // Set draw offer in game state
            room.gameState.drawOfferedBy = player.color;
            (0, roomController_1.updateGameState)(room.roomId, room.gameState);
            // Broadcast to room
            this.broadcastToRoom(room.roomId, {
                type: "draw_offered",
                player: player.color,
            });
        }
        catch (error) {
            console.error("Error offering draw:", error);
            this.sendError(ws, "Failed to offer draw");
        }
    }
    acceptDraw(ws) {
        const playerId = ws.playerId;
        if (!playerId) {
            this.sendError(ws, "Player not found");
            return;
        }
        try {
            const room = (0, roomController_1.getRoomByPlayerId)(playerId);
            if (!room) {
                this.sendError(ws, "Room not found");
                return;
            }
            const player = room.players.find(p => p.id === playerId);
            if (!player) {
                this.sendError(ws, "Player not found in room");
                return;
            }
            // Verify there's an active draw offer and it wasn't made by this player
            if (!room.gameState.drawOfferedBy || room.gameState.drawOfferedBy === player.color) {
                this.sendError(ws, "No active draw offer to accept");
                return;
            }
            console.log(`[SERVER] Player ${player.name || player.id} (${player.color}) accepted the draw`);
            // End game with draw
            room.gameState.isGameOver = true;
            room.gameState.winner = "draw";
            room.gameState.drawOfferedBy = null;
            (0, roomController_1.updateGameState)(room.roomId, room.gameState);
            // Broadcast to room
            this.broadcastToRoom(room.roomId, {
                type: "game_over",
                winner: "draw",
            });
            // Send updated game state
            this.broadcastGameState(room);
        }
        catch (error) {
            console.error("Error accepting draw:", error);
            this.sendError(ws, "Failed to accept draw");
        }
    }
    declineDraw(ws) {
        const playerId = ws.playerId;
        if (!playerId) {
            this.sendError(ws, "Player not found");
            return;
        }
        try {
            const room = (0, roomController_1.getRoomByPlayerId)(playerId);
            if (!room) {
                this.sendError(ws, "Room not found");
                return;
            }
            const player = room.players.find(p => p.id === playerId);
            if (!player) {
                this.sendError(ws, "Player not found in room");
                return;
            }
            // Verify there's an active draw offer
            if (!room.gameState.drawOfferedBy) {
                this.sendError(ws, "No active draw offer to decline");
                return;
            }
            console.log(`[SERVER] Player ${player.name || player.id} (${player.color}) declined the draw`);
            // Clear draw offer
            room.gameState.drawOfferedBy = null;
            (0, roomController_1.updateGameState)(room.roomId, room.gameState);
            // Broadcast to room
            this.broadcastToRoom(room.roomId, {
                type: "draw_declined",
                player: player.color,
            });
        }
        catch (error) {
            console.error("Error declining draw:", error);
            this.sendError(ws, "Failed to decline draw");
        }
    }
}
try {
    const room = (0, roomController_1.getRoomByPlayerId)(playerId);
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
    (0, roomController_1.removePlayerFromRoom)(playerId);
}
catch (error) {
    console.error("Error handling disconnect:", error);
}
sendMessage(ws, ws_1.WebSocket, message, any);
{
    if (ws.readyState === ws_1.WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}
sendError(ws, ws_1.WebSocket, message, string);
{
    this.sendMessage(ws, { type: "error", message });
}
broadcastToRoom(roomId, string, message, any);
{
    const room = (0, roomController_1.getRoom)(roomId);
    if (!room) {
        return;
    }
    for (const player of room.players) {
        // Find the socket for this player
        const clients = Array.from(this.wss.clients);
        const socket = clients.find((client) => client.playerId === player.id);
        if (socket && socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }
}
// Start the server when this file is run directly
if (require.main === module) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;
    new EnhancedOthelloWebSocketServer(port);
}
exports.default = EnhancedOthelloWebSocketServer;
