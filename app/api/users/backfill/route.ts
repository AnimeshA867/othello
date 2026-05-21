import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensure-user";

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
        const existingUser = await prisma.user.findUnique({
          where: { stackId: stackUser.id },
        });

        await ensureUserExists(stackUser);

        if (existingUser) {
          results.existing++;
          console.log(`User already exists: ${existingUser.username}`);
        } else {
          results.created++;
          console.log(`Created user: ${stackUser.id}`);
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
      { status: 500 },
    );
  }
}
