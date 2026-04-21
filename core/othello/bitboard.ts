import type {
  BitboardGameState,
  DiscColor,
  MatrixGameState,
  Position,
} from "./types";

const BOARD_MASK = (1n << 64n) - 1n;
const FILE_A = 0x0101010101010101n;
const FILE_H = 0x8080808080808080n;

const START_BLACK = (1n << 28n) | (1n << 35n);
const START_WHITE = (1n << 27n) | (1n << 36n);

function opposite(player: DiscColor): DiscColor {
  return player === "black" ? "white" : "black";
}

function shiftNorth(bits: bigint): bigint {
  return bits >> 8n;
}

function shiftSouth(bits: bigint): bigint {
  return (bits << 8n) & BOARD_MASK;
}

function shiftEast(bits: bigint): bigint {
  return ((bits & ~FILE_H) << 1n) & BOARD_MASK;
}

function shiftWest(bits: bigint): bigint {
  return (bits & ~FILE_A) >> 1n;
}

function shiftNorthEast(bits: bigint): bigint {
  return (bits & ~FILE_H) >> 7n;
}

function shiftNorthWest(bits: bigint): bigint {
  return (bits & ~FILE_A) >> 9n;
}

function shiftSouthEast(bits: bigint): bigint {
  return ((bits & ~FILE_H) << 9n) & BOARD_MASK;
}

function shiftSouthWest(bits: bigint): bigint {
  return ((bits & ~FILE_A) << 7n) & BOARD_MASK;
}

const SHIFTS = [
  shiftNorth,
  shiftSouth,
  shiftEast,
  shiftWest,
  shiftNorthEast,
  shiftNorthWest,
  shiftSouthEast,
  shiftSouthWest,
] as const;

function popcount(bits: bigint): number {
  let count = 0;
  let n = bits;
  while (n !== 0n) {
    n &= n - 1n;
    count++;
  }
  return count;
}

function indexToPosition(index: number): Position {
  return { row: Math.floor(index / 8), col: index % 8 };
}

function positionToIndex(row: number, col: number): number {
  return row * 8 + col;
}

function bitAt(index: number): bigint {
  return 1n << BigInt(index);
}

export function validMoveMaskFor(
  playerBits: bigint,
  opponentBits: bigint,
): bigint {
  const empty = ~(playerBits | opponentBits) & BOARD_MASK;
  let moves = 0n;

  for (const shift of SHIFTS) {
    let run = shift(playerBits) & opponentBits;
    for (let i = 0; i < 5; i++) {
      run |= shift(run) & opponentBits;
    }
    moves |= shift(run) & empty;
  }

  return moves & BOARD_MASK;
}

export function flipsForMove(
  moveBit: bigint,
  playerBits: bigint,
  opponentBits: bigint,
): bigint {
  let allFlips = 0n;

  for (const shift of SHIFTS) {
    let captured = 0n;
    let probe = shift(moveBit) & opponentBits;

    while (probe !== 0n) {
      captured |= probe;
      const stepped = shift(probe);
      if ((stepped & playerBits) !== 0n) {
        allFlips |= captured;
        break;
      }
      probe = stepped & opponentBits;
    }
  }

  return allFlips;
}

export function createInitialBitboardState(gameId: string): BitboardGameState {
  const validMask = validMoveMaskFor(START_BLACK, START_WHITE);
  return {
    blackBits: START_BLACK,
    whiteBits: START_WHITE,
    currentPlayer: "black",
    validMoveMask: validMask,
    lastMoveIndex: null,
    blackScore: 2,
    whiteScore: 2,
    isGameOver: false,
    winner: null,
    moveHistory: [],
    revision: 0,
    gameId,
    passCount: 0,
  };
}

