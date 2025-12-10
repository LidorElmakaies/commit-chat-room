require("dotenv").config();
const { AccessToken } = require("livekit-server-sdk");

// Load credentials from .env file
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const roomName = process.env.LIVEKIT_ROOM_NAME || "Test1";

// Matrix user IDs for token generation
const user1 = process.env.MATRIX_USER_1 || "@lidor-the-programmer:matrix.org";
const user2 = process.env.MATRIX_USER_2 || "@lidor-the-programmer2:matrix.org";

// Validate required env vars
if (!apiKey || !apiSecret) {
  console.error("❌ Error: Missing required environment variables!");
  console.error(
    "Please create a .env file with LIVEKIT_API_KEY and LIVEKIT_API_SECRET"
  );
  console.error("See env.example for reference");
  process.exit(1);
}

function generate(userId) {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    ttl: "24h",
  });
  at.addGrant({ roomJoin: true, room: roomName });
  return at.toJwt();
}

(async () => {
  const token1 = await generate(user1);
  const token2 = await generate(user2);

  console.log("\n=== COPY THIS INTO CallManager.ts ===\n");
  console.log(`const TOKEN_MAP: Record<string, string> = {`);
  console.log(`  "${user1}": "${token1}",`);
  console.log(`  "${user2}": "${token2}",`);
  console.log(`};\n`);
  console.log("=====================================\n");
})();
