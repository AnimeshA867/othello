import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

/**
 * Backfill endpoint to sync all Stack Auth users to database
 * This is a one-time migration endpoint to ensure all existing users are in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user (for security, only logged-in users can trigger this)
    const currentUser = await stackServerApp.getUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all Stack Auth users
    const stackUsers = await stackServerApp.listUsers();

    const results = {
      total: stackUsers.length,
      created: 0,
      existing: 0,
      errors: [] as string[],
    };

    // Process each Stack Auth user
    for (const stackUser of stackUsers) {
      try {
        // Check if user already exists in database
        const existingUser = await prisma.user.findUnique({
          where: { stackId: stackUser.id },
        });

        if (existingUser) {
          results.existing++;
          console.log(`User already exists: ${existingUser.username}`);
        } else {
          // Create new user with profile and game stats
          const newUser = await prisma.user.create({
            data: {
              stackId: stackUser.id,
              email: stackUser.primaryEmail || "",
              username:
                stackUser.displayName ||
                stackUser.primaryEmail?.split("@")[0] ||
                `user_${Date.now()}`,
              displayName: stackUser.displayName || null,
              profile: {
                create: {},
              },
              gameStats: {
                create: {},
              },
            },
          });

          results.created++;
          console.log(`Created user: ${newUser.username}`);
        }
      } catch (error) {
        const errorMsg = `Failed to process user ${stackUser.id}: ${error}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Backfill completed",
      results,
    });
  } catch (error) {
    console.error("Backfill error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
