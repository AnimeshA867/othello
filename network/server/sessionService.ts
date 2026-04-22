import { transition } from "../../core/othello/stateMachine";
import type { MatrixGameState } from "../../core/othello/types";
import { createInitialGameState, type GameState } from "../../shared/gameLogic";
import {
  getRoomByPlayerId,
  removePlayerFromRoom,
  updateGameState,
} from "../../server/controllers/roomController";

type SessionErrorCode =
  | "PLAYER_NOT_FOUND"
  | "ROOM_NOT_FOUND"
  | "NOT_IN_ROOM"
  | "NOT_YOUR_TURN"
  | "INVALID_MOVE"
  | "STALE_REVISION"
  | "STALE_GAME"
  | "GAME_OVER";

interface SessionError {
  ok: false;
  code: SessionErrorCode;
  roomState?: GameState;
  expectedRevision?: number;
  expectedGameId?: string;
}

interface SessionSuccess<T> {
  ok: true;
  data: T;
}

type SessionResult<T> = SessionSuccess<T> | SessionError;

export interface MoveIntent {
  playerId: string;
  row: number;
  col: number;
  expectedRevision?: number;
  expectedGameId?: string;
}

export interface MoveOutcome {
  roomId: string;
  playerColor: "black" | "white";
  playerName?: string;
  row: number;
  col: number;
  gameState: GameState;
  events: Array<{ type: string; [key: string]: unknown }>;
}

export interface RestartOutcome {
  roomId: string;
  gameState: GameState;
  playerName?: string;
}

export interface DisconnectOutcome {
  roomId: string;
  playerColor: "black" | "white";
  playerName?: string;
  winner: "black" | "white" | null;
}

export interface DrawOfferOutcome {
  roomId: string;
  playerColor: "black" | "white";
}

export interface DrawResolutionOutcome {
  roomId: string;
  playerColor: "black" | "white";
  gameState: GameState;
}

export interface RematchOfferOutcome {
  roomId: string;
  playerColor: "black" | "white";
}

export interface RematchAcceptedOutcome {
  roomId: string;
  gameState: GameState;
  players: {
    black: string;
    white: string;
  };
}

export interface RematchDeclinedOutcome {
  roomId: string;
  playerColor: "black" | "white";
}

export interface ResignOutcome {
  roomId: string;
  playerColor: "black" | "white";
  winner: "black" | "white" | null;
  gameState: GameState;
}

export interface ChatMessageContext {
  roomId: string;
  senderColor: "black" | "white";
  senderName: string;
}

function getPlayerContext(playerId: string): SessionResult<{
  room: NonNullable<ReturnType<typeof getRoomByPlayerId>>;
  player: {
    id: string;
    color: "black" | "white";
    name?: string;
  };
}> {
  if (!playerId) {
    return { ok: false, code: "PLAYER_NOT_FOUND" };
  }

  const room = getRoomByPlayerId(playerId);
  if (!room) {
    return { ok: false, code: "ROOM_NOT_FOUND" };
  }

  const player = room.players.find((candidate) => candidate.id === playerId);
  if (!player) {
    return { ok: false, code: "NOT_IN_ROOM" };
  }

  return {
    ok: true,
    data: {
      room,
      player: {
        id: player.id,
        color: player.color,
        name: player.name,
      },
    },
  };
}

function toMatrixGameState(state: GameState): MatrixGameState {
  return {
    board: state.board,
    currentPlayer: state.currentPlayer,
    validMoves: state.validMoves,
    lastMove: state.lastMove,
    blackScore: state.blackScore,
    whiteScore: state.whiteScore,
    isGameOver: state.isGameOver,
    winner: state.winner,
    moveHistory: state.moveHistory,
    drawOfferedBy: state.drawOfferedBy ?? null,
    rematchOfferedBy: state.rematchOfferedBy ?? null,
    revision: state.revision ?? 0,
    gameId: state.gameId ?? "UNKNOWN",
    passCount: state.passCount ?? 0,
  };
}

