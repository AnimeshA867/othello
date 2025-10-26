import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
      include: {
        profile: true,
        gameStats: true,
      },
    });

    if (!dbUser) {
      // Create new user with default data
      dbUser = await prisma.user.create({
        data: {
          stackId: user.id,
          email: user.primaryEmail || "",
          username:
            user.displayName ||
            user.primaryEmail?.split("@")[0] ||
            `user_${Date.now()}`,
          displayName: user.displayName || null,
          profile: {
            create: {},
          },
          gameStats: {
            create: {},
          },
        },
        include: {
          profile: true,
          gameStats: true,
        },
      });
    }

    // Calculate win rate
    const winRate =
      dbUser.gameStats!.totalGames > 0
        ? Math.round(
            (dbUser.gameStats!.wins / dbUser.gameStats!.totalGames) * 100
          )
        : 0;

    return NextResponse.json({
      username: dbUser.username,
      displayName: dbUser.displayName || dbUser.username,
      bio: dbUser.bio || "",
      country: dbUser.profile?.country || "",
      stats: {
        totalGames: dbUser.gameStats!.totalGames,
        wins: dbUser.gameStats!.wins,
        losses: dbUser.gameStats!.losses,
        draws: dbUser.gameStats!.draws,
        eloRating: dbUser.gameStats!.eloRating,
        rank: dbUser.gameStats!.rank,
        winRate,
        currentWinStreak: dbUser.gameStats!.currentWinStreak,
        longestWinStreak: dbUser.gameStats!.longestWinStreak,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, bio, country } = body;

    // Update user
    const updated = await prisma.user.update({
      where: { stackId: user.id },
      data: {
        displayName,
        bio,
        profile: {
          update: {
            country,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
