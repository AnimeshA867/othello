import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

interface RankedGameRequest {
  opponentStackId: string;
  playerColor: "black" | "white";
  winnerId?: string; // null for draw
  gameData: any; // moves, board state, etc.
  duration: number;
  blackScore: number;
  whiteScore: number;
}

// ELO calculation function
function calculateElo(
  playerRating: number,
  opponentRating: number,
  result: number, // 1 for win, 0.5 for draw, 0 for loss
  k: number = 32
): { newRating: number; change: number } {
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const change = Math.round(k * (result - expectedScore));
  const newRating = playerRating + change;

  return { newRating, change };
}

// Get K-factor based on rating
function getKFactor(rating: number): number {
  if (rating >= 2400) return 16;
  if (rating >= 2100) return 24;
  return 32;
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RankedGameRequest = await request.json();
    const {
      opponentStackId,
      playerColor,
      winnerId,
      gameData,
      duration,
      blackScore,
      whiteScore,
    } = body;

    // Get both players from database
    const [player, opponent] = await Promise.all([
      prisma.user.findUnique({
        where: { stackId: user.id },
        include: { gameStats: true },
      }),
      prisma.user.findUnique({
        where: { stackId: opponentStackId },
        include: { gameStats: true },
      }),
    ]);

    if (!player || !opponent) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (!player.gameStats || !opponent.gameStats) {
      return NextResponse.json(
        { error: "Player stats not initialized" },
        { status: 400 }
      );
    }

    // Determine who is black and white
    const isPlayerBlack = playerColor === "black";
    const blackPlayer = isPlayerBlack ? player : opponent;
    const whitePlayer = isPlayerBlack ? opponent : player;
    const blackStats = blackPlayer.gameStats!;
    const whiteStats = whitePlayer.gameStats!;

    // Determine result for each player
    const isDraw = !winnerId;
    let blackResult: number;
    let whiteResult: number;

    if (isDraw) {
      blackResult = 0.5;
      whiteResult = 0.5;
    } else {
      blackResult = winnerId === blackPlayer.id ? 1 : 0;
      whiteResult = winnerId === whitePlayer.id ? 1 : 0;
    }

    // Calculate ELO changes
    const blackKFactor = getKFactor(blackStats.eloRating);
    const whiteKFactor = getKFactor(whiteStats.eloRating);

    const blackEloCalc = calculateElo(
      blackStats.eloRating,
      whiteStats.eloRating,
      blackResult,
      blackKFactor
    );

    const whiteEloCalc = calculateElo(
      whiteStats.eloRating,
      blackStats.eloRating,
      whiteResult,
      whiteKFactor
    );

    // Create ranked match record
    await prisma.rankedMatch.create({
      data: {
        blackPlayerId: blackPlayer.id,
        whitePlayerId: whitePlayer.id,
        winnerId: winnerId || null,
        gameData: JSON.stringify(gameData),
        duration,
        blackEloChange: blackEloCalc.change,
        whiteEloChange: whiteEloCalc.change,
        blackEloAfter: blackEloCalc.newRating,
        whiteEloAfter: whiteEloCalc.newRating,
        blackScore,
        whiteScore,
      },
    });

    // Update both players' stats
    await Promise.all([
      // Update black player
      prisma.gameStats.update({
        where: { userId: blackPlayer.id },
        data: {
          totalGames: { increment: 1 },
          rankedGames: { increment: 1 },
          wins: blackResult === 1 ? { increment: 1 } : undefined,
          losses: blackResult === 0 ? { increment: 1 } : undefined,
          draws: isDraw ? { increment: 1 } : undefined,
          rankedWins: blackResult === 1 ? { increment: 1 } : undefined,
          eloRating: blackEloCalc.newRating,
          peakEloRating: Math.max(
            blackStats.peakEloRating,
            blackEloCalc.newRating
          ),
          currentWinStreak: blackResult === 1 ? { increment: 1 } : 0,
          longestWinStreak:
            blackResult === 1
              ? Math.max(
                  blackStats.longestWinStreak,
                  blackStats.currentWinStreak + 1
                )
              : blackStats.longestWinStreak,
        },
      }),
      // Update white player
      prisma.gameStats.update({
        where: { userId: whitePlayer.id },
        data: {
          totalGames: { increment: 1 },
          rankedGames: { increment: 1 },
          wins: whiteResult === 1 ? { increment: 1 } : undefined,
          losses: whiteResult === 0 ? { increment: 1 } : undefined,
          draws: isDraw ? { increment: 1 } : undefined,
          rankedWins: whiteResult === 1 ? { increment: 1 } : undefined,
          eloRating: whiteEloCalc.newRating,
          peakEloRating: Math.max(
            whiteStats.peakEloRating,
            whiteEloCalc.newRating
          ),
          currentWinStreak: whiteResult === 1 ? { increment: 1 } : 0,
          longestWinStreak:
            whiteResult === 1
              ? Math.max(
                  whiteStats.longestWinStreak,
                  whiteStats.currentWinStreak + 1
                )
              : whiteStats.longestWinStreak,
        },
      }),
    ]);

    // Return results
    const playerIsBlack = player.id === blackPlayer.id;
    const playerEloChange = playerIsBlack
      ? blackEloCalc.change
      : whiteEloCalc.change;
    const playerNewElo = playerIsBlack
      ? blackEloCalc.newRating
      : whiteEloCalc.newRating;

    return NextResponse.json({
      success: true,
      eloChange: playerEloChange,
      newElo: playerNewElo,
      result: isDraw ? "draw" : winnerId === player.id ? "win" : "loss",
    });
  } catch (error) {
    console.error("Ranked game record error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
