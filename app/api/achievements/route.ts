import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

// Get user's achievements
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            unlockedAt: "desc",
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      achievements: dbUser.achievements,
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Check and unlock achievements based on user stats
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
      include: {
        gameStats: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!dbUser || !dbUser.gameStats) {
      return NextResponse.json(
        { error: "User stats not found" },
        { status: 404 }
      );
    }

    const stats = dbUser.gameStats;
    const unlockedAchievements = dbUser.achievements.map(
      (ua: any) => ua.achievementId
    );
    const newlyUnlocked: any[] = [];

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();

    // Check each achievement
    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedAchievements.includes(achievement.id)) {
        continue;
      }

      let shouldUnlock = false;

      // Check achievement criteria
      switch (achievement.id) {
        case "first-win":
          shouldUnlock = stats.wins >= 1;
          break;
        case "win-streak-3":
          shouldUnlock = stats.longestWinStreak >= 3;
          break;
        case "win-streak-5":
          shouldUnlock = stats.longestWinStreak >= 5;
          break;
        case "win-streak-10":
          shouldUnlock = stats.longestWinStreak >= 10;
          break;
        case "perfect-game":
          shouldUnlock = stats.perfectGames >= 1;
          break;
        case "ai-beginner":
          shouldUnlock = stats.aiWins >= 1;
          break;
        case "ai-intermediate":
          shouldUnlock = stats.aiWins >= 10;
          break;
        case "ai-expert":
          shouldUnlock = stats.aiWins >= 50;
          break;
        case "ranked-novice":
          shouldUnlock = stats.rankedGames >= 10;
          break;
        case "ranked-veteran":
          shouldUnlock = stats.rankedGames >= 50;
          break;
        case "ranked-master":
          shouldUnlock = stats.rankedGames >= 100;
          break;
        case "games-played-10":
          shouldUnlock = stats.totalGames >= 10;
          break;
        case "games-played-50":
          shouldUnlock = stats.totalGames >= 50;
          break;
        case "games-played-100":
          shouldUnlock = stats.totalGames >= 100;
          break;
        case "elo-1500":
          shouldUnlock = stats.eloRating >= 1500;
          break;
        case "elo-1800":
          shouldUnlock = stats.eloRating >= 1800;
          break;
        case "elo-2000":
          shouldUnlock = stats.eloRating >= 2000;
          break;
      }

      // Unlock the achievement
      if (shouldUnlock) {
        const userAchievement = await prisma.userAchievement.create({
          data: {
            userId: dbUser.id,
            achievementId: achievement.id,
          },
          include: {
            achievement: true,
          },
        });
        newlyUnlocked.push(userAchievement);
      }
    }

    return NextResponse.json({
      newlyUnlocked,
      message:
        newlyUnlocked.length > 0
          ? `Unlocked ${newlyUnlocked.length} new achievement(s)!`
          : "No new achievements unlocked",
    });
  } catch (error) {
    console.error("Check achievements error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
