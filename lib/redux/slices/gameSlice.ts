import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameState {
  // Game mode
  mode: "ai" | "multiplayer" | null;
  gameType: "ai" | "friend" | "ranked" | null;

  // Game settings
  difficulty: "easy" | "medium" | "hard";
  botName: string | null;

  // ELO tracking
  eloChange: number | null;

  // Matchmaking
  isMatchmaking: boolean;
  matchmakingTimeout: number | null;

  // Opponent info
  opponentName: string | null;
  opponentElo: number | null;

  // Game timing
  gameStartTime: number | null;

  // Game result tracking
  gameRecorded: boolean;

  // Draw system
  drawOfferedByPlayer: boolean;
  drawOfferedByOpponent: boolean;
}

const initialState: GameState = {
  mode: null,
  gameType: null,
  difficulty: "medium",
  botName: null,
  eloChange: null,
  isMatchmaking: false,
  matchmakingTimeout: null,
  opponentName: null,
  opponentElo: null,
  gameStartTime: null,
  gameRecorded: false,
  drawOfferedByPlayer: false,
  drawOfferedByOpponent: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameMode: (state, action: PayloadAction<"ai" | "multiplayer">) => {
      state.mode = action.payload;
    },
    setGameType: (state, action: PayloadAction<"ai" | "friend" | "ranked">) => {
      state.gameType = action.payload;
    },
    setDifficulty: (
      state,
      action: PayloadAction<"easy" | "medium" | "hard">
    ) => {
      state.difficulty = action.payload;
    },
    setBotName: (state, action: PayloadAction<string>) => {
      state.botName = action.payload;
    },
    setEloChange: (state, action: PayloadAction<number | null>) => {
      state.eloChange = action.payload;
    },
    startMatchmaking: (state) => {
      state.isMatchmaking = true;
    },
    stopMatchmaking: (state) => {
      state.isMatchmaking = false;
      state.matchmakingTimeout = null;
    },
    setMatchmakingTimeout: (state, action: PayloadAction<number>) => {
      state.matchmakingTimeout = action.payload;
    },
    setOpponent: (
      state,
      action: PayloadAction<{ name: string; elo?: number }>
    ) => {
      state.opponentName = action.payload.name;
      state.opponentElo = action.payload.elo || null;
    },
    startGame: (state) => {
      state.gameStartTime = Date.now();
      state.gameRecorded = false;
      state.drawOfferedByPlayer = false;
      state.drawOfferedByOpponent = false;
    },
    setGameRecorded: (state, action: PayloadAction<boolean>) => {
      state.gameRecorded = action.payload;
    },
    offerDraw: (state) => {
      state.drawOfferedByPlayer = true;
    },
    receiveDrawOffer: (state) => {
      state.drawOfferedByOpponent = true;
    },
    cancelDrawOffer: (state) => {
      state.drawOfferedByPlayer = false;
      state.drawOfferedByOpponent = false;
    },
    resetGame: (state) => {
      return {
        ...initialState,
        gameType: state.gameType, // Preserve game type
        difficulty: state.difficulty, // Preserve difficulty
      };
    },
  },
});

export const {
  setGameMode,
  setGameType,
  setDifficulty,
  setBotName,
  setEloChange,
  startMatchmaking,
  stopMatchmaking,
  setMatchmakingTimeout,
  setOpponent,
  startGame,
  setGameRecorded,
  offerDraw,
  receiveDrawOffer,
  cancelDrawOffer,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
