type PlayerColor = "black" | "white";

export type ClientIntent =
  | { type: "join_room"; roomId: string; playerName?: string }
  | { type: "create_room"; playerName?: string }
  | {
      type: "join_random";
      rankSetType: string;
      rank: number;
      playerName?: string;
    }
  | { type: "get_room_info"; roomId: string }
  | {
      type: "make_move";
      row: number;
      col: number;
      expectedRevision?: number;
      expectedGameId?: string;
    }
  | { type: "restart_game" }
  | { type: "resign_game" }
  | { type: "offer_draw" }
  | { type: "accept_draw" }
  | { type: "decline_draw" }
  | { type: "offer_rematch" }
  | { type: "accept_rematch" }
  | { type: "decline_rematch" }
  | { type: "send_chat_message"; message: string; senderName?: string };

export type ServerEvent =
  | { type: "room_created"; roomId: string; player: PlayerColor }
  | { type: "waiting_for_player" }
  | {
      type: "player_joined";
      player: PlayerColor;
      playerName?: string;
      rank?: number;
    }
  | {
      type: "game_ready";
      roomId: string;
      players: { black: string; white: string };
    }
  | {
      type: "room_info";
      roomId: string;
      status: "waiting" | "active" | "finished";
      players: Array<{
        id: string;
        name?: string;
        color: PlayerColor;
        rank: number;
      }>;
      rankSetType: "beginner" | "intermediate" | "advanced" | "custom";
      createdAt: Date;
    }
  | { type: "game_state"; gameState: Record<string, unknown> }
  | { type: "move_made"; row: number; col: number; player: PlayerColor }
  | { type: "turn_passed"; player: PlayerColor }
  | {
      type: "game_over";
      winner: PlayerColor | "draw" | null;
      blackScore?: number;
      whiteScore?: number;
      reason?: string;
    }
  | { type: "game_restarted"; gameId?: string; revision?: number }
  | { type: "player_resigned"; player: PlayerColor }
  | { type: "draw_offered"; player: PlayerColor }
  | { type: "draw_declined"; player: PlayerColor }
  | { type: "rematch_offered"; player: PlayerColor }
  | { type: "rematch_declined"; player: PlayerColor }
  | {
      type: "chat_message";
      message: string;
      sender: PlayerColor;
      senderName: string;
      timestamp: number;
    }
  | { type: "player_disconnected"; player: PlayerColor; name?: string }
  | {
      type: "stale_state";
      reason: "STALE_REVISION" | "STALE_GAME";
      expectedRevision?: number;
      expectedGameId?: string;
      gameState: Record<string, unknown>;
    }
  | { type: "error"; message: string }
  | { type: "room_full" }
  | { type: "invalid_move" };
