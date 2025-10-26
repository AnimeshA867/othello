import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  // First wins
  {
    id: "first-win",
    key: "first_win",
    name: "First Victory",
    description: "Win your first game",
    icon: "🎯",
    category: "milestone",
    rarity: "common",
    points: 10,
  },

  // Win streaks
  {
    id: "win-streak-3",
    key: "win_streak_3",
    name: "On a Roll",
    description: "Win 3 games in a row",
    icon: "🔥",
    category: "streak",
    rarity: "common",
    points: 25,
  },
  {
    id: "win-streak-5",
    key: "win_streak_5",
    name: "Unstoppable",
    description: "Win 5 games in a row",
    icon: "⚡",
    category: "streak",
    rarity: "rare",
    points: 50,
  },
  {
    id: "win-streak-10",
    key: "win_streak_10",
    name: "Legendary Streak",
    description: "Win 10 games in a row",
    icon: "👑",
    category: "streak",
    rarity: "epic",
    points: 100,
  },

  // Perfect games
  {
    id: "perfect-game",
    key: "perfect_game",
    name: "Flawless Victory",
    description: "Win a game 64-0",
    icon: "💎",
    category: "special",
    rarity: "legendary",
    points: 75,
  },

  // AI victories
  {
    id: "ai-beginner",
    key: "ai_beginner",
    name: "AI Conqueror",
    description: "Beat the AI for the first time",
    icon: "🤖",
    category: "ai",
    rarity: "common",
    points: 15,
  },
  {
    id: "ai-intermediate",
    key: "ai_intermediate",
    name: "AI Hunter",
    description: "Win 10 games against AI",
    icon: "🎮",
    category: "ai",
    rarity: "rare",
    points: 40,
  },
  {
    id: "ai-expert",
    key: "ai_expert",
    name: "AI Master",
    description: "Win 50 games against AI",
    icon: "🏆",
    category: "ai",
    rarity: "epic",
    points: 100,
  },

  // Ranked milestones
  {
    id: "ranked-novice",
    key: "ranked_novice",
    name: "Ranked Beginner",
    description: "Play 10 ranked games",
    icon: "🥉",
    category: "ranked",
    rarity: "common",
    points: 20,
  },
  {
    id: "ranked-veteran",
    key: "ranked_veteran",
    name: "Ranked Veteran",
    description: "Play 50 ranked games",
    icon: "🥈",
    category: "ranked",
    rarity: "rare",
    points: 60,
  },
  {
    id: "ranked-master",
    key: "ranked_master",
    name: "Ranked Master",
    description: "Play 100 ranked games",
    icon: "🥇",
    category: "ranked",
    rarity: "epic",
    points: 150,
  },

  // Total games
  {
    id: "games-played-10",
    key: "games_played_10",
    name: "Getting Started",
    description: "Play 10 total games",
    icon: "🎯",
    category: "milestone",
    rarity: "common",
    points: 15,
  },
  {
    id: "games-played-50",
    key: "games_played_50",
    name: "Dedicated Player",
    description: "Play 50 total games",
    icon: "🌟",
    category: "milestone",
    rarity: "rare",
    points: 50,
  },
  {
    id: "games-played-100",
    key: "games_played_100",
    name: "Century Club",
    description: "Play 100 total games",
    icon: "💯",
    category: "milestone",
    rarity: "epic",
    points: 100,
  },

  // ELO milestones
  {
    id: "elo-1500",
    key: "elo_1500",
    name: "Rising Star",
    description: "Reach 1500 ELO rating",
    icon: "⭐",
    category: "elo",
    rarity: "rare",
    points: 50,
  },
  {
    id: "elo-1800",
    key: "elo_1800",
    name: "Expert Player",
    description: "Reach 1800 ELO rating",
    icon: "🌟",
    category: "elo",
    rarity: "epic",
    points: 100,
  },
  {
    id: "elo-2000",
    key: "elo_2000",
    name: "Elite Master",
    description: "Reach 2000 ELO rating",
    icon: "👑",
    category: "elo",
    rarity: "legendary",
    points: 200,
  },
];

async function main() {
  console.log("Seeding achievements...");

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements`);
}

main()
  .catch((e) => {
    console.error("Error seeding achievements:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
