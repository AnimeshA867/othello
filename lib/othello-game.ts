export type Player = "black" | "white" | null;
export type GameMode = "ai" | "friend";
export type Difficulty = "easy" | "medium" | "hard";

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Player[][];
  currentPlayer: Player;
  gameMode: GameMode;
  difficulty?: Difficulty;
  isGameOver: boolean;
  winner: Player;
  blackScore: number;
  whiteScore: number;
  validMoves: Position[];
  lastMove: Position | null;
  moveHistory: Array<{
    player: Player;
    position: Position;
    flippedPieces: Position[];
    timestamp: number;
  }>;
  canUndo: boolean;
  undosRemaining: number;
}

export class OthelloGame {
  private board: Player[][];
  private currentPlayer: Player;
  private gameMode: GameMode;
  private difficulty: Difficulty;
  private moveHistory: Array<{
    player: Player;
    position: Position;
    flippedPieces: Position[];
    timestamp: number;
  }>;
  private undosUsed: number;

  constructor(gameMode: GameMode = "ai", difficulty: Difficulty = "medium") {
    this.gameMode = gameMode;
    this.difficulty = difficulty;
    this.board = this.initializeBoard();
    this.currentPlayer = "black"; // Black always starts
    this.moveHistory = [];
    this.undosUsed = 0;
  }

  private initializeBoard(): Player[][] {
    const board: Player[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Initial setup - center 4 pieces
    board[3][3] = "white";
    board[3][4] = "black";
    board[4][3] = "black";
    board[4][4] = "white";

    return board;
  }

  public getGameState(): GameState {
    const validMoves = this.getValidMoves(this.currentPlayer);
    const scores = this.calculateScores();
    const isGameOver = this.isGameOver();
    const winner = this.getWinner();
    const lastMove =
      this.moveHistory.length > 0
        ? this.moveHistory[this.moveHistory.length - 1].position
        : null;

    return {
      board: this.board.map((row) => [...row]),
      currentPlayer: this.currentPlayer,
      gameMode: this.gameMode,
      difficulty: this.difficulty,
      isGameOver,
      winner,
      blackScore: scores.black,
      whiteScore: scores.white,
      validMoves,
      lastMove,
      moveHistory: [...this.moveHistory],
      canUndo: this.canUndo(),
      undosRemaining: this.getUndosRemaining(),
    };
  }

  public makeMove(row: number, col: number): boolean {
    if (!this.isValidMove(row, col, this.currentPlayer)) {
      return false;
    }

    const flippedPieces = this.getFlippedPieces(row, col, this.currentPlayer);
    const movePlayer = this.currentPlayer;

    // Add to move history
    this.moveHistory.push({
      player: movePlayer,
      position: { row, col },
      flippedPieces: [...flippedPieces],
      timestamp: Date.now(),
    });

    // Place the piece
    this.board[row][col] = this.currentPlayer;

    // Flip the pieces
    flippedPieces.forEach(({ row: r, col: c }) => {
      this.board[r][c] = this.currentPlayer;
    });

    // Switch players
    this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";

    // If the next player has no valid moves, switch back
    if (this.getValidMoves(this.currentPlayer).length === 0) {
      this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
    }

    return true;
  }

  public isValidMove(row: number, col: number, player: Player): boolean {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;
    if (this.board[row][col] !== null) return false;
    if (!player) return false;

    return this.getFlippedPieces(row, col, player).length > 0;
  }

  public getValidMoves(player: Player): Position[] {
    const validMoves: Position[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.isValidMove(row, col, player)) {
          validMoves.push({ row, col });
        }
      }
    }

