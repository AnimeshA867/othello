import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { ensureUserExists } from "@/lib/ensure-user";
import { prisma } from "@/lib/prisma";

interface AbandonGameRequest {
  mode: "friend" | "ranked"; // Game mode
  duration: number; // in seconds
  moveCount: number; // number of moves made (excluding initial 4 pieces)
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: AbandonGameRequest = await request.json();
    const { mode, duration, moveCount } = body;

    const dbUser = await ensureUserExists(user);

    // Increment abandon count for tracking purposes
    // Abandons are early game quits (≤1 move per player, ≤2 total moves)
    // No ELO penalty for abandons
    await prisma.gameStats.update({
      where: { userId: dbUser.id },
      data: {
        abandons: { increment: 1 },
      },
    });

    // Get updated stats
    const updatedStats = await prisma.gameStats.findUnique({
      where: { userId: dbUser.id },
    });

    // Calculate abandon rate for abuse detection
    const totalMultiplayerGames = updatedStats
      ? mode === "ranked"
        ? updatedStats.rankedGames
        : updatedStats.multiplayerGames
      : 0;

    const abandonRate =
      updatedStats && totalMultiplayerGames > 0
        ? updatedStats.abandons / totalMultiplayerGames
        : 0;

    return NextResponse.json({
      success: true,
      mode,
      abandons: updatedStats?.abandons || 0,
      abandonRate: Math.round(abandonRate * 100),
      warning: abandonRate > 0.3 ? "High abandon rate detected" : null,
      message: "Game abandoned - no ELO penalty applied",
    });
  } catch (error) {
    console.error("Game abandon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
