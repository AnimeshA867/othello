import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { ensureUserExists } from "@/lib/ensure-user";
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

    const dbUser = await ensureUserExists(user);

    const currentStats = await prisma.gameStats.findUnique({
      where: { userId: dbUser.id },
    });

    if (!currentStats) {
      return NextResponse.json({ error: "Stats not found" }, { status: 500 });
    }

    const disconnectRating = currentElo ?? currentStats.eloRating;

    let eloChange = 0;
    let newElo = disconnectRating;

    // Apply ELO penalty for ranked mode disconnects — same as resign
    if (mode === "ranked") {
      // Use the bot's ELO based on the player's rating tier (same as resign)
      const botElo = disconnectRating; // Assume equal opponent
      const K = 32;
      const expectedScore =
        1 / (1 + Math.pow(10, (botElo - disconnectRating) / 400));
      const actualScore = 0; // Loss — same as resign
      eloChange = Math.round(K * (actualScore - expectedScore));
      newElo = disconnectRating + eloChange;

      // Update stats — treated as a loss + disconnect, same ELO impact as resign
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
          ? `Disconnect recorded after ${duration}s and ${moveCount} moves - ELO penalty applied (${eloChange})`
          : `Disconnect recorded after ${duration}s and ${moveCount} moves`,
    });
  } catch (error) {
    console.error("Game disconnect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
