import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    // Get sender's database user
    const sender = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found in database" },
        { status: 404 }
      );
    }

    // Get recipient's database user
    const recipient = await prisma.user.findUnique({
      where: { stackId: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Check if friend request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: sender.id, receiverId: recipient.id },
          { senderId: recipient.id, receiverId: sender.id },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Friend request already exists" },
        { status: 400 }
      );
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: sender.id, friendId: recipient.id, status: "accepted" },
          { userId: recipient.id, friendId: sender.id, status: "accepted" },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json({ error: "Already friends" }, { status: 400 });
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: sender.id,
        receiverId: recipient.id,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Friend request sent",
      request: friendRequest,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
}
