import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

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

    // Check if user already exists
    let dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
      include: {
        profile: true,
        gameStats: true,
      },
    });

    // If user doesn't exist, create them
    if (!dbUser) {
      console.log(`Creating new user in database: ${user.id}`);

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

      console.log(`User created successfully: ${dbUser.username}`);
    }

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
      { status: 500 }
    );
  }
}
