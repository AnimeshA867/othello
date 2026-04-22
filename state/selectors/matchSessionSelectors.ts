import type { RootState } from "@/lib/redux/store";

export const selectMatchSession = (state: RootState) => state.matchSession;

export const selectAuthoritativeTurn = (state: RootState) =>
  state.matchSession.currentPlayer;

export const selectAuthoritativeBoard = (state: RootState) =>
  state.matchSession.board;

export const selectAuthoritativeScores = (state: RootState) => ({
  blackScore: state.matchSession.blackScore,
  whiteScore: state.matchSession.whiteScore,
});

export const selectAuthoritativeValidMoves = (state: RootState) =>
  state.matchSession.validMoves;

export const selectAuthoritativeLastMove = (state: RootState) =>
  state.matchSession.lastMove;

export const selectSyncStatus = (state: RootState) =>
  state.matchSession.syncStatus;

export const selectSessionRevision = (state: RootState) =>
  state.matchSession.revision;
