"use strict";

import type {
  Room,
  RankSetType,
  Player,
  GameState,
} from "../../shared/gameLogic";
import { createInitialGameState, generateRoomId } from "../../shared/gameLogic";
import { v4 as uuidv4 } from "uuid";

// In-memory database for rooms (would use MongoDB in production)
const rooms = new Map<string, Room>();
const playerToRoom = new Map<string, string>();

/**
 * Find a room with matching rank set type and the closest player rank,
 * or create a new room if none is found.
 */
export async function findOrCreateRoom(
  userId: string,
  playerName: string | undefined,
  userRank: number,
  rankSetType: RankSetType
): Promise<Room> {
  // Find rooms with waiting status and matching rank set type
  const availableRooms: Room[] = [];

  for (const room of rooms.values()) {
    if (room.status === "waiting" && room.rankSetType === rankSetType) {
      availableRooms.push(room);
    }
  }

  // Sort by closest rank
  availableRooms.sort((a, b) => {
    const rankA = a.players[0]?.rank || 0;
    const rankB = b.players[0]?.rank || 0;
    return Math.abs(rankA - userRank) - Math.abs(rankB - userRank);
  });

  if (availableRooms.length > 0) {
    // Join room with closest rank
    const room = availableRooms[0];

    const player: Player = {
      id: userId,
      name: playerName,
      rank: userRank,
      color: "white", // Second player is always white
    };

    room.players.push(player);
    room.status = "active";
    playerToRoom.set(userId, room.roomId);

    console.log(`Player ${playerName || userId} joined room ${room.roomId}`);
    return room;
  } else {
    // Create new room
    const roomId = generateRoomId();

    const player: Player = {
      id: userId,
      name: playerName,
      rank: userRank,
      color: "black", // First player is always black
    };

    const room: Room = {
      roomId,
      players: [player],
      rankSetType,
      status: "waiting",
      gameState: createInitialGameState(),
      createdAt: new Date(),
    };

    rooms.set(roomId, room);
    playerToRoom.set(userId, roomId);

    console.log(`New room ${roomId} created by ${playerName || userId}`);
    return room;
  }
}

/**
 * Create a new room with a generated ID
 */
export function createRoom(
  userId: string,
  playerName: string | undefined,
  userRank: number = 1000,
  rankSetType: RankSetType = "beginner"
): Room {
  const roomId = generateRoomId();
  console.log(
    `Creating new room with ID ${roomId} for player ${playerName || userId}`
  );

  const player: Player = {
    id: userId,
    name: playerName,
    rank: userRank,
    color: "black", // First player is always black
  };

  const room: Room = {
    roomId,
    players: [player],
    rankSetType,
    status: "waiting",
    gameState: createInitialGameState(),
    createdAt: new Date(),
  };

  rooms.set(roomId, room);
  playerToRoom.set(userId, roomId);

  console.log(
    `New room ${roomId} created by ${playerName || userId}. Total rooms: ${
      rooms.size
    }`
  );
  return room;
}

/**
 * Join an existing room by ID
 */
export function joinRoom(
  roomId: string,
  userId: string,
  playerName: string | undefined,
  userRank: number = 1000
): Room {
  console.log(
    `Attempting to join room ${roomId} with player ${playerName || userId}`
  );

  const room = rooms.get(roomId);

  if (!room) {
    console.error(
      `Room ${roomId} not found. Available rooms: ${Array.from(
        rooms.keys()
      ).join(", ")}`
    );
    throw new Error(`Room ${roomId} not found`);
  }

  if (room.status !== "waiting") {
    console.error(
      `Room ${roomId} is not in waiting status (current: ${room.status})`
    );
    throw new Error(`Room ${roomId} is not in waiting status`);
  }

  if (room.players.length >= 2) {
    console.error(
      `Room ${roomId} is already full (${room.players.length} players)`
    );
    throw new Error(`Room ${roomId} is already full`);
  }

  const player: Player = {
    id: userId,
    name: playerName,
    rank: userRank,
    color: "white", // Second player is always white
  };

  room.players.push(player);
  room.status = "active";
  playerToRoom.set(userId, roomId);

  console.log(`Player ${playerName || userId} joined room ${roomId}`);
  return room;
}

/**
 * Update game state with a player's move
 */
export function updateGameState(
  roomId: string,
  userId: string,
  gameState: GameState
): Room {
  const room = rooms.get(roomId);

  if (!room) {
    throw new Error(`Room ${roomId} not found`);
  }

  const player = room.players.find((p) => p.id === userId);

  if (!player) {
    throw new Error(`Player ${userId} not found in room ${roomId}`);
  }

  room.gameState = gameState;

  // Check if game is over and update room status
  if (gameState.isGameOver) {
    room.status = "finished";
  }

  return room;
}

/**
 * Get a room by ID
 */
export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

/**
 * Get a room by player ID
 */
export function getRoomByPlayerId(userId: string): Room | undefined {
  const roomId = playerToRoom.get(userId);
  if (!roomId) return undefined;
  return rooms.get(roomId);
}

/**
 * Remove a player from a room
 */
export function removePlayerFromRoom(userId: string): void {
  const roomId = playerToRoom.get(userId);
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  // Remove player from room
  room.players = room.players.filter((p) => p.id !== userId);

  // If room is empty, remove it
  if (room.players.length === 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} removed (empty)`);
  } else {
    // If game was active, mark as finished
    if (room.status === "active") {
      room.status = "finished";
      room.gameState.isGameOver = true;
      room.gameState.winner = room.players[0].color;
      console.log(`Game in room ${roomId} ended due to player disconnect`);
    }
  }

  // Remove player from mapping
  playerToRoom.delete(userId);
}

/**
 * Clean up old or inactive rooms
 */
export function cleanupRooms(): void {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  for (const [roomId, room] of rooms.entries()) {
    // Remove rooms older than 3 hours
    if (room.createdAt < threeHoursAgo) {
      // Remove player mappings
      for (const player of room.players) {
        playerToRoom.delete(player.id);
      }

      // Remove room
      rooms.delete(roomId);
      console.log(`Room ${roomId} removed (expired)`);
    }
  }
}