export function applyBitboardMove(
  state: BitboardGameState,
  row: number,
  col: number,
): BitboardGameState {
  const moveIndex = positionToIndex(row, col);
  const moveBit = bitAt(moveIndex);

  if ((state.validMoveMask & moveBit) === 0n) {
    throw new Error("Invalid move");
  }

  const isBlackTurn = state.currentPlayer === "black";
  const playerBits = isBlackTurn ? state.blackBits : state.whiteBits;
  const opponentBits = isBlackTurn ? state.whiteBits : state.blackBits;

  const flips = flipsForMove(moveBit, playerBits, opponentBits);
  const nextPlayerBits = playerBits | moveBit | flips;
  const nextOpponentBits = opponentBits & ~flips;

  const blackBits = isBlackTurn ? nextPlayerBits : nextOpponentBits;
  const whiteBits = isBlackTurn ? nextOpponentBits : nextPlayerBits;

  const nextPlayer = opposite(state.currentPlayer);
  const nextPlayerOwned = nextPlayer === "black" ? blackBits : whiteBits;
  const nextOpponentOwned = nextPlayer === "black" ? whiteBits : blackBits;
  const nextPlayerMoves = validMoveMaskFor(nextPlayerOwned, nextOpponentOwned);

  let currentPlayer = nextPlayer;
  let validMoveMask = nextPlayerMoves;
  let passCount = 0;
  let isGameOver = false;

  if (nextPlayerMoves === 0n) {
    const retryOwned = state.currentPlayer === "black" ? blackBits : whiteBits;
    const retryOpponent =
      state.currentPlayer === "black" ? whiteBits : blackBits;
    const retryMoves = validMoveMaskFor(retryOwned, retryOpponent);

    if (retryMoves === 0n) {
      isGameOver = true;
      passCount = 2;
      validMoveMask = 0n;
    } else {
      currentPlayer = state.currentPlayer;
      validMoveMask = retryMoves;
      passCount = 1;
    }
  }

  const blackScore = popcount(blackBits);
  const whiteScore = popcount(whiteBits);

  let winner: DiscColor | "draw" | null = null;
  if (isGameOver) {
    if (blackScore > whiteScore) winner = "black";
    else if (whiteScore > blackScore) winner = "white";
    else winner = "draw";
  }

  return {
    blackBits,
    whiteBits,
    currentPlayer,
    validMoveMask,
    lastMoveIndex: moveIndex,
    blackScore,
    whiteScore,
    isGameOver,
    winner,
    moveHistory: [...state.moveHistory, moveIndex],
    revision: state.revision + 1,
    gameId: state.gameId,
    passCount,
  };
}

export function toMatrixState(state: BitboardGameState): MatrixGameState {
  const board: (DiscColor | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let i = 0; i < 64; i++) {
    const bit = bitAt(i);
    if ((state.blackBits & bit) !== 0n) {
      board[Math.floor(i / 8)][i % 8] = "black";
    } else if ((state.whiteBits & bit) !== 0n) {
      board[Math.floor(i / 8)][i % 8] = "white";
    }
  }

  const validMoves: Position[] = [];
  let mask = state.validMoveMask;
  while (mask !== 0n) {
    const lsb = mask & -mask;
    let index = 0;
    let tmp = lsb;
    while (tmp > 1n) {
      tmp >>= 1n;
      index++;
    }
    validMoves.push(indexToPosition(index));
    mask ^= lsb;
  }

  return {
    board,
    currentPlayer: state.currentPlayer,
    validMoves,
    lastMove:
      state.lastMoveIndex === null
        ? null
        : indexToPosition(state.lastMoveIndex),
    blackScore: state.blackScore,
    whiteScore: state.whiteScore,
    isGameOver: state.isGameOver,
    winner: state.winner,
    moveHistory: state.moveHistory.map(indexToPosition),
    drawOfferedBy: null,
    rematchOfferedBy: null,
    revision: state.revision,
    gameId: state.gameId,
    passCount: state.passCount,
  };
}

export function fromMatrixState(matrix: MatrixGameState): BitboardGameState {
  let blackBits = 0n;
  let whiteBits = 0n;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = matrix.board[row][col];
      if (!piece) continue;
      const bit = bitAt(positionToIndex(row, col));
      if (piece === "black") blackBits |= bit;
      else whiteBits |= bit;
    }
  }

  const playerBits = matrix.currentPlayer === "black" ? blackBits : whiteBits;
  const opponentBits = matrix.currentPlayer === "black" ? whiteBits : blackBits;

  return {
    blackBits,
    whiteBits,
    currentPlayer: matrix.currentPlayer,
    validMoveMask: validMoveMaskFor(playerBits, opponentBits),
    lastMoveIndex: matrix.lastMove
      ? positionToIndex(matrix.lastMove.row, matrix.lastMove.col)
      : null,
    blackScore: popcount(blackBits),
    whiteScore: popcount(whiteBits),
    isGameOver: matrix.isGameOver,
    winner: matrix.winner,
    moveHistory: matrix.moveHistory.map((m) => positionToIndex(m.row, m.col)),
    revision: matrix.revision,
    gameId: matrix.gameId,
    passCount: matrix.passCount,
  };
}