export function applyMoveIntent(
  intent: MoveIntent,
): SessionResult<MoveOutcome> {
  const context = getPlayerContext(intent.playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;

  if (player.color !== room.gameState.currentPlayer) {
    return {
      ok: false,
      code: "NOT_YOUR_TURN",
      roomState: room.gameState,
      expectedRevision: room.gameState.revision,
      expectedGameId: room.gameState.gameId,
    };
  }

  const result = transition(toMatrixGameState(room.gameState), {
    type: "make_move",
    player: player.color,
    row: intent.row,
    col: intent.col,
    expectedRevision: intent.expectedRevision,
    expectedGameId: intent.expectedGameId,
  });

  if (result.error) {
    const mapped: SessionErrorCode =
      result.error.reason === "STALE_REVISION"
        ? "STALE_REVISION"
        : result.error.reason === "STALE_GAME"
          ? "STALE_GAME"
          : result.error.reason === "GAME_OVER"
            ? "GAME_OVER"
            : "INVALID_MOVE";

    return {
      ok: false,
      code: mapped,
      roomState: room.gameState,
      expectedRevision: room.gameState.revision,
      expectedGameId: room.gameState.gameId,
    };
  }

  const gameState: GameState = {
    ...result.state,
    drawOfferedBy: room.gameState.drawOfferedBy ?? null,
    rematchOfferedBy: room.gameState.rematchOfferedBy ?? null,
  };

  updateGameState(room.roomId, player.id, gameState);

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      playerColor: player.color,
      playerName: player.name,
      row: intent.row,
      col: intent.col,
      gameState,
      events: result.events,
    },
  };
}

export function restartSession(
  playerId: string,
): SessionResult<RestartOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;

  room.gameState = createInitialGameState();
  room.gameState.drawOfferedBy = null;
  room.gameState.rematchOfferedBy = null;
  room.status = room.players.length === 2 ? "active" : "waiting";

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      gameState: room.gameState,
      playerName: player.name,
    },
  };
}

export function handlePlayerDisconnect(
  playerId: string,
): SessionResult<DisconnectOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;

  let winner: "black" | "white" | null = null;

  if (room.status === "active") {
    const otherPlayer = room.players.find(
      (candidate) => candidate.id !== playerId,
    );
    if (otherPlayer) {
      winner = otherPlayer.color;
      room.gameState.isGameOver = true;
      room.gameState.winner = otherPlayer.color;
    }
  }

  removePlayerFromRoom(playerId);

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      playerColor: player.color,
      playerName: player.name,
      winner,
    },
  };
}

export function offerDraw(playerId: string): SessionResult<DrawOfferOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;
  room.gameState = {
    ...room.gameState,
    drawOfferedBy: player.color,
  };

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      playerColor: player.color,
    },
  };
}

export function acceptDraw(
  playerId: string,
): SessionResult<DrawResolutionOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;

  if (
    !room.gameState.drawOfferedBy ||
    room.gameState.drawOfferedBy === player.color
  ) {
    return { ok: false, code: "INVALID_MOVE", roomState: room.gameState };
  }

  room.gameState = {
    ...room.gameState,
    isGameOver: true,
    winner: "draw",
    drawOfferedBy: null,
  };
  room.status = "finished";

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      playerColor: player.color,
      gameState: room.gameState,
    },
  };
}

export function declineDraw(
  playerId: string,
): SessionResult<DrawResolutionOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;

  room.gameState = {
    ...room.gameState,
    drawOfferedBy: null,
  };

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      playerColor: player.color,
      gameState: room.gameState,
    },
  };
}

export function offerRematch(
  playerId: string,
): SessionResult<RematchOfferOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;
  room.gameState = {
    ...room.gameState,
    rematchOfferedBy: player.color,
  };

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      playerColor: player.color,
    },
  };
}

export function acceptRematch(
  playerId: string,
): SessionResult<RematchAcceptedOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;

  if (
    !room.gameState.rematchOfferedBy ||
    room.gameState.rematchOfferedBy === player.color
  ) {
    return { ok: false, code: "INVALID_MOVE", roomState: room.gameState };
  }

  room.gameState = createInitialGameState();
  room.status = room.players.length === 2 ? "active" : "waiting";

  const blackPlayer = room.players.find(
    (candidate) => candidate.color === "black",
  );
  const whitePlayer = room.players.find(
    (candidate) => candidate.color === "white",
  );

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      gameState: room.gameState,
      players: {
        black: blackPlayer?.name || "Player 1",
        white: whitePlayer?.name || "Player 2",
      },
    },
  };
}

export function declineRematch(
  playerId: string,
): SessionResult<RematchDeclinedOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;
  room.gameState = {
    ...room.gameState,
    rematchOfferedBy: null,
  };

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      playerColor: player.color,
    },
  };
}

export function resignGame(playerId: string): SessionResult<ResignOutcome> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;
  const winner = player.color === "black" ? "white" : "black";

  room.gameState = {
    ...room.gameState,
    isGameOver: true,
    winner,
  };
  room.status = "finished";

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      playerColor: player.color,
      winner,
      gameState: room.gameState,
    },
  };
}

export function resolveChatContext(
  playerId: string,
  senderName?: string,
): SessionResult<ChatMessageContext> {
  const context = getPlayerContext(playerId);
  if (!context.ok) {
    return context;
  }

  const { room, player } = context.data;

  return {
    ok: true,
    data: {
      roomId: room.roomId,
      senderColor: player.color,
      senderName: senderName || player.name || "Anonymous",
    },
  };
}
