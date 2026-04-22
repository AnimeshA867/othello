import { describe, expect, it } from "vitest";
import {
  acceptDraw,
  acceptRematch,
  applyMoveIntent,
  offerDraw,
  offerRematch,
  resignGame,
  resolveChatContext,
  restartSession,
} from "./sessionService";
import {
  createRoom,
  joinRoom,
  removePlayerFromRoom,
} from "../../server/controllers/roomController";

function setupRoom() {
  const blackId = `black-${Math.random().toString(36).slice(2, 10)}`;
  const whiteId = `white-${Math.random().toString(36).slice(2, 10)}`;

  const room = createRoom(blackId, "Black", 1200, "beginner");
  joinRoom(room.roomId, whiteId, "White", 1200);

  const teardown = () => {
    removePlayerFromRoom(blackId);
    removePlayerFromRoom(whiteId);
  };

  return { blackId, whiteId, teardown };
}

describe("sessionService", () => {
  it("rejects stale revision move intents", () => {
    const { blackId, teardown } = setupRoom();

    try {
      const result = applyMoveIntent({
        playerId: blackId,
        row: 2,
        col: 3,
        expectedRevision: 99,
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("STALE_REVISION");
    } finally {
      teardown();
    }
  });

  it("invalidates old game id after restart", () => {
    const { blackId, teardown } = setupRoom();

    try {
      const firstMove = applyMoveIntent({
        playerId: blackId,
        row: 2,
        col: 3,
      });
      expect(firstMove.ok).toBe(true);
      if (!firstMove.ok) return;

      const previousGameId = firstMove.data.gameState.gameId;
      const restarted = restartSession(blackId);
      expect(restarted.ok).toBe(true);

      const staleMove = applyMoveIntent({
        playerId: blackId,
        row: 2,
        col: 3,
        expectedGameId: previousGameId,
      });

      expect(staleMove.ok).toBe(false);
      if (staleMove.ok) return;
      expect(staleMove.code).toBe("STALE_GAME");
    } finally {
      teardown();
    }
  });

  it("handles draw offer and acceptance lifecycle", () => {
    const { blackId, whiteId, teardown } = setupRoom();

    try {
      const offered = offerDraw(blackId);
      expect(offered.ok).toBe(true);

      const accepted = acceptDraw(whiteId);
      expect(accepted.ok).toBe(true);
      if (!accepted.ok) return;

      expect(accepted.data.gameState.isGameOver).toBe(true);
      expect(accepted.data.gameState.winner).toBe("draw");
    } finally {
      teardown();
    }
  });

  it("handles rematch offer and acceptance lifecycle", () => {
    const { blackId, whiteId, teardown } = setupRoom();

    try {
      const offered = offerRematch(blackId);
      expect(offered.ok).toBe(true);

      const accepted = acceptRematch(whiteId);
      expect(accepted.ok).toBe(true);
      if (!accepted.ok) return;

      expect(accepted.data.gameState.isGameOver).toBe(false);
      expect(accepted.data.gameState.blackScore).toBe(2);
      expect(accepted.data.gameState.whiteScore).toBe(2);
      expect(accepted.data.gameState.currentPlayer).toBe("black");
    } finally {
      teardown();
    }
  });

  it("marks game over correctly on resign", () => {
    const { blackId, teardown } = setupRoom();

    try {
      const resigned = resignGame(blackId);
      expect(resigned.ok).toBe(true);
      if (!resigned.ok) return;

      expect(resigned.data.playerColor).toBe("black");
      expect(resigned.data.winner).toBe("white");
      expect(resigned.data.gameState.isGameOver).toBe(true);
      expect(resigned.data.gameState.winner).toBe("white");
    } finally {
      teardown();
    }
  });

  it("resolves chat context with fallback sender name", () => {
    const { blackId, teardown } = setupRoom();

    try {
      const resolved = resolveChatContext(blackId);
      expect(resolved.ok).toBe(true);
      if (!resolved.ok) return;

      expect(resolved.data.senderColor).toBe("black");
      expect(resolved.data.senderName).toBe("Black");
    } finally {
      teardown();
    }
  });
});
