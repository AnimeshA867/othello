import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Fetch pending friend requests where user is the receiver
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: dbUser.id,
        status: "pending",
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get Stack Auth user info for senders
    const allStackUsers = await stackServerApp.listUsers();
    const requestsWithStackInfo = requests.map((req) => {
      const stackUser = allStackUsers.find((u) => u.id === req.sender.stackId);
      return {
        id: req.id,
        displayName:
          stackUser?.displayName || req.sender.displayName || "Unknown User",
        primaryEmail: stackUser?.primaryEmail || req.sender.email,
        profileImageUrl: stackUser?.profileImageUrl || req.sender.avatarUrl,
        isFriend: false,
        isPending: true,
      };
    });

    return NextResponse.json({ requests: requestsWithStackInfo });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch friend requests" },
      { status: 500 }
    );
  }
}
