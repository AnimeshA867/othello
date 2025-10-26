"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw, Trophy, Loader2, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OthelloBoard } from "@/components/othello-board";
import { GameSidebar } from "@/components/game-sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOthelloGame } from "@/hooks/use-othello-game";
import { useUnifiedMultiplayerGame } from "@/hooks/use-unified-multiplayer-game";
import { useToast } from "@/hooks/use-toast";
import type { Difficulty } from "@/lib/othello-game";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { getRandomBotName } from "@/lib/bot-names";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  setGameMode as setReduxGameMode,
  setGameType,
  setDifficulty,
  setBotName as setReduxBotName,
  setEloChange as setReduxEloChange,
  startMatchmaking as reduxStartMatchmaking,
  stopMatchmaking,
  setOpponent,
  startGame as reduxStartGame,
  setGameRecorded,
  offerDraw,
  cancelDrawOffer,
  resetGame,
} from "@/lib/redux/slices/gameSlice";
import {
  updateElo,
  incrementGameStats,
  setGameStats,
  completeTutorial,
} from "@/lib/redux/slices/userSlice";
import {
  setShowGameOverDialog,
  setShowResignDialog,
  setShowDrawOfferDialog,
  setShowAuthPrompt,
  setLoading,
} from "@/lib/redux/slices/uiSlice";
import { TutorialDialog } from "@/components/tutorial-dialog";

// ELO to difficulty mapping
function eloDifficultyMap(elo: number): Difficulty {
  if (elo < 1200) return "easy";
  if (elo < 1500) return "medium";
  if (elo < 1800) return "hard";
  return "hard";
}

type GameMode = "searching" | "ai" | "multiplayer";

