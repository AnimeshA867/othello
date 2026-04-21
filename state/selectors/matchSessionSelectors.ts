import type { RootState } from "@/lib/redux/store";

export const selectMatchSession = (state: RootState) => state.matchSession;

export const selectAuthoritativeTurn = (state: RootState) =>
  state.matchSession.currentPlayer;

export const selectAuthoritativeBoard = (state: RootState) =>
  state.matchSession.board;

export const selectSyncStatus = (state: RootState) =>
  state.matchSession.syncStatus;

export const selectSessionRevision = (state: RootState) =>
  state.matchSession.revision;
