import {
  applyBitboardMove,
  createInitialBitboardState,
  fromMatrixState,
  toMatrixState,
} from "./bitboard";
import type {
  MatrixGameState,
  MoveValidationResult,
  OthelloCommand,
  TransitionResult,
} from "./types";

function createGameId(): string {
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${Date.now().toString(36).toUpperCase()}-${randomPart}`;
}

function validateMoveCommand(
  state: MatrixGameState,
  command: Extract<OthelloCommand, { type: "make_move" }>,
): MoveValidationResult {
  if (state.isGameOver) {
    return { valid: false, reason: "GAME_OVER" };
  }

  if (command.expectedGameId && command.expectedGameId !== state.gameId) {
    return { valid: false, reason: "STALE_GAME" };
  }

  if (
    typeof command.expectedRevision === "number" &&
    command.expectedRevision !== state.revision
  ) {
    return { valid: false, reason: "STALE_REVISION" };
  }

  if (command.player !== state.currentPlayer) {
    return { valid: false, reason: "OUT_OF_TURN" };
  }

  const isListedMove = state.validMoves.some(
    (move) => move.row === command.row && move.col === command.col,
  );

  if (!isListedMove) {
    return { valid: false, reason: "INVALID_MOVE" };
  }

  return { valid: true };
}

export function createInitialState(): MatrixGameState {
  return toMatrixState(createInitialBitboardState(createGameId()));
}

export function restartState(): MatrixGameState {
  return createInitialState();
}

export function transition(
  state: MatrixGameState,
  command: OthelloCommand,
): TransitionResult {
  if (command.type === "restart") {
    const restarted = restartState();
    return {
      state: restarted,
      events: [{ type: "restarted", gameId: restarted.gameId }],
    };
  }

  const validation = validateMoveCommand(state, command);
  if (!validation.valid) {
    return { state, events: [], error: validation };
  }

  const next = toMatrixState(
    applyBitboardMove(fromMatrixState(state), command.row, command.col),
  );
  const events: TransitionResult["events"] = [
    {
      type: "move_applied",
      row: command.row,
      col: command.col,
      player: command.player,
    },
  ];

  if (!next.isGameOver && next.passCount === 1) {
    events.push({ type: "turn_passed", player: next.currentPlayer });
  }

  if (next.isGameOver) {
    events.push({
      type: "game_over",
      winner: next.winner,
      blackScore: next.blackScore,
      whiteScore: next.whiteScore,
      reason: "no_moves_both",
    });
  }

  return { state: next, events };
}
