#!/usr/bin/env node

const WebSocket = require("ws");

console.log("🧪 Testing Othello Multiplayer WebSocket Flow");

// Create first player (room creator)
const player1 = new WebSocket("ws://localhost:3003");
let roomId = null;

player1.on("open", () => {
  console.log("👤 Player 1 connected");

  // Create a room
  player1.send(
    JSON.stringify({
      type: "create_room",
      playerName: "TestPlayer1",
    })
  );
});

player1.on("message", (data) => {
  const message = JSON.parse(data.toString());
  console.log("👤 Player 1 received:", message.type, message);

  if (message.type === "room_created") {
    roomId = message.roomId;
    console.log(`🏠 Room created: ${roomId}`);

    // Now create second player
    setTimeout(() => {
      createPlayer2();
    }, 1000);
  }
});

function createPlayer2() {
  if (!roomId) {
    console.log("❌ No room ID available");
    return;
  }

  console.log("👤 Creating Player 2...");
  const player2 = new WebSocket("ws://localhost:3003");

  player2.on("open", () => {
    console.log("👤 Player 2 connected");

    // Join the room
    player2.send(
      JSON.stringify({
        type: "join_room",
        roomId: roomId,
        playerName: "TestPlayer2",
      })
    );
  });

  player2.on("message", (data) => {
    const message = JSON.parse(data.toString());
    console.log("👤 Player 2 received:", message.type, message);

    if (message.type === "game_ready") {
      console.log("🎮 ✅ SUCCESS: Game is ready! Both players can now play.");

      // Close connections after success
      setTimeout(() => {
        player1.close();
        player2.close();
        process.exit(0);
      }, 2000);
    }
  });

  player2.on("error", (error) => {
    console.log("❌ Player 2 error:", error);
  });
}

player1.on("error", (error) => {
  console.log("❌ Player 1 error:", error);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log("⏰ Test timeout - closing connections");
  process.exit(1);
}, 10000);
