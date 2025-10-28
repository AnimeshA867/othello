"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, RotateCcw, Copy, Users, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OthelloBoard } from "@/components/othello-board";
import { GameSidebar } from "@/components/game-sidebar";
import { useUnifiedMultiplayerGame } from "@/hooks/use-unified-multiplayer-game";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@stackframe/stack";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  setShowGameOverDialog,
  setShowResignDialog,
  setShowDrawOfferDialog,
} from "@/lib/redux/slices/uiSlice";
import { incrementGameStats } from "@/lib/redux/slices/userSlice";
import { setGameType } from "@/lib/redux/slices/gameSlice";

export default function FriendGamePage() {
  const {
    websocketState,
    gameState,
    makeMove,
    restartGame,
    resignGame,
    createGameRoom,
    joinGameRoom,
    leaveRoom,
    offerDraw,
    acceptDraw,
    declineDraw,
  } = useUnifiedMultiplayerGame();

  const { toast } = useToast();
  const user = useUser();
  const dispatch = useAppDispatch();

  // Redux state
  const showGameOverDialog = useAppSelector(
    (state: any) => state.ui.showGameOverDialog
  );
  const showDrawOfferDialog = useAppSelector(
    (state: any) => state.ui.showDrawOfferDialog
  );
  const showResignDialog = useAppSelector(
    (state: any) => state.ui.showResignDialog
  );

  const gameStartTimeRef = useRef<number>(Date.now());
  const gameRecordedRef = useRef<boolean>(false);
  const gameOverDialogShownRef = useRef<boolean>(false);

  // Local UI state
  const [dialogOpen, setDialogOpen] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [hasCreatedRoom, setHasCreatedRoom] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [canAbandon, setCanAbandon] = useState(true);
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [isGameEnding, setIsGameEnding] = useState(false); // Track if game is ending

  // Close initial dialog when connected
  useEffect(() => {
    if (websocketState.isConnected && dialogOpen) {
      setDialogOpen(false);
    }
  }, [websocketState.isConnected, dialogOpen]);

  // Track move count for abandon logic
  useEffect(() => {
    const totalMoves = gameState.board
      .flat()
      .filter((cell) => cell !== null).length;
    setMoveCount(totalMoves);

    // Can abandon if at most 1 move per player (total pieces <= 6)
    const abandonAllowed = totalMoves <= 6;
    setCanAbandon(abandonAllowed);
  }, [gameState.board]);

  // Set game type on mount
  useEffect(() => {
    dispatch(setGameType("friend"));
  }, [dispatch]);

  // Show game over dialog when game ends
  useEffect(() => {
    if (
      gameState.isGameOver &&
      !gameRecordedRef.current &&
      !gameOverDialogShownRef.current
    ) {
      dispatch(setShowGameOverDialog(true));
      gameOverDialogShownRef.current = true;
      setIsGameEnding(true); // Mark game as ending

      // Record game result for authenticated users
      if (user) {
        const myRole = websocketState.playerRole;
        const winner = gameState.winner;
        const duration = Math.floor(
          (Date.now() - gameStartTimeRef.current) / 1000
        );

        let won = false;
        if (winner === myRole) {
          won = true;
        }

        dispatch(
          incrementGameStats({
            won,
            draw: winner === "draw",
            mode: "friend",
          })
        );

        fetch("/api/games/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "friend",
            won,
            draw: winner === "draw",
            score:
              myRole === "black" ? gameState.blackScore : gameState.whiteScore,
            opponentScore:
              myRole === "black" ? gameState.whiteScore : gameState.blackScore,
            duration,
          }),
        })
          .then(() => {
            // Check for achievement unlocks
            return fetch("/api/achievements", {
              method: "POST",
            });
          })
          .then((res) => res.json())
          .then((data) => {
            // Show achievement notifications
            if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
              data.newlyUnlocked.forEach((achievement: any) => {
                toast({
                  title: "🏆 Achievement Unlocked!",
                  description: `${achievement.achievement.name}: ${achievement.achievement.description}`,
                  duration: 5000,
                });
              });
            }
          })
          .catch(console.error);

        gameRecordedRef.current = true;
      }
    }
  }, [
    gameState.isGameOver,
    gameState.winner,
    gameState.blackScore,
    gameState.whiteScore,
    websocketState.playerRole,
    user,
    dispatch,
    toast,
  ]);

  // Show draw offer dialog when a draw is offered
  useEffect(() => {
    if (
      gameState.drawOfferedBy &&
      gameState.drawOfferedBy !== websocketState.playerRole &&
      !showDrawOfferDialog
    ) {
      dispatch(setShowDrawOfferDialog(true));

      // Show toast notification
      toast({
        title: "Draw Offer",
        description: "Your opponent has offered a draw. Accept or decline?",
        variant: "default",
      });
    } else if (!gameState.drawOfferedBy && showDrawOfferDialog) {
      // Close dialog when draw offer is resolved (accepted/declined/cancelled)
      dispatch(setShowDrawOfferDialog(false));
    }
  }, [
    gameState.drawOfferedBy,
    websocketState.playerRole,
    showDrawOfferDialog,
    toast,
    dispatch,
  ]);

  // Show toast notification when room is created (only for creator)
  useEffect(() => {
    if (
      websocketState.isConnected &&
      gameState.roomId &&
      !hasCreatedRoom &&
      isRoomCreator
    ) {
      setHasCreatedRoom(true);
      toast({
        title: "Room Created!",
        description: `Room ID: ${gameState.roomId}. Share this with your friend!`,
        duration: 5000,
      });
    }
  }, [
    websocketState.isConnected,
    gameState.roomId,
    hasCreatedRoom,
    isRoomCreator,
    toast,
  ]);

  // Handle room creation
  const handleCreateRoom = useCallback(() => {
    if (!user) {
      toast({
        title: "Login Required",
        description:
          "Please sign in to create a room. You can still join rooms created by others!",
        variant: "destructive",
      });
      return;
    }

    const playerName =
      user?.displayName || user?.primaryEmail?.split("@")[0] || "Player";
    setIsRoomCreator(true); // Mark as room creator
    createGameRoom(playerName);
    setDialogOpen(false);
  }, [user, createGameRoom, toast]);

  // Handle joining a room
  const handleJoinRoom = useCallback(() => {
    if (roomIdToJoin) {
      const playerName =
        user?.displayName || user?.primaryEmail?.split("@")[0] || "Player";
      setIsRoomCreator(false); // Mark as joiner, not creator
      joinGameRoom(roomIdToJoin, playerName);
      setJoinDialogOpen(false);
      setDialogOpen(false);
    }
  }, [roomIdToJoin, user, joinGameRoom]);

  // Copy room ID to clipboard
  const handleCopyRoomId = useCallback(() => {
    if (gameState.roomId) {
      navigator.clipboard.writeText(gameState.roomId);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);

      toast({
        title: "Room ID Copied",
        description: "Share this ID with your friend to join the game",
      });
    }
  }, [gameState.roomId, toast]);

  // Join room from sidebar
  const handleJoinRoomFromSidebar = useCallback(
    (roomId: string) => {
      const playerName =
        user?.displayName || user?.primaryEmail?.split("@")[0] || "Player";
      setIsRoomCreator(false); // Mark as joiner
      joinGameRoom(roomId, playerName);
    },
    [user, joinGameRoom]
  );

  // Handle making a move
  const handleMove = useCallback(
    async (row: number, col: number) => {
      return await makeMove(row, col);
    },
    [makeMove]
  );

  // Handle game restart
  const handleRestart = useCallback(() => {
    restartGame();
    gameStartTimeRef.current = Date.now();
    gameRecordedRef.current = false;
    gameOverDialogShownRef.current = false;
    setIsGameEnding(false); // Reset game ending state
    dispatch(setShowGameOverDialog(false));
    toast({
      title: "Game Restarted",
      description: "Starting a new game",
    });
  }, [restartGame, dispatch, toast]);

  // Handle resign
  const handleResign = useCallback(() => {
    dispatch(setShowResignDialog(true));
  }, [dispatch]);

  // Handle abandon (early game, ≤1 move per player)
  const handleAbandon = useCallback(() => {
    if (!canAbandon) {
      return;
    }

    setIsGameEnding(true); // Disable board immediately
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const actualMoves = moveCount - 4;

    if (user) {
      // Record abandon for friend mode (no ELO impact)
      fetch("/api/games/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "friend",
          duration,
          moveCount: actualMoves,
        }),
      }).catch(console.error);
    }

    gameRecordedRef.current = true;
    resignGame();
    dispatch(setShowResignDialog(false));

    toast({
      title: "Game Abandoned",
      description: "Match abandoned",
    });
  }, [canAbandon, moveCount, user, resignGame, dispatch, toast]);

  // Handle resign (late game or explicit resign)
  const confirmResign = useCallback(() => {
    if (canAbandon) {
      // If can abandon, call abandon instead
      handleAbandon();
      return;
    }

    setIsGameEnding(true); // Disable board immediately
    // Regular resignation (no ELO in friend mode anyway)
    resignGame();
    dispatch(setShowResignDialog(false));
    toast({
      title: "Game Resigned",
      description: "You have resigned the game",
    });
  }, [canAbandon, handleAbandon, resignGame, dispatch, toast]);

  // Handle draw offers
  const handleOfferDraw = useCallback(() => {
    offerDraw();
    toast({
      title: "Draw Offered",
      description: "Waiting for opponent's response",
    });
  }, [offerDraw]);

  const handleAcceptDraw = useCallback(() => {
    setIsGameEnding(true); // Disable board immediately
    acceptDraw();
    // Don't close dialog here - let the useEffect handle it when drawOfferedBy becomes null
    toast({
      title: "Draw Accepted",
      description: "The game ended in a draw",
    });
  }, [acceptDraw, toast]);

  const handleDeclineDraw = useCallback(() => {
    declineDraw();
    // Don't close dialog here - let the useEffect handle it when drawOfferedBy becomes null
    toast({
      title: "Draw Declined",
      description: "You declined the draw offer",
    });
  }, [declineDraw]);

  // Get opponent name based on player role
  const opponentName = useMemo(() => {
    return gameState.opponentName || "Opponent";
  }, [gameState.opponentName]);

  // Memoize player name
  const playerName = useMemo(() => {
    return user?.displayName || user?.primaryEmail?.split("@")[0] || "You";
  }, [user]);

  return (
    <div className="min-h-screen bg-black relative">
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `
               linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
               linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
             `,
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] relative z-10">
        {/* Main Game Area */}
        <div className="flex-1 flex items-start justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            {/* Game Header */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-between mb-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="flex gap-2">
                  {websocketState.isConnected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyRoomId}
                      className="text-white"
                      disabled={!gameState.roomId}
                    >
                      {copiedMessage ? (
                        "Copied!"
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Copy Room ID</span>
                          <span className="sm:hidden">Copy ID</span>
                        </>
                      )}
                    </Button>
                  )}
                  {websocketState.isConnected &&
                    !gameState.isWaitingForPlayer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRestart}
                        className="text-gray-300 hover:text-white"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                <Users className="w-6 h-6 inline-block mr-2" />
                Play with a Friend
              </h1>
              <div className="flex justify-center gap-2">
                {websocketState.isConnected ? (
                  <Badge
                    variant="outline"
                    className="bg-green-500/20 text-green-300"
                  >
                    Connected
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-500/20 text-yellow-300"
                  >
                    Not Connected
                  </Badge>
                )}
                {websocketState.isConnected && gameState.roomId && (
                  <Badge
                    variant="outline"
                    className="bg-blue-500/20 text-blue-300"
                  >
                    Room: {gameState.roomId}
                  </Badge>
                )}
                {gameState.isWaitingForPlayer && (
                  <Badge
                    variant="outline"
                    className="bg-purple-500/20 text-purple-300 animate-pulse"
                  >
                    Waiting for opponent
                  </Badge>
                )}
              </div>
            </div>

            <OthelloBoard
              board={gameState.board}
              validMoves={
                websocketState.playerRole === gameState.currentPlayer &&
                !gameState.isGameOver &&
                !isGameEnding
                  ? gameState.validMoves
                  : []
              }
              lastMove={gameState.lastMove}
              currentPlayer={gameState.currentPlayer}
              onMove={handleMove}
              disabled={
                gameState.isGameOver ||
                gameState.isWaitingForPlayer ||
                websocketState.playerRole !== gameState.currentPlayer ||
                isGameEnding
              }
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
          <GameSidebar
            currentPlayer={gameState.currentPlayer as "black" | "white"}
            playerColor={websocketState.playerRole as "black" | "white"}
            blackScore={gameState.blackScore}
            whiteScore={gameState.whiteScore}
            playerName={playerName}
            opponentName={opponentName}
            gameMode="friend"
            gameStatus={gameState.isGameOver ? "finished" : "playing"}
            onResign={handleResign}
            onDraw={handleOfferDraw}
            roomId={gameState.roomId ?? undefined}
            onCopyRoomId={handleCopyRoomId}
            onJoinRoom={handleJoinRoomFromSidebar}
            showAbandon={canAbandon}
          />

          {/* Action Buttons */}
          {websocketState.isConnected &&
            !gameState.isWaitingForPlayer &&
            !gameState.isGameOver && (
              <div className="space-y-2 mt-4">
                {/* <Button
                  variant="outline"
                  className="w-full bg-transparent border-white/30 text-white hover:bg-white hover:text-black"
                  onClick={handleOfferDraw}
                >
                  Offer Draw
                </Button> */}
                {moveCount < 2 && (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
                    onClick={confirmResign}
                  >
                    Abort Match
                  </Button>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Initial dialog for creating/joining a room */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Users className="w-5 h-5" />
              Play with a Friend
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new game room or join an existing one using a Room ID.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              onClick={handleCreateRoom}
              className={`w-full ${
                !user
                  ? "bg-blue-600/50 hover:bg-blue-700/50 text-white relative"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {!user && <Lock className="w-4 h-4 mr-2" />}
              Create New Room
            </Button>
            {!user && (
              <p className="text-xs text-yellow-400 text-center -mt-2">
                🔒 Sign in to create rooms
              </p>
            )}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800 px-2 text-gray-400">Or</span>
              </div>
            </div>
            <Button
              onClick={() => setJoinDialogOpen(true)}
              variant="outline"
              className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              Join Existing Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for joining an existing room */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Join Game Room
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the Room ID provided by your friend.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="roomId"
                className="text-sm font-medium leading-none text-white"
              >
                Room ID
              </label>
              <input
                id="roomId"
                value={roomIdToJoin}
                onChange={(e) => setRoomIdToJoin(e.target.value)}
                className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500"
                placeholder="Enter room ID"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomIdToJoin.trim()) {
                    handleJoinRoom();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setJoinDialogOpen(false)}
              variant="outline"
              className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinRoom}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!roomIdToJoin.trim()}
            >
              Join Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog
        open={showGameOverDialog && gameState.isGameOver}
        onOpenChange={(open) => dispatch(setShowGameOverDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over</DialogTitle>
            <DialogDescription>
              {gameState.winner === "draw"
                ? "The game ended in a draw!"
                : gameState.winner === websocketState.playerRole
                ? "Congratulations! You won the game!"
                : "You lost this game. Better luck next time!"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => dispatch(setShowGameOverDialog(false))}
            >
              Close
            </Button>
            <Button onClick={handleRestart}>Play Again</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draw Offer Dialog */}
      <Dialog
        open={showDrawOfferDialog}
        onOpenChange={(open) => dispatch(setShowDrawOfferDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draw Offered</DialogTitle>
            <DialogDescription>
              Your opponent has offered a draw. Do you accept?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleDeclineDraw}>
              Decline
            </Button>
            <Button onClick={handleAcceptDraw}>Accept Draw</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resign/Abandon Confirmation Dialog */}
      <Dialog
        open={showResignDialog}
        onOpenChange={(open) => dispatch(setShowResignDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {canAbandon ? "Abandon Match?" : "Resign Game?"}
            </DialogTitle>
            <DialogDescription>
              {canAbandon
                ? "Are you sure you want to abandon this match? The abandon will be tracked for statistics."
                : "Are you sure you want to resign this game? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => dispatch(setShowResignDialog(false))}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmResign}>
              {canAbandon ? "Abandon" : "Resign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
