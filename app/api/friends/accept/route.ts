import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

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

    // Get the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: { sender: true, receiver: true },
    });

    if (!friendRequest) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    // Verify the current user is the receiver
    if (friendRequest.receiverId !== dbUser.id) {
      return NextResponse.json(
        { error: "Unauthorized to accept this request" },
        { status: 403 }
      );
    }

    // Update friend request status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "accepted" },
    });

    // Create bidirectional friendship records
    await prisma.friendship.createMany({
      data: [
        {
          userId: friendRequest.receiverId,
          friendId: friendRequest.senderId,
          status: "accepted",
        },
        {
          userId: friendRequest.senderId,
          friendId: friendRequest.receiverId,
          status: "accepted",
        },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return NextResponse.json(
      { error: "Failed to accept friend request" },
      { status: 500 }
    );
  }
}
