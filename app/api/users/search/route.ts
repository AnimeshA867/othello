import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    // Get current user from database
    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Search users in Stack Auth
    const allUsers = await stackServerApp.listUsers();

    // Filter users based on query (search by display name or email)
    const searchQuery = query.toLowerCase();
    const matchedStackUsers = allUsers
      .filter(
        (u) =>
          u.id !== user.id && // Exclude current user
          (u.displayName?.toLowerCase().includes(searchQuery) ||
            u.primaryEmail?.toLowerCase().includes(searchQuery))
      )
      .slice(0, 10); // Limit to 10 results

    // Get database users for the matched Stack users
    const dbUsers = await prisma.user.findMany({
      where: {
        stackId: {
          in: matchedStackUsers.map((u) => u.id),
        },
      },
    });

    // Get existing friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        userId: dbUser.id,
        friendId: {
          in: dbUsers.map((u) => u.id),
        },
        status: "accepted",
      },
    });

    // Get pending friend requests (both sent and received)
    const pendingRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          {
            senderId: dbUser.id,
            receiverId: { in: dbUsers.map((u) => u.id) },
            status: "pending",
          },
          {
            receiverId: dbUser.id,
            senderId: { in: dbUsers.map((u) => u.id) },
            status: "pending",
          },
        ],
      },
    });

    const friendIds = new Set(friendships.map((f) => f.friendId));
    const pendingIds = new Set([
      ...pendingRequests.map((r) => r.senderId),
      ...pendingRequests.map((r) => r.receiverId),
    ]);

    // Map results with friendship status
    const matchedUsers = matchedStackUsers.map((u) => {
      const dbUserMatch = dbUsers.find((du) => du.stackId === u.id);
      return {
        id: u.id,
        displayName: u.displayName || "Unknown User",
        primaryEmail: u.primaryEmail || "",
        profileImageUrl: u.profileImageUrl || undefined,
        isFriend: dbUserMatch ? friendIds.has(dbUserMatch.id) : false,
        isPending: dbUserMatch ? pendingIds.has(dbUserMatch.id) : false,
      };
    });

    return NextResponse.json({ users: matchedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