export default function RankedGamePage() {
  const user = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Redux state
  const gameMode = useAppSelector(
    (state: any) => state.game.mode
  ) as GameMode | null;
  const userElo = useAppSelector(
    (state: any) => state.user.gameStats?.eloRating ?? 1200
  );
  const botDifficulty = useAppSelector((state: any) => state.game.difficulty);
  const isLoading = useAppSelector((state: any) => state.ui.isLoading);
  const eloChange = useAppSelector((state: any) => state.game.eloChange);
  const botName = useAppSelector((state: any) => state.game.botName ?? "");
  const showGameOverDialog = useAppSelector(
    (state: any) => state.ui.showGameOverDialog
  );
  const showResignDialog = useAppSelector(
    (state: any) => state.ui.showResignDialog
  );
  const showDrawOfferDialog = useAppSelector(
    (state: any) => state.ui.showDrawOfferDialog
  );
  const drawOfferedByPlayer = useAppSelector(
    (state: any) => state.game.drawOfferedByPlayer
  );
  const showAuthDialog = useAppSelector(
    (state: any) => state.ui.showAuthPrompt
  );
  const isMatchmaking = useAppSelector(
    (state: any) => state.game.isMatchmaking
  );
  const hasCompletedTutorial = useAppSelector(
    (state: any) => state.user.hasCompletedTutorial
  );

  // Local component state (UI-only)
  const [moveCount, setMoveCount] = useState(0);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [hasStartedMatchmaking, setHasStartedMatchmaking] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const gameStartTimeRef = useRef<number>(Date.now());
  const gameRecordedRef = useRef<boolean>(false);
  const matchmakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Multiplayer hook
  const {
    websocketState,
    gameState: mpGameState,
    makeMove: mpMakeMove,
    restartGame: mpRestartGame,
    resignGame: mpResignGame,
    joinRandomGame,
    leaveRoom,
    offerDraw: mpOfferDraw,
    acceptDraw: mpAcceptDraw,
    declineDraw: mpDeclineDraw,
  } = useUnifiedMultiplayerGame();

  // AI hook
  const {
    gameState: aiGameState,
    isAiThinking,
    makeMove: aiMakeMove,
    restartGame: aiRestartGame,
    resignGame: aiResignGame,
  } = useOthelloGame("ai", botDifficulty);

  // Select the active game state
  const gameState = gameMode === "multiplayer" ? mpGameState : aiGameState;

  // Track move count
  useEffect(() => {
    const totalMoves = gameState.board
      .flat()
      .filter((cell) => cell !== null).length;
    setMoveCount(totalMoves);
  }, [gameState.board]);

  // Show tutorial for new users
  useEffect(() => {
    if (!hasCompletedTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTutorial]);

  // Initialize game mode to "searching" on mount
  useEffect(() => {
    dispatch(setReduxGameMode("ai" as any)); // Use "ai" as temporary mode for searching
    dispatch(setGameType("ranked"));
    dispatch(setLoading({ isLoading: true }));
  }, [dispatch]);

  // Fetch user's ELO rating and auto-start matchmaking
  useEffect(() => {
    async function fetchUserElo() {
      if (!user) {
        dispatch(setDifficulty("medium"));
        dispatch(setLoading({ isLoading: false }));
        return;
      }

      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          const elo = data.stats?.eloRating || 1200;

          // Update Redux with game stats
          if (data.stats) {
            dispatch(setGameStats(data.stats));
          }

          dispatch(setDifficulty(eloDifficultyMap(elo)));
        }
      } catch (error) {
        console.error("Failed to fetch ELO:", error);
      } finally {
        dispatch(setLoading({ isLoading: false }));
      }
    }

    fetchUserElo();
  }, [user]);

  // Auto-start matchmaking when loaded
  useEffect(() => {
    if (!isLoading && !hasStartedMatchmaking) {
      setHasStartedMatchmaking(true);
      startMatchmaking();
    }
  }, [isLoading, hasStartedMatchmaking]);

  // Handle matchmaking - wait 3 seconds for a player, then use AI
  const startMatchmaking = () => {
    dispatch(reduxStartMatchmaking()); // Start matchmaking in Redux
    dispatch(setReduxGameMode("ai")); // Set to "ai" initially (will be overridden if multiplayer found)
    dispatch(setGameType("ranked"));
    gameStartTimeRef.current = Date.now();
    gameRecordedRef.current = false;
    dispatch(setReduxEloChange(null));
    dispatch(cancelDrawOffer());

    // Get player name from user or use default
    const playerName =
      user?.displayName || user?.primaryEmail?.split("@")[0] || "Player";

    // Try to join multiplayer
    joinRandomGame(playerName);

    // Set timeout to fall back to AI if no player found
    matchmakingTimeoutRef.current = setTimeout(() => {
      if (mpGameState.isWaitingForPlayer || !websocketState.isConnected) {
        // No player found, use AI bot
        dispatch(stopMatchmaking()); // Stop matchmaking
        dispatch(setReduxGameMode("ai"));
        const botNameGenerated = getRandomBotName();
        dispatch(setReduxBotName(botNameGenerated));
        leaveRoom();
        toast({
          title: "Opponent Found!",
          description: `Matched with ${botNameGenerated}`,
        });
      }
    }, 3000);
  };

  // Check if multiplayer game started
  useEffect(() => {
    if (
      websocketState.isConnected &&
      !mpGameState.isWaitingForPlayer &&
      gameMode === "ai" // Check against "ai" since we initialize with that
    ) {
      // Real player found!
      if (matchmakingTimeoutRef.current) {
        clearTimeout(matchmakingTimeoutRef.current);
      }
      dispatch(stopMatchmaking()); // Stop matchmaking
      dispatch(setReduxGameMode("multiplayer"));
      dispatch(setOpponent({ name: mpGameState.opponentName || "player" }));
      toast({
        title: "Opponent Found!",
        description: `Matched with ${mpGameState.opponentName || "player"}`,
      });
    }
  }, [
    websocketState.isConnected,
    mpGameState.isWaitingForPlayer,
    gameMode,
    mpGameState.opponentName,
    toast,
    dispatch,
  ]);

  // Show auth dialog for guests after 3 games
  useEffect(() => {
    if (!user) {
      const gamesPlayed = parseInt(
        localStorage.getItem("guestGamesPlayed") || "0"
      );
      if (gamesPlayed >= 3 && gameState.isGameOver) {
        dispatch(setShowAuthPrompt(true));
      }
    }
  }, [user, gameState.isGameOver, dispatch]);

  // Record game result for AI mode
  useEffect(() => {
    if (gameMode === "ai" && gameState.isGameOver && !gameRecordedRef.current) {
      dispatch(setShowGameOverDialog(true));

      const winner = gameState.winner;
      const duration = Math.floor(
        (Date.now() - gameStartTimeRef.current) / 1000
      );

      if (!user) {
        const gamesPlayed = parseInt(
          localStorage.getItem("guestGamesPlayed") || "0"
        );
        localStorage.setItem("guestGamesPlayed", (gamesPlayed + 1).toString());
      } else {
        const won = winner === "black";
        const draw = winner === "draw";
        const botElo = userElo;
        const K = 32;
        const expectedScore = 1 / (1 + Math.pow(10, (botElo - userElo) / 400));
        const actualScore = won ? 1 : draw ? 0.5 : 0;
        const change = Math.round(K * (actualScore - expectedScore));

        dispatch(setReduxEloChange(change));
        dispatch(updateElo({ change, newElo: userElo + change }));
        dispatch(incrementGameStats({ won, draw, mode: "ranked" }));

        fetch("/api/games/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "ranked",
            won,
            draw,
            score: gameState.blackScore,
            opponentScore: gameState.whiteScore,
            duration,
            difficulty: botDifficulty,
          }),
        })
          .then(() => fetch("/api/achievements", { method: "POST" }))
          .then((res) => res.json())
          .then((data) => {
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
      }

      gameRecordedRef.current = true;
    }
  }, [
    gameMode,
    gameState.isGameOver,
    gameState.winner,
    gameState.blackScore,
    gameState.whiteScore,
    user,
    userElo,
    botDifficulty,
    toast,
  ]);

  // Record game result for multiplayer mode
  useEffect(() => {
    if (
      gameMode === "multiplayer" &&
      gameState.isGameOver &&
      !gameRecordedRef.current
    ) {
      dispatch(setShowGameOverDialog(true));

      if (user) {
        const myRole = websocketState.playerRole;
        const winner = gameState.winner;
        const won = winner === myRole;
        const draw = winner === "draw";
        const duration = Math.floor(
          (Date.now() - gameStartTimeRef.current) / 1000
        );

        // For real multiplayer, we don't calculate ELO here (server does it)
        fetch("/api/games/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "ranked",
            won,
            draw,
            score:
              myRole === "black" ? gameState.blackScore : gameState.whiteScore,
            opponentScore:
              myRole === "black" ? gameState.whiteScore : gameState.blackScore,
            duration,
          }),
        })
          .then(() => fetch("/api/achievements", { method: "POST" }))
          .then((res) => res.json())
          .then((data) => {
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
      }

      gameRecordedRef.current = true;
    }
  }, [
    gameMode,
    gameState.isGameOver,
    gameState.winner,
    gameState.blackScore,
    gameState.whiteScore,
    websocketState.playerRole,
    user,
    toast,
  ]);

  // Show draw offer dialog for multiplayer
  useEffect(() => {
    if (
      gameMode === "multiplayer" &&
      mpGameState.drawOfferedBy &&
      mpGameState.drawOfferedBy !== websocketState.playerRole
    ) {
      dispatch(setShowDrawOfferDialog(true));
      toast({
        title: "Draw Offer",
        description: "Your opponent has offered a draw. Accept or decline?",
      });
    } else if (gameMode === "multiplayer") {
      dispatch(setShowDrawOfferDialog(false));
    }
  }, [
    gameMode,
    mpGameState.drawOfferedBy,
    websocketState.playerRole,
    toast,
    dispatch,
  ]);

  // Bot draw offer for AI mode
  useEffect(() => {
    if (
      gameMode === "ai" &&
      !gameState.isGameOver &&
      !drawOfferedByPlayer &&
      moveCount > 20
    ) {
      const scoreDiff = Math.abs(gameState.blackScore - gameState.whiteScore);
      if (
        scoreDiff < 4 &&
        Math.random() < 0.05 &&
        gameState.currentPlayer === "white"
      ) {
        dispatch(setShowDrawOfferDialog(true));
      }
    }
  }, [
    gameMode,
    moveCount,
    gameState.currentPlayer,
    gameState.isGameOver,
    gameState.blackScore,
    gameState.whiteScore,
    drawOfferedByPlayer,
    dispatch,
  ]);

  const handleMove = async (row: number, col: number) => {
    if (gameMode === "multiplayer") {
      return await mpMakeMove(row, col);
    } else {
      return await aiMakeMove(row, col);
    }
  };

  const handleTutorialComplete = () => {
    dispatch(completeTutorial());
    setShowTutorial(false);
    toast({
      title: "Tutorial Complete!",
      description: "You're ready to compete. Good luck!",
    });
  };

  const handleTutorialSkip = () => {
    dispatch(completeTutorial());
    setShowTutorial(false);
    toast({
      title: "Tutorial Skipped",
      description: "You can review the rules in 'How to Play' anytime",
    });
  };

  const handleRestart = () => {
    if (gameMode === "multiplayer") {
      mpRestartGame();
    } else {
      aiRestartGame();
    }
    dispatch(setShowGameOverDialog(false));
    dispatch(resetGame());
    setHasStartedMatchmaking(false);
    toast({
      title: "Finding New Match",
      description: "Searching for a new opponent...",
    });
  };

  const handleResign = () => {
    dispatch(setShowResignDialog(true));
  };

  const confirmResign = () => {
    let calculatedChange = 0;

    // Calculate ELO loss for AI mode
    if (gameMode === "ai" && user) {
      const botElo = userElo;
      const K = 32;
      const expectedScore = 1 / (1 + Math.pow(10, (botElo - userElo) / 400));
      const actualScore = 0; // Loss
      calculatedChange = Math.round(K * (actualScore - expectedScore));
      dispatch(setReduxEloChange(calculatedChange));
      dispatch(
        updateElo({
          change: calculatedChange,
          newElo: userElo + calculatedChange,
        })
      );
      dispatch(incrementGameStats({ won: false, draw: false, mode: "ranked" }));

      const duration = Math.floor(
        (Date.now() - gameStartTimeRef.current) / 1000
      );

      fetch("/api/games/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ranked",
          won: false,
          draw: false,
          score: gameState.blackScore,
          opponentScore: gameState.whiteScore,
          duration,
          difficulty: botDifficulty,
        }),
      }).catch(console.error);
    }

    if (gameMode === "multiplayer") {
      mpResignGame();
    } else {
      aiResignGame();
    }

    dispatch(setShowResignDialog(false));
    dispatch(setShowGameOverDialog(true));
    gameRecordedRef.current = true;

    toast({
      title: "Game Resigned",
      description:
        user && gameMode === "ai"
          ? `ELO ${calculatedChange >= 0 ? "+" : ""}${calculatedChange}`
          : "You resigned the match",
    });
  };

  const handleOfferDraw = () => {
    if (gameMode === "multiplayer") {
      mpOfferDraw();
      toast({
        title: "Draw Offered",
        description: "Waiting for opponent's response...",
      });
    } else {
      // AI mode - intelligent draw acceptance based on game state
      dispatch(offerDraw());

      setTimeout(() => {
        // Player is black, bot is white
        const playerScore = gameState.blackScore;
        const botScore = gameState.whiteScore;
        const scoreDiff = botScore - playerScore; // Positive means bot is winning

        // Calculate remaining empty squares
        const totalPieces = playerScore + botScore;
        const remainingSquares = 64 - totalPieces;

        // Bot's decision logic:
        // 1. If bot is winning by a good margin, decline
        // 2. If bot is losing, accept (better than losing)
        // 3. If close game with few moves left, accept
        // 4. If early/mid game and tied, small chance to accept

        let shouldAccept = false;

        if (scoreDiff < -5) {
          // Bot is losing by 5+ pieces - likely to accept
          shouldAccept = Math.random() < 0.85;
        } else if (scoreDiff < -2) {
          // Bot is losing by 2-4 pieces - might accept
          shouldAccept = Math.random() < 0.6;
        } else if (scoreDiff > 5) {
          // Bot is winning by 5+ pieces - unlikely to accept
          shouldAccept = Math.random() < 0.15;
        } else if (scoreDiff > 2) {
          // Bot is winning by 2-4 pieces - might decline
          shouldAccept = Math.random() < 0.3;
        } else {
          // Close game (-2 to +2)
          if (remainingSquares < 10) {
            // Late game, close score - more likely to accept
            shouldAccept = Math.random() < 0.5;
          } else {
            // Early/mid game, close score - less likely
            shouldAccept = Math.random() < 0.25;
          }
        }

        if (shouldAccept) {
          handleAcceptDraw();
        } else {
          dispatch(cancelDrawOffer());
          toast({
            title: "Draw Declined",
            description: `${botName} declined the draw offer`,
          });
        }
      }, 2000 + Math.random() * 1000);

      toast({
        title: "Draw Offered",
        description: `Waiting for ${botName}'s response...`,
      });
    }
  };

  const handleAcceptDraw = () => {
    if (gameMode === "multiplayer") {
      mpAcceptDraw();
      dispatch(setShowDrawOfferDialog(false));
      toast({
        title: "Draw Accepted",
        description: "The game ended in a draw",
      });
    } else {
      // AI mode
      let calculatedChange = 0;

      if (user) {
        const botElo = userElo;
        const K = 32;
        const expectedScore = 1 / (1 + Math.pow(10, (botElo - userElo) / 400));
        const actualScore = 0.5;
        calculatedChange = Math.round(K * (actualScore - expectedScore));
        dispatch(setReduxEloChange(calculatedChange));
        dispatch(
          updateElo({
            change: calculatedChange,
            newElo: userElo + calculatedChange,
          })
        );
        dispatch(
          incrementGameStats({ won: false, draw: true, mode: "ranked" })
        );

        const duration = Math.floor(
          (Date.now() - gameStartTimeRef.current) / 1000
        );

        fetch("/api/games/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "ranked",
            won: false,
            draw: true,
            score: gameState.blackScore,
            opponentScore: gameState.whiteScore,
            duration,
            difficulty: botDifficulty,
          }),
        }).catch(console.error);
      }

      dispatch(cancelDrawOffer());
      aiResignGame();
      gameRecordedRef.current = true;

      toast({
        title: "Draw Accepted",
        description: user
          ? `The game ended in a draw. ELO ${
              calculatedChange >= 0 ? "+" : ""
            }${calculatedChange}`
          : "The game ended in a draw",
      });
    }
  };

  const handleDeclineDraw = () => {
    if (gameMode === "multiplayer") {
      mpDeclineDraw();
    }
    dispatch(setShowDrawOfferDialog(false));
    toast({
      title: "Draw Declined",
      description: "You declined the draw offer",
    });
  };

  const handleCopyRoomId = () => {
    if (mpGameState.roomId) {
      navigator.clipboard.writeText(mpGameState.roomId);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
      toast({
        title: "Room ID Copied",
        description: "Share this ID with your friend to join the game",
      });
    }
  };

  const getOpponentName = () => {
    if (gameMode === "multiplayer") {
      return mpGameState.opponentName || "Opponent";
    }
    return botName;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
          <p className="text-gray-400">Loading ranked matchmaking...</p>
        </div>
      </div>
    );
  }

  const isSearching =
    !gameState.isGameOver &&
    moveCount === 0 &&
    (websocketState.isWaitingForPlayer ||
      (!websocketState.isConnected && gameMode === "ai" && !botName));
  const isDisabled =
    gameState.isGameOver ||
    (gameMode === "ai" && isAiThinking) ||
    (gameMode === "multiplayer" &&
      (mpGameState.isWaitingForPlayer ||
        websocketState.playerRole !== gameState.currentPlayer)) ||
    isSearching;

  return (
    <div className="min-h-screen bg-black relative">
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
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            <div className="mb-6 text-center">
              <div className="flex items-center justify-between mb-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="flex gap-2">
                  {gameMode === "multiplayer" && mpGameState.roomId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyRoomId}
                      className="text-white"
                    >
                      {copiedMessage ? (
                        "Copied!"
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Copy ID</span>
                        </>
                      )}
                    </Button>
                  )}
                  {!isSearching && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRestart}
                      className="text-gray-300 hover:text-white"
                      disabled={gameMode === "ai" && isAiThinking}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                <Trophy className="w-6 h-6 inline-block mr-2 text-yellow-500" />
                Ranked Match
              </h1>
              <div className="flex justify-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-500/20 text-green-300"
                >
                  {user ? `${userElo} ELO` : "Guest Mode"}
                </Badge>
                {isSearching ? (
                  <Badge
                    variant="outline"
                    className="bg-yellow-500/20 text-yellow-300 animate-pulse"
                  >
                    Finding opponent...
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-blue-500/20 text-blue-300"
                  >
                    vs {getOpponentName()}
                  </Badge>
                )}
              </div>
            </div>

            <OthelloBoard
              board={gameState.board}
              validMoves={
                gameMode === "multiplayer" &&
                websocketState.playerRole === gameState.currentPlayer
                  ? gameState.validMoves
                  : gameMode === "ai"
                  ? gameState.validMoves
                  : []
              }
              lastMove={gameState.lastMove}
              currentPlayer={gameState.currentPlayer}
              onMove={handleMove}
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="w-full lg:w-80 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-700">
          <GameSidebar
            currentPlayer={gameState.currentPlayer as "black" | "white"}
            blackScore={gameState.blackScore}
            whiteScore={gameState.whiteScore}
            opponentName={getOpponentName()}
            gameMode="ranked"
            gameStatus={gameState.isGameOver ? "finished" : "playing"}
            onResign={handleResign}
            onDraw={handleOfferDraw}
          />

          {!isSearching && !gameState.isGameOver && (
            <div className="space-y-2 mt-4">
              {/* <Button
                variant="outline"
                className="w-full bg-transparent border-white/30 text-white hover:bg-white hover:text-black"
                onClick={handleOfferDraw}
                disabled={
                  drawOfferedByPlayer || (gameMode === "ai" && isAiThinking)
                }
              >
                {drawOfferedByPlayer ? "Draw Offered..." : "Offer Draw"}
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

          {eloChange !== null &&
            gameState.isGameOver &&
            user &&
            gameMode === "ai" && (
              <div
                className={`mt-4 p-4 rounded-lg border ${
                  eloChange > 0
                    ? "bg-green-500/10 border-green-500/30"
                    : eloChange < 0
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-gray-500/10 border-gray-500/30"
                }`}
              >
                <p className="text-sm font-semibold mb-2 text-white">
                  {eloChange > 0
                    ? "🎉 ELO Gained!"
                    : eloChange < 0
                    ? "😔 ELO Lost"
                    : "Draw"}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    eloChange > 0
                      ? "text-green-400"
                      : eloChange < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {eloChange > 0 ? "+" : ""}
                  {eloChange}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  New Rating: {userElo + (eloChange || 0)}
                </p>
              </div>
            )}

          {!user && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400 mb-2">🎮 Playing as Guest</p>
              <p className="text-xs text-gray-400 mb-3">
                Sign in to track your ELO rating and compete on the leaderboard!
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => router.push("/auth/signin")}
              >
                Sign In to Track Progress
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Game Over Dialog */}
      <Dialog
        open={showGameOverDialog && gameState.isGameOver}
        onOpenChange={setShowGameOverDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over</DialogTitle>
            <DialogDescription>
              {gameState.winner === "draw"
                ? "The game ended in a draw!"
                : (gameMode === "multiplayer" &&
                    gameState.winner === websocketState.playerRole) ||
                  (gameMode === "ai" && gameState.winner === "black")
                ? `Congratulations! You defeated ${getOpponentName()}!`
                : `${getOpponentName()} won this game. Better luck next time!`}
            </DialogDescription>
          </DialogHeader>
          {user && eloChange !== null && gameMode === "ai" && (
            <div className="py-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">ELO Change</p>
                <p
                  className={`text-3xl font-bold ${
                    eloChange > 0
                      ? "text-green-500"
                      : eloChange < 0
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {eloChange > 0 ? "+" : ""}
                  {eloChange}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  New Rating: {userElo + eloChange}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => dispatch(setShowGameOverDialog(false))}
            >
              Close
            </Button>
            <Button onClick={handleRestart}>Find New Match</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draw Offer Dialog */}
      <Dialog open={showDrawOfferDialog} onOpenChange={setShowDrawOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draw Offered</DialogTitle>
            <DialogDescription>
              {getOpponentName()} has offered a draw. Do you accept?
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

      {/* Resign Dialog */}
      <Dialog
        open={showResignDialog}
        onOpenChange={(open) => dispatch(setShowResignDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moveCount < 2 ? "Abort Match?" : "Resign Game?"}
            </DialogTitle>
            <DialogDescription>
              {moveCount < 2
                ? "Are you sure you want to abort this match? No ELO will be lost."
                : `Are you sure you want to resign? ${
                    user ? "This will result in an ELO loss." : ""
                  }`}
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
              {moveCount < 2 ? "Abort" : "Resign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guest Limit Dialog */}
      <Dialog
        open={showAuthDialog}
        onOpenChange={(open) => dispatch(setShowAuthPrompt(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎮 Enjoying Ranked Mode?</DialogTitle>
            <DialogDescription>
              You've played 3 ranked matches as a guest! Sign in to:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Track your ELO rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Compete on the leaderboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Unlock achievements</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => dispatch(setShowAuthPrompt(false))}
            >
              Continue as Guest
            </Button>
            <Button onClick={() => router.push("/auth/signin")}>
              Sign In Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutorial Dialog */}
      <TutorialDialog
        open={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </div>
  );
}
