"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw, Trophy, Loader2, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OthelloBoard } from "@/components/othello-board";
import { GameSidebar } from "@/components/game-sidebar";
import { ChatBox } from "@/components/chat-box";
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
  setShowRematchOfferDialog,
  setShowAuthPrompt,
  setLoading,
  setShowAbandonDialog,
} from "@/lib/redux/slices/uiSlice";
import { TutorialDialog } from "@/components/tutorial-dialog";

// ELO to difficulty mapping
function eloDifficultyMap(elo: number): Difficulty {
  if (elo < 1200) return "easy";
  if (elo < 1500) return "medium";
  if (elo < 1800) return "hard";
  return "hard";
}

// Bot ELO ratings based on difficulty
function getBotElo(difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      return 1000;
    case "medium":
      return 1400;
    case "hard":
      return 1800;
    default:
      return 1400;
  }
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
  const showRematchOfferDialog = useAppSelector(
    (state: any) => state.ui.showRematchOfferDialog
  );
  const drawOfferedByPlayer = useAppSelector(
    (state: any) => state.game.drawOfferedByPlayer
  );

  const showAbandonDialog = useAppSelector(
    (state: any) => state.ui.showAbandonDialog
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
  const [canAbandon, setCanAbandon] = useState(true);
  const [isGameEnding, setIsGameEnding] = useState(false);

  const gameStartTimeRef = useRef<number>(Date.now());
  const gameRecordedRef = useRef<boolean>(false);
  const matchmakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const opponentFoundToastShownRef = useRef<boolean>(false);
  const matchmakingTimeoutFiredRef = useRef<boolean>(false);
  const gameOverDialogShownRef = useRef<boolean>(false);

  // Multiplayer hook
  const {
    websocketState,
    gameState: mpGameState,
    makeMove: mpMakeMove,
    restartGame: mpRestartGame,
    resignGame: mpResignGame,
    abandonGame: mpAbandonGame,
    joinRandomGame,
    leaveRoom,
    offerDraw: mpOfferDraw,
    acceptDraw: mpAcceptDraw,
    declineDraw: mpDeclineDraw,
    offerRematch: mpOfferRematch,
    acceptRematch: mpAcceptRematch,
    declineRematch: mpDeclineRematch,
    sendChatMessage: mpSendChatMessage,
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

    // Can abandon if at most 1 move per player (total pieces <= 6)
    // Initial setup is 4 pieces, so 6 pieces means 2 moves total (1 per player max)
    // If more than 6 pieces, both players have made more than 1 move each = must resign
    const abandonAllowed = totalMoves <= 6;
    setCanAbandon(abandonAllowed);
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
    // Don't start matchmaking if user is not authenticated
    if (!user) {
      return;
    }

    if (!isLoading && !hasStartedMatchmaking) {
      setHasStartedMatchmaking(true);
      startMatchmaking();
    }
  }, [isLoading, hasStartedMatchmaking, user]);

  // Handle matchmaking - wait 3 seconds for a player, then use AI
  const startMatchmaking = () => {
    dispatch(reduxStartMatchmaking()); // Start matchmaking in Redux
    dispatch(setReduxGameMode("ai")); // Set to "ai" initially (will be overridden if multiplayer found)
    dispatch(setGameType("ranked"));
    gameStartTimeRef.current = Date.now();
    gameRecordedRef.current = false;
    opponentFoundToastShownRef.current = false; // Reset toast flag
    matchmakingTimeoutFiredRef.current = false; // Reset timeout flag
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
        // Set flag FIRST to prevent multiplayer detection from overriding
        matchmakingTimeoutFiredRef.current = true;
        opponentFoundToastShownRef.current = true; // Prevent any other toasts

        dispatch(stopMatchmaking()); // Stop matchmaking
        dispatch(setReduxGameMode("ai"));
        const botNameGenerated = getRandomBotName();
        dispatch(setReduxBotName(botNameGenerated));
        leaveRoom();
        // toast({
        //   title: "Opponent Found!",
        //   description: `Matched with ${botNameGenerated}`,
        // });
      }
    }, 3000);
  };

  // Check if multiplayer game started
  useEffect(() => {
    // Don't process multiplayer events if user is not authenticated
    if (!user) {
      return;
    }

    // Don't switch to multiplayer if timeout already fired and we're using AI
    if (matchmakingTimeoutFiredRef.current) {
      return;
    }

    const playerName =
      user?.displayName || user?.primaryEmail?.split("@")[0] || "Player";

    if (
      websocketState.isConnected &&
      !mpGameState.isWaitingForPlayer &&
      gameMode === "ai" && // Check against "ai" since we initialize with that
      mpGameState.opponentName && // Make sure opponent name exists
      mpGameState.opponentName !== playerName && // Make sure it's not the player's own name
      !opponentFoundToastShownRef.current // Prevent duplicate toasts
    ) {
      // Real player found!
      if (matchmakingTimeoutRef.current) {
        clearTimeout(matchmakingTimeoutRef.current);
      }
      opponentFoundToastShownRef.current = true; // Mark toast as shown
      dispatch(stopMatchmaking()); // Stop matchmaking
      dispatch(setReduxGameMode("multiplayer"));
      dispatch(setOpponent({ name: mpGameState.opponentName }));
      toast({
        title: "Opponent Found!",
        description: `Matched with ${mpGameState.opponentName}`,
      });
    }
  }, [
    websocketState.isConnected,
    mpGameState.isWaitingForPlayer,
    gameMode,
    mpGameState.opponentName,
    toast,
    dispatch,
    user,
  ]);

  // Handle disconnect detection in multiplayer mode
  useEffect(() => {
    // Only track disconnects when in multiplayer and user is authenticated
    if (gameMode !== "multiplayer" || !user || gameState.isGameOver) {
      return;
    }

    // Detect disconnect (connection lost during active game)
    if (!websocketState.isConnected && !mpGameState.isWaitingForPlayer) {
      // Check if enough moves have been made (>1 move per player = >6 pieces)
      const enoughMovesForPenalty = moveCount > 6;

      if (enoughMovesForPenalty && !gameRecordedRef.current) {
        // Apply disconnect penalty
        const duration = Math.floor(
          (Date.now() - gameStartTimeRef.current) / 1000
        );
        const actualMoves = moveCount - 4;

        fetch("/api/games/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "ranked",
            duration,
            moveCount: actualMoves,
            currentElo: userElo,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.eloChange) {
              dispatch(setReduxEloChange(data.eloChange));
              dispatch(
                updateElo({
                  change: data.eloChange,
                  newElo: data.newElo,
                })
              );
              toast({
                title: "Disconnected",
                description: `Connection lost. ELO penalty applied: ${data.eloChange}`,
                variant: "destructive",
              });
            }
          })
          .catch(console.error);

        gameRecordedRef.current = true;
        dispatch(setShowGameOverDialog(true));
      } else if (!enoughMovesForPenalty && !gameRecordedRef.current) {
        // Early disconnect, treat as abandon (no penalty)
        const duration = Math.floor(
          (Date.now() - gameStartTimeRef.current) / 1000
        );
        const actualMoves = moveCount - 4;

        fetch("/api/games/abandon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "ranked",
            duration,
            moveCount: actualMoves,
          }),
        }).catch(console.error);

        gameRecordedRef.current = true;
        toast({
          title: "Disconnected",
          description: "Connection lost - no ELO penalty (early disconnect)",
        });
      }
    }
  }, [
    gameMode,
    websocketState.isConnected,
    mpGameState.isWaitingForPlayer,
    gameState.isGameOver,
    moveCount,
    user,
    userElo,
    dispatch,
    toast,
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
    if (
      gameMode === "ai" &&
      gameState.isGameOver &&
      !gameRecordedRef.current &&
      !gameOverDialogShownRef.current
    ) {
      dispatch(setShowGameOverDialog(true));
      gameOverDialogShownRef.current = true;
      setIsGameEnding(true);

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
        const botElo = getBotElo(botDifficulty);
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
      !gameRecordedRef.current &&
      !gameOverDialogShownRef.current
    ) {
      dispatch(setShowGameOverDialog(true));
      gameOverDialogShownRef.current = true;
      setIsGameEnding(true);

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

  // Show rematch offer dialog for multiplayer
  useEffect(() => {
    if (
      gameMode === "multiplayer" &&
      mpGameState.rematchOfferedBy &&
      mpGameState.rematchOfferedBy !== websocketState.playerRole
    ) {
      dispatch(setShowRematchOfferDialog(true));
      toast({
        title: "Rematch Offer",
        description: "Your opponent wants to play again. Accept or decline?",
      });
    } else if (gameMode === "multiplayer") {
      dispatch(setShowRematchOfferDialog(false));
    }
  }, [
    gameMode,
    mpGameState.rematchOfferedBy,
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
      // In multiplayer, offer a rematch instead of immediately restarting
      mpOfferRematch();
      dispatch(setShowGameOverDialog(false));
      toast({
        title: "Rematch Offered",
        description: "Waiting for opponent to accept...",
      });
    } else {
      // In AI mode, restart immediately
      aiRestartGame();
      dispatch(setShowGameOverDialog(false));
      dispatch(resetGame());
      setHasStartedMatchmaking(false);
      setIsGameEnding(false);
      gameOverDialogShownRef.current = false;
      toast({
        title: "Finding New Match",
        description: "Searching for a new opponent...",
      });
    }
  };

  const handleResign = () => {
    dispatch(setShowResignDialog(true));
  };

  // Handle abandon (early game, ≤1 move per player, no ELO penalty)
  const handleAbandon = () => {
    if (!canAbandon) {
      // Should not happen, but safeguard
      return;
    }

    setIsGameEnding(true);
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    const actualMoves = moveCount - 4; // Subtract initial 4 pieces

    if (user) {
      // Record abandon in database (no ELO penalty)
      fetch("/api/games/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ranked",
          duration,
          moveCount: actualMoves,
        }),
      }).catch(console.error);
    }

    // Mark game as recorded to prevent double recording
    gameRecordedRef.current = true;

    // Close the game
    if (gameMode === "multiplayer") {
      mpResignGame();
    } else {
      aiResignGame();
    }

    dispatch(setShowResignDialog(false));
    dispatch(setShowGameOverDialog(true));

    toast({
      title: "Game Abandoned",
      description: "Match abandoned - no ELO penalty applied",
    });
  };

  // Handle resign (late game, >1 move per player, ELO penalty applies)
  const confirmResign = () => {
    if (canAbandon) {
      // If can abandon, call abandon instead
      handleAbandon();
      return;
    }

    setIsGameEnding(true);
    let calculatedChange = 0;
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);

    // Calculate ELO loss for resign
    if (user) {
      const opponentElo = userElo; // Assume equal opponent for AI/matchmaking
      const K = 32;
      const expectedScore =
        1 / (1 + Math.pow(10, (opponentElo - userElo) / 400));
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

      // Record the resignation with ELO penalty
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
          difficulty: gameMode === "ai" ? botDifficulty : undefined,
        }),
      }).catch(console.error);
    }

    // Mark game as recorded
    gameRecordedRef.current = true;

    // Close the game
    if (gameMode === "multiplayer") {
      mpResignGame();
    } else {
      aiResignGame();
    }

    dispatch(setShowResignDialog(false));
    dispatch(setShowGameOverDialog(true));

    toast({
      title: "Game Resigned",
      description: user
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
    setIsGameEnding(true);
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
        const botElo = getBotElo(botDifficulty);
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

  const handleAcceptRematch = () => {
    if (gameMode === "multiplayer") {
      mpAcceptRematch();
      dispatch(setShowRematchOfferDialog(false));
      dispatch(setShowGameOverDialog(false));
      dispatch(resetGame());
      setHasStartedMatchmaking(false);
      setIsGameEnding(false);
      gameRecordedRef.current = false;
      gameOverDialogShownRef.current = false;
      toast({
        title: "Rematch Accepted",
        description: "Starting a new game!",
      });
    }
  };

  const handleDeclineRematch = () => {
    if (gameMode === "multiplayer") {
      mpDeclineRematch();
    }
    dispatch(setShowRematchOfferDialog(false));
    toast({
      title: "Rematch Declined",
      description: "You declined the rematch offer",
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

  const handleSendChatMessage = (message: string) => {
    if (gameMode === "multiplayer") {
      const playerName =
        user?.displayName || user?.primaryEmail?.split("@")[0] || "You";
      mpSendChatMessage(message, playerName);
    }
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
    isSearching ||
    isGameEnding;

  // Redirect non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
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
        <div className="text-center relative z-10 max-w-md px-4">
          <div className="mb-6">
            <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white mb-4">
              Ranked Mode - Login Required
            </h1>
            <p className="text-gray-400 mb-6">
              Sign in to play ranked matches, compete on the leaderboard, and
              track your ELO rating!
            </p>
          </div>
          <div className="space-y-8">
            <Link href="/sign-in">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Create Account
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex-1 flex items-start justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            <div className="mb-6 text-center">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white"
                  onClick={() => {
                    if (canAbandon) {
                      router.push("/");
                    } else {
                      dispatch(setShowAbandonDialog(true));
                    }
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

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
                !isDisabled &&
                ((gameMode === "multiplayer" &&
                  websocketState.playerRole === gameState.currentPlayer) ||
                  gameMode === "ai")
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
            playerColor={websocketState.playerRole as "black" | "white"}
            blackScore={gameState.blackScore}
            whiteScore={gameState.whiteScore}
            playerName={
              user?.displayName || user?.primaryEmail?.split("@")[0] || "You"
            }
            opponentName={getOpponentName()}
            gameMode="ranked"
            gameStatus={gameState.isGameOver ? "finished" : "playing"}
            onResign={handleResign}
            onDraw={handleOfferDraw}
            onRestart={handleRestart}
            playerElo={userElo}
            showAbandon={canAbandon}
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
        onOpenChange={(open) => dispatch(setShowGameOverDialog(open))}
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

      {/* Rematch Offer Dialog */}
      <Dialog
        open={showRematchOfferDialog}
        onOpenChange={(open) => dispatch(setShowRematchOfferDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rematch Offered</DialogTitle>
            <DialogDescription>
              {getOpponentName()} wants to play again. Do you accept?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleDeclineRematch}>
              Decline
            </Button>
            <Button onClick={handleAcceptRematch}>Accept Rematch</Button>
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
              {canAbandon ? "Abandon Match?" : "Resign Game?"}
            </DialogTitle>
            <DialogDescription>
              {canAbandon
                ? "Are you sure you want to abandon this match? The abandon will be recorded, but you won't lose ELO."
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
              {canAbandon ? "Abandon" : "Resign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Abandon Warning Dialog */}
      <Dialog
        open={showAbandonDialog}
        onOpenChange={(open) => dispatch(setShowAbandonDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure to abandon the match?</DialogTitle>
            <DialogDescription>
              Abandoning match leads to ELO penalty. Will be calculated as
              resign.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => dispatch(setShowAbandonDialog(false))}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                confirmResign();
                router.push("/");
              }}
              variant={"destructive"}
            >
              Go Back
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
              onClick={() => {
                dispatch(setShowAuthPrompt(false));
              }}
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

      {/* Chat Box - Only show during multiplayer games */}
      {gameMode === "multiplayer" &&
        websocketState.isConnected &&
        !mpGameState.isWaitingForPlayer && (
          <ChatBox
            messages={
              mpGameState.chatMessages
                ?.filter(
                  (msg): msg is typeof msg & { sender: "black" | "white" } =>
                    msg.sender === "black" || msg.sender === "white"
                )
                .map((msg) => ({
                  ...msg,
                  isLocal: msg.sender === websocketState.playerRole,
                })) || []
            }
            onSendMessage={handleSendChatMessage}
            playerColor={
              (websocketState.playerRole as "black" | "white") || "black"
            }
          />
        )}
    </div>
  );
}
