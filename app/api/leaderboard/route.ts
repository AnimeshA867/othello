import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        gameStats: true,
      },
      orderBy: {
        gameStats: {
          eloRating: "desc",
        },
      },
      take: 100, // Top 100 players
    });

    const leaderboard = users
      .filter((user) => user.gameStats && user.gameStats.totalGames > 0)
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
