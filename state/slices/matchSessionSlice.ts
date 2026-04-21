import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SessionPhase =
  | "idle"
  | "waiting_for_players"
  | "active_turn"
  | "pass_pending"
  | "game_over"
  | "restarting";

export interface MatchSessionState {
  sessionId: string | null;
  revision: number;
  currentPlayer: "black" | "white";
  phase: SessionPhase;
  passCount: number;
  winner: "black" | "white" | "draw" | null;
  board: ("black" | "white" | null)[][];
  validMoves: Array<{ row: number; col: number }>;
  syncStatus: "synced" | "stale";
}

const emptyBoard = Array(8)
  .fill(null)
  .map(() => Array(8).fill(null)) as ("black" | "white" | null)[][];

const initialState: MatchSessionState = {
  sessionId: null,
  revision: 0,
  currentPlayer: "black",
  phase: "idle",
  passCount: 0,
  winner: null,
  board: emptyBoard,
  validMoves: [],
  syncStatus: "synced",
};

interface AuthoritativeSnapshot {
  gameId?: string;
  revision?: number;
  currentPlayer?: "black" | "white";
  passCount?: number;
  winner?: "black" | "white" | "draw" | null;
  board?: ("black" | "white" | null)[][];
  validMoves?: Array<{ row: number; col: number }>;
  isGameOver?: boolean;
}

const matchSessionSlice = createSlice({
  name: "matchSession",
  initialState,
  reducers: {
    applyAuthoritativeSnapshot: (
      state,
      action: PayloadAction<AuthoritativeSnapshot>,
    ) => {
      const payload = action.payload;
      state.sessionId = payload.gameId ?? state.sessionId;
      state.revision = payload.revision ?? state.revision;
      state.currentPlayer = payload.currentPlayer ?? state.currentPlayer;
      state.passCount = payload.passCount ?? state.passCount;
      state.winner = payload.winner ?? state.winner;
      state.board = payload.board ?? state.board;
      state.validMoves = payload.validMoves ?? state.validMoves;
      state.phase = payload.isGameOver
        ? "game_over"
        : state.phase === "idle"
          ? "active_turn"
          : state.phase;
      state.syncStatus = "synced";
    },
    markTurnPassed: (state) => {
      state.phase = "pass_pending";
      state.passCount = 1;
    },
    markRestarting: (state) => {
      state.phase = "restarting";
    },
    markStale: (state) => {
      state.syncStatus = "stale";
    },
    resetMatchSession: () => initialState,
  },
});

export const {
  applyAuthoritativeSnapshot,
  markTurnPassed,
  markRestarting,
  markStale,
  resetMatchSession,
} = matchSessionSlice.actions;

export default matchSessionSlice.reducer;
