export interface Player {
    id: string;
    name?: string;
    rank: number;
    color: "black" | "white";
}
export interface Position {
    row: number;
    col: number;
}
export interface GameState {
    board: ("black" | "white" | null)[][];
    currentPlayer: "black" | "white";
    validMoves: Position[];
    lastMove: Position | null;
    blackScore: number;
    whiteScore: number;
    isGameOver: boolean;
    winner: "black" | "white" | "draw" | null;
    drawOfferedBy?: "black" | "white" | null;
    moveHistory: Position[];
}
export interface Room {
    roomId: string;
    players: Player[];
    rankSetType: "beginner" | "intermediate" | "advanced" | "custom";
    status: "waiting" | "active" | "finished";
    gameState: GameState;
    createdAt: Date;
}
export type RankSetType = "beginner" | "intermediate" | "advanced" | "custom";
export declare const rankRanges: {
    beginner: {
        min: number;
        max: number;
    };
    intermediate: {
        min: number;
        max: number;
    };
    advanced: {
        min: number;
        max: number;
    };
};
export declare function isValidRankSetType(type: string): type is RankSetType;
export declare function generateRoomId(): string;
export declare function createInitialGameState(): GameState;
export declare function getValidMoves(board: ("black" | "white" | null)[][], player: "black" | "white"): Position[];
export declare function makeMove(gameState: GameState, row: number, col: number): GameState;
export declare function isValidMove(gameState: GameState, row: number, col: number): boolean;
