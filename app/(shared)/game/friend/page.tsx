"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw, Copy, Users } from "lucide-react";
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

  // Local UI state
  const [dialogOpen, setDialogOpen] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [hasCreatedRoom, setHasCreatedRoom] = useState(false);

  // Set game type on mount
  useEffect(() => {
    dispatch(setGameType("friend"));
  }, [dispatch]);

  // Show game over dialog when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      dispatch(setShowGameOverDialog(true));

      // Record game result for authenticated users
      if (!gameRecordedRef.current && user) {
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
      gameState.drawOfferedBy !== websocketState.playerRole
    ) {
      dispatch(setShowDrawOfferDialog(true));
      // Play a notification sound
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch((e) => console.log("Audio play failed:", e));
      } catch (error) {
        console.log("Audio failed:", error);
      }

      // Show toast notification
      toast({
        title: "Draw Offer",
        description: "Your opponent has offered a draw. Accept or decline?",
        variant: "default",
      });
    } else {
      dispatch(setShowDrawOfferDialog(false));
    }
  }, [gameState.drawOfferedBy, websocketState.playerRole, toast, dispatch]);

  // Auto-create room when page loads
  useEffect(() => {
    if (!hasCreatedRoom && !websocketState.isConnected) {
      setHasCreatedRoom(true);
      const playerName =
        user?.displayName || user?.primaryEmail?.split("@")[0] || "Player";
      createGameRoom(playerName);
      setDialogOpen(false);
    }
  }, [hasCreatedRoom, websocketState.isConnected, user, createGameRoom]);

  // Handle room creation
  const handleCreateRoom = () => {
    const playerName =
      user?.displayName || user?.primaryEmail?.split("@")[0] || "Player";
    createGameRoom(playerName);
    setDialogOpen(false);
  };

  // Handle joining a room
  const handleJoinRoom = () => {
    if (roomIdToJoin) {
      const playerName =
        user?.displayName || user?.primaryEmail?.split("@")[0] || "Player";
      joinGameRoom(roomIdToJoin, playerName);
      setJoinDialogOpen(false);
      setDialogOpen(false);
    }
  };

  // Copy room ID to clipboard
  const handleCopyRoomId = () => {
    if (gameState.roomId) {
      navigator.clipboard.writeText(gameState.roomId);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);

      toast({
        title: "Room ID Copied",
        description: "Share this ID with your friend to join the game",
      });
    }
  };

  // Handle making a move
  const handleMove = async (row: number, col: number) => {
    return await makeMove(row, col);
  };

  // Handle game restart
  const handleRestart = () => {
    restartGame();
    gameStartTimeRef.current = Date.now();
    gameRecordedRef.current = false;
    toast({
      title: "Game Restarted",
      description: "Starting a new game",
    });
  };

  // Handle resign
  const handleResign = () => {
    dispatch(setShowResignDialog(true));
  };

  const confirmResign = () => {
    resignGame();
    dispatch(setShowResignDialog(false));
    toast({
      title: "Game Resigned",
      description: "You have resigned the game",
    });
  };

  // Handle draw offers
  const handleOfferDraw = () => {
    offerDraw();
    toast({
      title: "Draw Offered",
      description: "Waiting for opponent's response",
    });
  };

  const handleAcceptDraw = () => {
    acceptDraw();
    dispatch(setShowDrawOfferDialog(false));
    toast({
      title: "Draw Accepted",
      description: "The game ended in a draw",
    });
  };

  const handleDeclineDraw = () => {
    declineDraw();
    dispatch(setShowDrawOfferDialog(false));
    toast({
      title: "Draw Declined",
      description: "You declined the draw offer",
    });
  };

  // Get opponent name based on player role
  const getOpponentName = () => {
    return gameState.opponentName || "Opponent";
  };

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
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
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
                Multiplayer Game
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
                websocketState.playerRole === gameState.currentPlayer
                  ? gameState.validMoves
                  : []
              }
              lastMove={gameState.lastMove}
              currentPlayer={gameState.currentPlayer}
              onMove={handleMove}
              disabled={
                gameState.isGameOver ||
                gameState.isWaitingForPlayer ||
                websocketState.playerRole !== gameState.currentPlayer
              }
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
          <GameSidebar
            currentPlayer={gameState.currentPlayer as "black" | "white"}
            blackScore={gameState.blackScore}
            whiteScore={gameState.whiteScore}
            opponentName={getOpponentName()}
            gameMode="friend"
            gameStatus={gameState.isGameOver ? "finished" : "playing"}
            onResign={handleResign}
          />

          {/* Draw offer button */}
          {websocketState.isConnected &&
            !gameState.isWaitingForPlayer &&
            !gameState.isGameOver && (
              <Button
                variant="outline"
                className="w-full mt-4 bg-transparent border-white/30 text-white hover:bg-white hover:text-black"
                onClick={handleOfferDraw}
              >
                Offer Draw
              </Button>
            )}
        </div>
      </div>

      {/* Initial dialog for creating/joining a room */}
      <Dialog
        open={dialogOpen && !websocketState.isConnected}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Play with a Friend</DialogTitle>
            <DialogDescription>
              Create a new game room or join an existing one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setJoinDialogOpen(true)}>Join Room</Button>
              <Button onClick={handleCreateRoom}>Create Room</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for joining an existing room */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Game Room</DialogTitle>
            <DialogDescription>
              Enter the room ID provided by your friend.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="roomId"
                className="text-sm font-medium leading-none"
              >
                Room ID
              </label>
              <input
                id="roomId"
                value={roomIdToJoin}
                onChange={(e) => setRoomIdToJoin(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter room ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleJoinRoom}>Join Game</Button>
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

      {/* Resign Confirmation Dialog */}
      <Dialog
        open={showResignDialog}
        onOpenChange={(open) => dispatch(setShowResignDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resign Game?</DialogTitle>
            <DialogDescription>
              Are you sure you want to resign this game? This action cannot be
              undone.
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
              Resign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
