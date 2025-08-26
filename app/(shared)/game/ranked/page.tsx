"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Copy,
  Users,
  Trophy,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OthelloBoard } from "@/components/othello-board";
import { GameSidebar } from "@/components/game-sidebar";
import { useUnifiedMultiplayerGame } from "@/hooks/use-unified-multiplayer-game";
import { setStorageItem } from "@/lib/storage-helpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getNameIfAny } from "@/lib/othello-game";
import type { RankSetType } from "@/shared/gameLogic";

export default function RankedGamePage() {
  const {
    websocketState,
    gameState,
    makeMove,
    restartGame,
    resignGame,
    joinRandomGame,
    leaveRoom,
    offerDraw,
    acceptDraw,
    declineDraw,
    offerRematch,
    acceptRematch,
    declineRematch,
  } = useUnifiedMultiplayerGame();

  const name = getNameIfAny();
  const { toast } = useToast();

  // Game setup dialog states
  const [dialogOpen, setDialogOpen] = useState(true);
  const [playerName, setPlayerName] = useState(name);
  const [selectedRankSet, setSelectedRankSet] =
    useState<RankSetType>("intermediate");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Game control dialog states
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showDrawOfferDialog, setShowDrawOfferDialog] = useState(false);
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showRematchOfferDialog, setShowRematchOfferDialog] = useState(false);

  // Show game over dialog when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      setShowGameOverDialog(true);
    }
  }, [gameState.isGameOver]);

  // Show draw offer dialog when a draw is offered
  useEffect(() => {
    if (
      gameState.drawOfferedBy &&
      gameState.drawOfferedBy !== websocketState.playerRole
    ) {
      setShowDrawOfferDialog(true);
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
      setShowDrawOfferDialog(false);
    }
  }, [gameState.drawOfferedBy, websocketState.playerRole]);

  // Show rematch offer dialog when a rematch is offered
  useEffect(() => {
    if (
      gameState.rematchOfferedBy &&
      gameState.rematchOfferedBy !== websocketState.playerRole
    ) {
      setShowRematchOfferDialog(true);
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
        title: "Rematch Offer",
        description: "Your opponent has offered a rematch. Accept or decline?",
        variant: "default",
      });
    } else {
      setShowRematchOfferDialog(false);
    }
  }, [gameState.rematchOfferedBy, websocketState.playerRole]);

  // Handle joining a random game
  const handleJoinRandomGame = () => {
    setIsSearching(true);
    joinRandomGame(playerName || "Player", selectedRankSet);
    setDialogOpen(false);
  };

  // Handle canceling search
  const handleCancelSearch = () => {
    leaveRoom();
    setIsSearching(false);
    setDialogOpen(true);
  };

  // Copy room ID to clipboard
  const handleCopyRoomId = () => {
    if (gameState.roomId) {
      navigator.clipboard.writeText(gameState.roomId);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);

      toast({
        title: "Room ID Copied",
        description: "Room ID copied to clipboard",
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
    toast({
      title: "Game Restarted",
      description: "Starting a new game",
    });
  };

  // Handle resign
  const handleResign = () => {
    setShowResignDialog(true);
  };

  const confirmResign = () => {
    resignGame();
    setShowResignDialog(false);
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
    setShowDrawOfferDialog(false);
    toast({
      title: "Draw Accepted",
      description: "The game ended in a draw",
    });
  };

  const handleDeclineDraw = () => {
    declineDraw();
    setShowDrawOfferDialog(false);
    toast({
      title: "Draw Declined",
      description: "You declined the draw offer",
    });
  };

  // Handle rematch offers
  const handleOfferRematch = () => {
    offerRematch();
    toast({
      title: "Rematch Offered",
      description: "Waiting for opponent's response",
    });
  };

  const handleAcceptRematch = () => {
    acceptRematch();
    setShowRematchOfferDialog(false);
    toast({
      title: "Rematch Accepted",
      description: "Starting a new game",
    });
  };

  const handleDeclineRematch = () => {
    declineRematch();
    setShowRematchOfferDialog(false);
    toast({
      title: "Rematch Declined",
      description: "You declined the rematch offer",
    });
  };

  // Get opponent name based on player role
  const getOpponentName = () => {
    return gameState.opponentName || "Opponent";
  };

  // Save player name
  useEffect(() => {
    if (playerName) {
      setStorageItem("playerName", playerName);
    }
  }, [playerName]);

  // Display rank info
  const getRankText = (rank?: number) => {
    if (rank === undefined) return "Unranked";
    if (rank < 1000) return "Beginner";
    if (rank < 1500) return "Intermediate";
    if (rank < 2000) return "Advanced";
    return "Expert";
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
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="flex gap-2">
                  {websocketState.isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyRoomId}
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
                        variant="outline"
                        size="sm"
                        onClick={handleOfferRematch}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                <Trophy className="w-6 h-6 inline-block mr-2" />
                Ranked Match
              </h1>
              <div className="flex justify-center gap-2">
                {websocketState.isConnected ? (
                  <Badge
                    variant="outline"
                    className="bg-transparent border-green-500/50 text-green-400"
                  >
                    Connected
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-transparent border-yellow-500/50 text-yellow-400"
                  >
                    Not Connected
                  </Badge>
                )}
                {isSearching && gameState.isWaitingForPlayer && (
                  <Badge
                    variant="outline"
                    className="bg-transparent border-purple-500/50 text-purple-400 animate-pulse"
                  >
                    Searching for opponent...
                  </Badge>
                )}
                {gameState.opponentRank !== undefined && (
                  <Badge
                    variant="outline"
                    className="bg-transparent border-blue-500/50 text-blue-400"
                  >
                    {getRankText(gameState.opponentRank)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Loading state when searching for opponent */}
            {isSearching && gameState.isWaitingForPlayer ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8">
                <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Finding an opponent...
                </h2>
                <p className="text-gray-300 mb-6">
                  Looking for a {selectedRankSet} level player
                </p>
                <Button onClick={handleCancelSearch} variant="outline">
                  Cancel Search
                </Button>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-white/10">
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
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-white/10 bg-white/5 backdrop-blur-sm">
          <GameSidebar
            currentPlayer={gameState.currentPlayer as "black" | "white"}
            playerColor={websocketState.playerRole as "black" | "white"}
            blackScore={gameState.blackScore}
            whiteScore={gameState.whiteScore}
            opponentName={getOpponentName()}
            opponentRank={gameState.opponentRank}
            gameMode="ranked"
            gameStatus={gameState.isGameOver ? "finished" : "playing"}
            onResign={handleResign}
            onDraw={handleOfferDraw}
          />
        </div>
      </div>

      {/* Initial dialog for setting up a ranked game */}
      <Dialog
        open={dialogOpen && !websocketState.isConnected}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-black border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Ranked Game</DialogTitle>
            <DialogDescription className="text-gray-300">
              Play against another player of similar skill level.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none text-white"
              >
                Your Name
              </label>
              <input
                id="name"
                value={playerName || ""}
                onChange={(e) => setPlayerName(e.target.value)}
                className="flex h-10 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
                placeholder="Enter your name"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none text-white">
                Skill Level
              </label>
              <div className="flex gap-2">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <Button
                    key={level}
                    onClick={() => setSelectedRankSet(level as RankSetType)}
                    variant={selectedRankSet === level ? "secondary" : "ghost"}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleJoinRandomGame}
              className="mt-2 bg-white text-black hover:bg-white/90"
            >
              Find Match
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog
        open={showGameOverDialog && gameState.isGameOver}
        onOpenChange={setShowGameOverDialog}
      >
        <DialogContent className="bg-black border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Game Over</DialogTitle>
            <DialogDescription className="text-gray-300">
              {gameState.winner === "draw"
                ? "The game ended in a draw!"
                : gameState.winner === websocketState.playerRole
                ? "Congratulations! You won the game!"
                : "You lost this game. Better luck next time!"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-white/5 rounded-md border border-white/10">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Your rank has been updated
            </h3>
            <p className="text-sm text-gray-300">
              {/* If rankChange property doesn't exist in the state, we'll just display a generic message */}
              New rank: {getRankText(gameState.opponentRank)}
            </p>
          </div>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setShowGameOverDialog(false)}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Close
            </Button>
            <Button
              onClick={handleOfferRematch}
              className="bg-white text-black hover:bg-white/90"
            >
              Offer Rematch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draw Offer Dialog */}
      <Dialog open={showDrawOfferDialog} onOpenChange={setShowDrawOfferDialog}>
        <DialogContent className="bg-black border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Draw Offered</DialogTitle>
            <DialogDescription className="text-gray-300">
              Your opponent has offered a draw. Do you accept?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleDeclineDraw}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Decline
            </Button>
            <Button
              onClick={handleAcceptDraw}
              className="bg-white text-black hover:bg-white/90"
            >
              Accept Draw
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resign Confirmation Dialog */}
      <Dialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <DialogContent className="bg-black border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Resign Game?</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to resign this game? You will lose rank
              points.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResignDialog(false)}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmResign}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Resign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rematch Offer Dialog */}
      <Dialog
        open={showRematchOfferDialog}
        onOpenChange={setShowRematchOfferDialog}
      >
        <DialogContent className="bg-black border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Rematch Offered</DialogTitle>
            <DialogDescription className="text-gray-300">
              Your opponent has offered a rematch. Do you accept?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleDeclineRematch}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Decline
            </Button>
            <Button
              onClick={handleAcceptRematch}
              className="bg-white text-black hover:bg-white/90"
            >
              Accept Rematch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
