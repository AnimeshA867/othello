import type { Room, RankSetType, GameState } from "../../shared/gameLogic";
/**
 * Find a room with matching rank set type and the closest player rank,
 * or create a new room if none is found.
 */
export declare function findOrCreateRoom(userId: string, playerName: string | undefined, userRank: number, rankSetType: RankSetType): Promise<Room>;
/**
 * Create a new room with a generated ID
 */
export declare function createRoom(userId: string, playerName: string | undefined, userRank?: number, rankSetType?: RankSetType): Room;
/**
 * Join an existing room by ID
 */
export declare function joinRoom(roomId: string, userId: string, playerName: string | undefined, userRank?: number): Room;
/**
 * Update game state with a player's move
 */
export declare function updateGameState(roomId: string, userId: string, gameState: GameState): Room;
/**
 * Get a room by ID
 */
export declare function getRoom(roomId: string): Room | undefined;
/**
 * Get a room by player ID
 */
export declare function getRoomByPlayerId(userId: string): Room | undefined;
/**
 * Remove a player from a room
 */
export declare function removePlayerFromRoom(userId: string): void;
/**
 * Clean up old or inactive rooms
 */
export declare function cleanupRooms(): void;
