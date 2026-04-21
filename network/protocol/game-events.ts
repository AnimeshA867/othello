export type ClientIntent =
  | {
      type: "make_move";
      row: number;
      col: number;
      expectedRevision?: number;
      expectedGameId?: string;
    }
  | { type: "restart_game" }
  | { type: "offer_draw" }
  | { type: "accept_draw" }
  | { type: "decline_draw" }
  | { type: "offer_rematch" }
  | { type: "accept_rematch" }
  | { type: "decline_rematch" };

export type ServerEvent =
  | { type: "game_state"; gameState: unknown }
  | { type: "move_made"; row: number; col: number; player: "black" | "white" }
  | { type: "turn_passed"; player: "black" | "white" }
  | {
      type: "game_over";
      winner: "black" | "white" | "draw" | null;
      blackScore?: number;
      whiteScore?: number;
      reason?: string;
    }
  | {
      type: "stale_state";
      reason: "STALE_REVISION" | "STALE_GAME";
      expectedRevision?: number;
      expectedGameId?: string;
      gameState: unknown;
    }
  | { type: "game_restarted"; gameId?: string; revision?: number };
