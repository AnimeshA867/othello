const assert = require("node:assert/strict");
const { findOrCreateRoom } = require("../server/controllers/roomController");

async function main() {
  const firstRoom = await findOrCreateRoom(
    "player-1",
    "Alpha",
    1200,
    "beginner",
  );

  assert.equal(firstRoom.status, "waiting");
  assert.equal(firstRoom.players.length, 1);
  assert.equal(firstRoom.players[0].color, null);

  const matchedRoom = await findOrCreateRoom(
    "player-2",
    "Bravo",
    1220,
    "beginner",
  );

  assert.equal(matchedRoom.status, "active");
  assert.equal(matchedRoom.players.length, 2);
  assert.ok(matchedRoom.players[0].color);
  assert.ok(matchedRoom.players[1].color);
  assert.notEqual(matchedRoom.players[0].color, matchedRoom.players[1].color);

  console.log("Ranked color assignment check passed.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