    return validMoves;
  }

  private getFlippedPieces(
    row: number,
    col: number,
    player: Player
  ): Position[] {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    const flippedPieces: Position[] = [];
    const opponent = player === "black" ? "white" : "black";

    for (const [dr, dc] of directions) {
      const piecesToFlip: Position[] = [];
      let r = row + dr;
      let c = col + dc;

      // Look for opponent pieces in this direction
      while (
        r >= 0 &&
        r < 8 &&
        c >= 0 &&
        c < 8 &&
        this.board[r][c] === opponent
      ) {
        piecesToFlip.push({ row: r, col: c });
        r += dr;
        c += dc;
      }

      // If we found a player piece at the end, all pieces in between can be flipped
      if (
        r >= 0 &&
        r < 8 &&
        c >= 0 &&
        c < 8 &&
        this.board[r][c] === player &&
        piecesToFlip.length > 0
      ) {
        flippedPieces.push(...piecesToFlip);
      }
    }

    return flippedPieces;
  }

  private calculateScores(): { black: number; white: number } {
    let black = 0;
    let white = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === "black") black++;
        else if (this.board[row][col] === "white") white++;
      }
    }

    return { black, white };
  }

  private isGameOver(): boolean {
    const blackMoves = this.getValidMoves("black");
    const whiteMoves = this.getValidMoves("white");

    return blackMoves.length === 0 && whiteMoves.length === 0;
  }

  private getWinner(): Player {
    if (!this.isGameOver()) return null;

    const scores = this.calculateScores();
    if (scores.black > scores.white) return "black";
    if (scores.white > scores.black) return "white";
    return null; // Tie
  }

  // AI Methods
  public getBestMove(): Position | null {
    const validMoves = this.getValidMoves(this.currentPlayer);
    if (validMoves.length === 0) return null;

    switch (this.difficulty) {
      case "easy":
        return this.getRandomMove(validMoves);
      case "medium":
        return this.getMinimaxMove(3);
      case "hard":
        return this.getMinimaxMove(6);
      default:
        return this.getRandomMove(validMoves);
    }
  }

  private getRandomMove(validMoves: Position[]): Position {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  private getMinimaxMove(depth: number): Position | null {
    const validMoves = this.getValidMoves(this.currentPlayer);
    if (validMoves.length === 0) return null;

    let bestMove = validMoves[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const move of validMoves) {
      const gameCopy = this.copyGame();
      gameCopy.makeMove(move.row, move.col);
      const score = this.minimax(
        gameCopy,
        depth - 1,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        false
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(
    game: OthelloGame,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth === 0 || game.isGameOver()) {
      return this.evaluateBoard(game);
    }

    const validMoves = game.getValidMoves(game.currentPlayer);

    if (validMoves.length === 0) {
      // No moves available, switch player
      game.currentPlayer = game.currentPlayer === "black" ? "white" : "black";
      return this.minimax(game, depth - 1, alpha, beta, !isMaximizing);
    }

    if (isMaximizing) {
      let maxEval = Number.NEGATIVE_INFINITY;
      for (const move of validMoves) {
        const gameCopy = game.copyGame();
        gameCopy.makeMove(move.row, move.col);
        const score = this.minimax(gameCopy, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Number.POSITIVE_INFINITY;
      for (const move of validMoves) {
        const gameCopy = game.copyGame();
        gameCopy.makeMove(move.row, move.col);
        const score = this.minimax(gameCopy, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private evaluateBoard(game: OthelloGame): number {
    const scores = game.calculateScores();
    const aiPlayer = "white"; // AI is white
    const humanPlayer = "black";

    // Basic evaluation: piece count difference
    let score = scores[aiPlayer] - scores[humanPlayer];

    // Add positional bonuses
    const cornerBonus = 25;
    const edgeBonus = 5;

    const corners = [
      [0, 0],
      [0, 7],
      [7, 0],
      [7, 7],
    ];
    const edges = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 1],
      [7, 2],
      [7, 3],
      [7, 4],
      [7, 5],
      [7, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
    ];

    // Corner bonus
    corners.forEach(([r, c]) => {
      if (game.board[r][c] === aiPlayer) score += cornerBonus;
      else if (game.board[r][c] === humanPlayer) score -= cornerBonus;
    });

    // Edge bonus
    edges.forEach(([r, c]) => {
      if (game.board[r][c] === aiPlayer) score += edgeBonus;
      else if (game.board[r][c] === humanPlayer) score -= edgeBonus;
    });

    return score;
  }

  private copyGame(): OthelloGame {
    const copy = new OthelloGame(this.gameMode, this.difficulty);
    copy.board = this.board.map((row) => [...row]);
    copy.currentPlayer = this.currentPlayer;
    return copy;
  }

  public getUndoLimit(): number {
    switch (this.difficulty) {
      case "easy":
        return 3;
      case "medium":
        return 1;
      case "hard":
        return 0;
      default:
        return 0;
    }
  }

  public getUndosRemaining(): number {
    return Math.max(0, this.getUndoLimit() - this.undosUsed);
  }

  public canUndo(): boolean {
    return this.moveHistory.length >= 2 && this.getUndosRemaining() > 0;
  }

  public undoLastMove(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    // Remove the last move (AI move)
    const aiMove = this.moveHistory.pop();
    if (!aiMove) return false;

    // Remove the player's move as well
    const playerMove = this.moveHistory.pop();
    if (!playerMove) {
      // Put the AI move back if we can't find the player move
      this.moveHistory.push(aiMove);
      return false;
    }

    // Reconstruct the board state before these moves
    this.reconstructBoardFromHistory();
    this.undosUsed++;

    return true;
  }

  private reconstructBoardFromHistory(): void {
    // Reset to initial board state
    this.board = this.initializeBoard();
    this.currentPlayer = "black";

    // Replay all moves in history
    for (const move of this.moveHistory) {
      // Temporarily set current player to the move's player
      this.currentPlayer = move.player;

      // Place the piece
      this.board[move.position.row][move.position.col] = move.player;

      // Flip the pieces
      move.flippedPieces.forEach(({ row, col }) => {
        this.board[row][col] = move.player;
      });

      // Switch to next player
      this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
    }

    // Ensure current player is correct after replay
    if (this.moveHistory.length === 0) {
      this.currentPlayer = "black";
    } else {
      // After replaying moves, set to the player who should move next
      const lastMove = this.moveHistory[this.moveHistory.length - 1];
      this.currentPlayer = lastMove.player === "black" ? "white" : "black";

      // Check if current player has valid moves, if not switch back
      if (this.getValidMoves(this.currentPlayer).length === 0) {
        this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
      }
    }
  }
}
