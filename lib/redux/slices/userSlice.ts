import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  aiGames: number;
  aiWins: number;
  multiplayerGames: number;
  multiplayerWins: number;
  rankedGames: number;
  rankedWins: number;
  eloRating: number;
  peakEloRating: number;
  rank: string;
  currentWinStreak: number;
  longestWinStreak: number;
  averageGameTime: number;
  totalPiecesFlipped: number;
  perfectGames: number;
}

export interface UserState {
  stackId: string | null;
  email: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  gameStats: GameStats | null;
  isGuest: boolean;
  guestGamesPlayed: number;
  hasCompletedTutorial: boolean;
}

const initialState: UserState = {
  stackId: null,
  email: null,
  username: null,
  displayName: null,
  avatarUrl: null,
  bio: null,
  gameStats: null,
  isGuest: false,
  guestGamesPlayed: 0,
  hasCompletedTutorial: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        stackId: string;
        email: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        bio: string | null;
      }>
    ) => {
      state.stackId = action.payload.stackId;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.displayName = action.payload.displayName;
      state.avatarUrl = action.payload.avatarUrl;
      state.bio = action.payload.bio;
      state.isGuest = false;
    },
    setGameStats: (state, action: PayloadAction<GameStats>) => {
      state.gameStats = action.payload;
    },
    updateElo: (
      state,
      action: PayloadAction<{ change: number; newElo: number }>
    ) => {
      if (state.gameStats) {
        state.gameStats.eloRating = action.payload.newElo;
        if (action.payload.newElo > state.gameStats.peakEloRating) {
          state.gameStats.peakEloRating = action.payload.newElo;
        }
      }
    },
    incrementGameStats: (
      state,
      action: PayloadAction<{
        won: boolean;
        draw: boolean;
        mode: "ai" | "friend" | "ranked";
      }>
    ) => {
      if (state.gameStats) {
        state.gameStats.totalGames += 1;

        if (action.payload.won) {
          state.gameStats.wins += 1;
          state.gameStats.currentWinStreak += 1;
          if (
            state.gameStats.currentWinStreak > state.gameStats.longestWinStreak
          ) {
            state.gameStats.longestWinStreak = state.gameStats.currentWinStreak;
          }
        } else if (action.payload.draw) {
          state.gameStats.draws += 1;
        } else {
          state.gameStats.losses += 1;
          state.gameStats.currentWinStreak = 0;
        }

        // Mode-specific updates
        if (action.payload.mode === "ai") {
          state.gameStats.aiGames += 1;
          if (action.payload.won) state.gameStats.aiWins += 1;
        } else if (action.payload.mode === "friend") {
          state.gameStats.multiplayerGames += 1;
          if (action.payload.won) state.gameStats.multiplayerWins += 1;
        } else if (action.payload.mode === "ranked") {
          state.gameStats.rankedGames += 1;
          if (action.payload.won) state.gameStats.rankedWins += 1;
        }
      }
    },
    setGuest: (state) => {
      state.isGuest = true;
      const gamesPlayed = parseInt(
        typeof window !== "undefined"
          ? localStorage.getItem("guestGamesPlayed") || "0"
          : "0"
      );
      state.guestGamesPlayed = gamesPlayed;
    },
    incrementGuestGames: (state) => {
      state.guestGamesPlayed += 1;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "guestGamesPlayed",
          state.guestGamesPlayed.toString()
        );
      }
    },
    clearUser: (state) => {
      return initialState;
    },
    completeTutorial: (state) => {
      state.hasCompletedTutorial = true;
      // Also save to localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("tutorialCompleted", "true");
      }
    },
  },
});

export const {
  setUser,
  setGameStats,
  updateElo,
  incrementGameStats,
  setGuest,
  incrementGuestGames,
  clearUser,
  completeTutorial,
} = userSlice.actions;

export default userSlice.reducer;
