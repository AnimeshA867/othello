import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { ensureUserExists } from "@/lib/ensure-user";

/**
 * Initialize or get user in database
 * This endpoint ensures that Stack Auth users are automatically created in our database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await ensureUserExists(user);

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        stackId: dbUser.stackId,
        username: dbUser.username,
        displayName: dbUser.displayName,
        email: dbUser.email,
        eloRating: dbUser.gameStats?.eloRating || 1200,
      },
    });
  } catch (error) {
    console.error("User initialization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
