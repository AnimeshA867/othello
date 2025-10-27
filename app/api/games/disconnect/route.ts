import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

interface DisconnectGameRequest {
  mode: "friend" | "ranked"; // Game mode
  duration: number; // in seconds
  moveCount: number; // number of moves made (excluding initial 4 pieces)
  currentElo?: number; // Player's ELO before disconnect
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: DisconnectGameRequest = await request.json();
    const { mode, duration, moveCount, currentElo } = body;

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

    let eloChange = 0;
    let newElo = currentStats.eloRating;

    // Apply ELO penalty only for ranked mode disconnects
    if (mode === "ranked") {
      // Calculate ELO loss for disconnect (treated as loss)
      const opponentElo = currentStats.eloRating; // Assume equal opponent
      const K = 32;
      const expectedScore =
        1 / (1 + Math.pow(10, (opponentElo - currentStats.eloRating) / 400));
      const actualScore = 0; // Loss
      eloChange = Math.round(K * (actualScore - expectedScore));
      newElo = currentStats.eloRating + eloChange;

      // Update stats with disconnect tracking and ELO penalty
      await prisma.gameStats.update({
        where: { userId: dbUser.id },
        data: {
          disconnects: { increment: 1 },
          eloRating: newElo,
          losses: { increment: 1 },
          totalGames: { increment: 1 },
          rankedGames: { increment: 1 },
          currentWinStreak: 0, // Reset win streak
        },
      });
    } else {
      // For friend mode, just track disconnect without ELO penalty
      await prisma.gameStats.update({
        where: { userId: dbUser.id },
        data: {
          disconnects: { increment: 1 },
        },
      });
    }

    // Get updated stats
    const updatedStats = await prisma.gameStats.findUnique({
      where: { userId: dbUser.id },
    });

    // Calculate disconnect rate for abuse detection
    const totalGames = updatedStats ? updatedStats.totalGames : 0;
    const disconnectRate =
      updatedStats && totalGames > 0
        ? updatedStats.disconnects / totalGames
        : 0;

    return NextResponse.json({
      success: true,
      mode,
      disconnects: updatedStats?.disconnects || 0,
      disconnectRate: Math.round(disconnectRate * 100),
      eloChange: mode === "ranked" ? eloChange : 0,
      newElo: mode === "ranked" ? newElo : currentStats.eloRating,
      warning: disconnectRate > 0.2 ? "High disconnect rate detected" : null,
      message:
        mode === "ranked"
          ? `Disconnect recorded - ELO penalty applied (${eloChange})`
          : "Disconnect recorded",
    });
  } catch (error) {
    console.error("Game disconnect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
