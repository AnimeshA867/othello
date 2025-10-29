import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Fetch all users with their game stats
    const users = await prisma.user.findMany({
      include: {
        gameStats: true,
      },
      where: {
        gameStats: {
          totalGames: {
            gt: 0, // Only users who have played at least one game
          },
        },
      },
    });

    // Sort and format the leaderboard
    const leaderboard = users
      .filter((user) => user.gameStats !== null)
      .sort((a, b) => {
        // Sort by ELO rating in descending order
        return (b.gameStats?.eloRating || 0) - (a.gameStats?.eloRating || 0);
      })
      .slice(0, 100) // Top 100 players
      .map((user, index) => {
        const winRate =
          user.gameStats!.totalGames > 0
            ? Math.round(
                (user.gameStats!.wins / user.gameStats!.totalGames) * 100
              )
            : 0;

        return {
          rank: index + 1,
          username: user.username,
          displayName: user.displayName || user.username,
          eloRating: user.gameStats!.eloRating,
          wins: user.gameStats!.wins,
          losses: user.gameStats!.losses,
          totalGames: user.gameStats!.totalGames,
          winRate,
        };
      });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
