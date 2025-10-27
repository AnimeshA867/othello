import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

interface RecordGameRequest {
  mode: "ai" | "friend" | "ranked";
  won: boolean;
  draw?: boolean;
  score: number;
  opponentScore: number;
  duration: number; // in seconds
  difficulty?: string; // for AI games
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RecordGameRequest = await request.json();
    const { mode, won, draw, score, opponentScore, duration, difficulty } =
      body;

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
      include: { gameStats: true },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          stackId: user.id,
          email: user.primaryEmail || "",
          username:
            user.displayName ||
            user.primaryEmail?.split("@")[0] ||
            `user_${Date.now()}`,
          displayName: user.displayName || null,
          profile: { create: {} },
          gameStats: { create: {} },
        },
        include: { gameStats: true },
      });
    }

    if (!dbUser.gameStats) {
      await prisma.gameStats.create({
        data: { userId: dbUser.id },
      });
    }

    const currentStats = await prisma.gameStats.findUnique({
      where: { userId: dbUser.id },
    });

    if (!currentStats) {
      return NextResponse.json({ error: "Stats not found" }, { status: 500 });
    }

    // Calculate new win streak
    let newWinStreak = currentStats.currentWinStreak;
    let newLongestStreak = currentStats.longestWinStreak;

    if (won) {
      newWinStreak += 1;
      if (newWinStreak > newLongestStreak) {
        newLongestStreak = newWinStreak;
      }
    } else if (!draw) {
      newWinStreak = 0;
    }

    // Check for perfect game (64-0)
    const isPerfectGame = won && score === 64 && opponentScore === 0;

    // Update stats based on game mode
    const updateData: any = {
      totalGames: { increment: 1 },
      currentWinStreak: newWinStreak,
      longestWinStreak: newLongestStreak,
    };

    if (won) {
      updateData.wins = { increment: 1 };
    } else if (draw) {
      updateData.draws = { increment: 1 };
    } else {
      updateData.losses = { increment: 1 };
    }

    if (isPerfectGame) {
      updateData.perfectGames = { increment: 1 };
    }

    // Mode-specific tracking
    if (mode === "ai") {
      updateData.aiGames = { increment: 1 };
      if (won) {
        updateData.aiWins = { increment: 1 };
      }
    } else if (mode === "friend") {
      updateData.multiplayerGames = { increment: 1 };
      if (won) {
        updateData.multiplayerWins = { increment: 1 };
      }
    } else if (mode === "ranked") {
      updateData.rankedGames = { increment: 1 };
      if (won) {
        updateData.rankedWins = { increment: 1 };
      }
    }

    // Update total pieces flipped (approximate)
    const piecesFlipped = Math.abs(score - opponentScore);
    updateData.totalPiecesFlipped = { increment: piecesFlipped };

    // Update average game time
    const totalGames = currentStats.totalGames + 1;
    const currentTotalTime =
      currentStats.averageGameTime * currentStats.totalGames;
    const newAverageTime = Math.round(
      (currentTotalTime + duration) / totalGames
    );
    updateData.averageGameTime = newAverageTime;

    // For ranked mode, calculate and update ELO
    if (mode === "ranked") {
      // Determine bot ELO based on difficulty
      let botElo = 1400; // Default medium
      if (difficulty === "easy") {
        botElo = 1000;
      } else if (difficulty === "hard") {
        botElo = 1800;
      }

      const K = 32;
      const expectedScore =
        1 / (1 + Math.pow(10, (botElo - currentStats.eloRating) / 400));
      const actualScore = won ? 1 : draw ? 0.5 : 0;
      const eloChange = Math.round(K * (actualScore - expectedScore));
      const newElo = currentStats.eloRating + eloChange;

      updateData.eloRating = newElo;
      updateData.peakEloRating = Math.max(currentStats.peakEloRating, newElo);
    }

    // Update stats
    await prisma.gameStats.update({
      where: { userId: dbUser.id },
      data: updateData,
    });

    // Update rank based on total games and win rate
    const newStats = await prisma.gameStats.findUnique({
      where: { userId: dbUser.id },
    });

    if (newStats) {
      const winRate =
        newStats.totalGames > 0
          ? (newStats.wins / newStats.totalGames) * 100
          : 0;

      let newRank = "Beginner";

      if (newStats.totalGames >= 100 && winRate >= 70) {
        newRank = "Grand Master";
      } else if (newStats.totalGames >= 75 && winRate >= 65) {
        newRank = "Master";
      } else if (newStats.totalGames >= 50 && winRate >= 60) {
        newRank = "Expert";
      } else if (newStats.totalGames >= 30 && winRate >= 55) {
        newRank = "Advanced";
      } else if (newStats.totalGames >= 20 && winRate >= 50) {
        newRank = "Intermediate";
      } else if (newStats.totalGames >= 10 && winRate >= 45) {
        newRank = "Competent";
      } else if (newStats.totalGames >= 5) {
        newRank = "Novice";
      }

      await prisma.gameStats.update({
        where: { userId: dbUser.id },
        data: { rank: newRank },
      });
    }

    return NextResponse.json({
      success: true,
      stats: newStats,
    });
  } catch (error) {
    console.error("Game record error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
