import { describe, expect, it } from "vitest";
import reducer, {
  applyAuthoritativeSnapshot,
  markRestarting,
  markStale,
  markTurnPassed,
  resetMatchSession,
  type MatchSessionState,
} from "./matchSessionSlice";

const baseState: MatchSessionState = {
  sessionId: null,
  revision: 0,
  currentPlayer: "black",
  phase: "idle",
  passCount: 0,
  winner: null,
  board: Array(8)
    .fill(null)
    .map(() => Array(8).fill(null)),
  validMoves: [],
  syncStatus: "synced",
};

describe("matchSessionSlice", () => {
  it("applies authoritative snapshots", () => {
    const next = reducer(
      baseState,
      applyAuthoritativeSnapshot({
        gameId: "game-1",
        revision: 3,
        currentPlayer: "white",
        passCount: 1,
        isGameOver: false,
      }),
    );

    expect(next.sessionId).toBe("game-1");
    expect(next.revision).toBe(3);
    expect(next.currentPlayer).toBe("white");
    expect(next.passCount).toBe(1);
    expect(next.phase).toBe("active_turn");
  });

  it("marks pass, stale, and restarting states", () => {
    const passed = reducer(baseState, markTurnPassed());
    expect(passed.phase).toBe("pass_pending");

    const stale = reducer(passed, markStale());
    expect(stale.syncStatus).toBe("stale");

    const restarting = reducer(stale, markRestarting());
    expect(restarting.phase).toBe("restarting");
  });

  it("resets state to initial values", () => {
    const changed = reducer(
      baseState,
      applyAuthoritativeSnapshot({ gameId: "game-9", revision: 9 }),
    );
    const reset = reducer(changed, resetMatchSession());

    expect(reset.sessionId).toBeNull();
    expect(reset.revision).toBe(0);
    expect(reset.phase).toBe("idle");
  });
});
