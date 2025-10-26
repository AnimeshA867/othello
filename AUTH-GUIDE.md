# 🔐 Authentication & User System Guide

## Overview

Your Othello game now has a complete authentication system with user profiles, stats tracking, and rankings built with:

- **Stack Auth** - Authentication provider
- **Prisma** - Database ORM
- **Neon** - PostgreSQL database
- **Next.js 15** - Full-stack framework

## ✅ What's Implemented

### 1. Authentication System

- ✅ Sign In / Sign Up pages
- ✅ OAuth integration (Google, GitHub)
- ✅ Email/password authentication
- ✅ Session management
- ✅ Protected routes
- ✅ User dropdown menu

### 2. Database Schema

Complete Prisma schema with the following models:

#### **User** - Core user data

- Stack Auth ID integration
- Email, username, display name
- Avatar URL and bio
- Created/updated timestamps

#### **UserProfile** - Extended profile info

- Country and timezone
- Preferred color (black/white)
- Privacy settings
- Challenge preferences

#### **GameStats** - Performance tracking

- Total games, wins, losses, draws
- Mode-specific stats (AI, multiplayer, ranked)
- ELO rating system
- Win streaks (current and longest)
- Additional metrics (perfect games, etc.)

#### **RankedMatch** - Match history

- Player IDs (black and white)
- Game data (moves, board state)
- ELO changes for both players
- Final scores and duration

#### **Achievement** - Achievement definitions

- Unique keys and names
- Descriptions and icons
- Categories and rarity
- Point values

#### **UserAchievement** - Unlocked achievements

- User-achievement relationship
- Unlock timestamps

#### **Friendship** - Social connections

- Friend requests and status
- Bidirectional relationships

#### **Leaderboard** - Performance cache

- Ranking cache for faster queries
- ELO-based sorting

### 3. User Interface

#### Sign In Page (`/auth/signin`)

- Google OAuth button
- GitHub OAuth button
- Email sign-in option
- Link to sign up

#### Sign Up Page (`/auth/signup`)

- Same OAuth options
- New account creation
- Link to sign in

#### Profile Page (`/profile`)

- User information display
- Editable profile fields
- Comprehensive stats dashboard
- Multiple tabs:
  - Overview (bio, country, join date)
  - Detailed Stats (all game metrics)
  - Match History (coming soon)
  - Achievements (coming soon)

#### Leaderboard Page (`/leaderboard`)

- Global rankings by ELO
- Top 100 players
- Win/loss records
- Responsive design

#### Enhanced Navbar

- Sign In / Sign Up buttons (when logged out)
- User dropdown menu (when logged in)
  - Profile link
  - Leaderboard link
  - Settings link
  - Sign out option

### 4. API Routes

#### `/api/profile` - User profile management

- **GET**: Fetch user profile and stats
- **PUT**: Update profile information
- Auto-creates user on first access
- Returns calculated stats (win rate, etc.)

#### `/api/leaderboard` - Rankings

- **GET**: Fetch top 100 players
- Sorted by ELO rating
- Includes win/loss records

## 🚀 How to Use

### For Users

1. **Create an Account**

   - Visit `/auth/signup`
   - Choose OAuth provider or email
   - Complete registration

2. **Sign In**

   - Visit `/auth/signin`
   - Use same OAuth provider or email
   - Redirects to profile after login

3. **View Profile**

   - Click your name in the navbar
   - Select "Profile"
   - View stats and edit profile

4. **Check Rankings**
   - Click "Leaderboard" in navbar
   - See global rankings
   - Track your position

### For Developers

#### Get Current User

```typescript
"use client";
import { useUser } from "@stackframe/stack";

export default function Component() {
  const user = useUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  return <div>Hello, {user.displayName}!</div>;
}
```

#### Protect Routes

```typescript
"use client";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
    }
  }, [user, router]);

  if (!user) return null;

  return <div>Protected content</div>;
}
```

#### Access User in API Routes

```typescript
import { stackServerApp } from "@/lib/stack";

export async function GET() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use user data
  return Response.json({ userId: user.id });
}
```

#### Database Operations

```typescript
import { prisma } from "@/lib/prisma";

// Get user with stats
const user = await prisma.user.findUnique({
  where: { stackId: stackUserId },
  include: {
    profile: true,
    gameStats: true,
  },
});

// Update stats after game
await prisma.gameStats.update({
  where: { userId: user.id },
  data: {
    totalGames: { increment: 1 },
    wins: { increment: won ? 1 : 0 },
    eloRating: newElo,
  },
});

// Create ranked match record
await prisma.rankedMatch.create({
  data: {
    blackPlayerId: blackPlayer.id,
    whitePlayerId: whitePlayer.id,
    winnerId: winner?.id,
    gameData: JSON.stringify(gameState),
    duration: gameDuration,
    blackEloChange: blackEloChange,
    whiteEloChange: whiteEloChange,
    blackEloAfter: blackNewElo,
    whiteEloAfter: whiteNewElo,
    blackScore: blackScore,
    whiteScore: whiteScore,
  },
});
```

## 📊 Next Steps: Integrating with Game Modes

### 1. Track AI Game Results

When a game against AI ends:

```typescript
// In your AI game component
const handleGameEnd = async (result: GameResult) => {
  if (!user) return; // Only track for logged-in users

  await fetch("/api/games/record", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "ai",
      won: result.winner === "player",
      score: result.score,
      duration: result.duration,
    }),
  });
};
```

### 2. Connect Ranked Mode

For ranked multiplayer games:

```typescript
// When ranked game ends
const recordRankedGame = async (gameData: RankedGameData) => {
  await fetch("/api/games/ranked", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      opponentId: opponent.id,
      color: playerColor, // "black" or "white"
      winner: gameData.winner,
      moves: gameData.moves,
      finalScore: gameData.score,
      duration: gameData.duration,
    }),
  });
};
```

### 3. Create Achievement System

Trigger achievements based on stats:

```typescript
// Check for achievements after updating stats
const checkAchievements = async (userId: string, stats: GameStats) => {
  const newAchievements = [];

  // First win
  if (stats.wins === 1) {
    newAchievements.push("first_win");
  }

  // Win streak milestones
  if (stats.currentWinStreak >= 5) {
    newAchievements.push("win_streak_5");
  }

  // Unlock achievements
  for (const achievementKey of newAchievements) {
    await unlockAchievement(userId, achievementKey);
  }
};
```

### 4. Implement Friend System

```typescript
// Send friend request
await fetch("/api/friends/request", {
  method: "POST",
  body: JSON.stringify({ friendUsername }),
});

// Accept friend request
await fetch("/api/friends/accept", {
  method: "POST",
  body: JSON.stringify({ friendshipId }),
});

// Challenge friend to game
const challengeFriend = (friendId: string) => {
  // Create private game room
  // Send invite via WebSocket
};
```

## 🔒 Security Best Practices

### Environment Variables

Never expose secret keys in client-side code:

```env
# Client-side (safe to expose)
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...

# Server-side only (keep secret)
STACK_SECRET_SERVER_KEY=...
DATABASE_URL=...
```

### API Route Protection

Always verify user authentication:

```typescript
export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process authenticated request
}
```

### Database Security

- ✅ Use Prisma's parameterized queries (prevents SQL injection)
- ✅ Validate all user input
- ✅ Use unique constraints on critical fields
- ✅ Cascade deletes for data consistency

## 📈 ELO Rating System

The ELO system is ready to implement. Here's how it works:

### Basic Formula

```typescript
function calculateElo(
  playerRating: number,
  opponentRating: number,
  won: boolean,
  k: number = 32
): number {
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const actualScore = won ? 1 : 0;
  const change = Math.round(k * (actualScore - expectedScore));
  return playerRating + change;
}

// Example usage
const newElo = calculateElo(1200, 1300, true); // Player won
// Returns approximately 1223 (gained 23 points)
```

### K-Factor (Rating Volatility)

- **Beginners** (< 2100 rating): K = 32 (fast adjustment)
- **Intermediate** (2100-2400): K = 24
- **Expert** (> 2400): K = 16 (slower changes)

### Rank Tiers

```typescript
function getRank(elo: number): string {
  if (elo >= 2400) return "Grand Master";
  if (elo >= 2200) return "Master";
  if (elo >= 2000) return "Expert";
  if (elo >= 1800) return "Advanced";
  if (elo >= 1600) return "Intermediate";
  if (elo >= 1400) return "Competent";
  if (elo >= 1200) return "Novice";
  return "Beginner";
}
```

## 🎯 Monetization Integration

With user accounts, you can now implement:

### 1. Premium Subscriptions

```typescript
// Add to User model
model User {
  // ... existing fields
  isPremium     Boolean  @default(false)
  premiumUntil  DateTime?
}

// Check premium status
if (user.isPremium && user.premiumUntil > new Date()) {
  // Grant premium features
  - Remove ads
  - Unlimited games
  - Advanced analytics
  - Custom themes
}
```

### 2. Virtual Currency

```typescript
model User {
  // ... existing fields
  coins  Int @default(0)
}

// Earn coins
- Daily login bonus
- Win games
- Complete achievements
- Watch ads

// Spend coins
- Unlock themes
- Buy power-ups
- Entry fees for tournaments
```

### 3. Tournament System

```typescript
model Tournament {
  id          String   @id @default(cuid())
  name        String
  entryFee    Int      @default(0) // in coins or real money
  prizePool   Int
  startDate   DateTime
  status      String   // "upcoming", "active", "completed"
  participants User[]
  matches     TournamentMatch[]
}
```

## 🐛 Troubleshooting

### "User not found" Error

1. Check Stack Auth configuration
2. Verify environment variables
3. Clear cookies and re-login
4. Check database connection

### Profile Not Updating

1. Check network tab for errors
2. Verify API route is accessible
3. Check Prisma client is generated
4. Verify database connectivity

### Leaderboard Empty

1. Ensure users have played games
2. Check `totalGames > 0` filter
3. Verify ELO ratings are set
4. Check database queries

## 📚 Additional Resources

- [Stack Auth Docs](https://docs.stack-auth.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## ✨ Summary

You now have a complete authentication and user management system with:

- ✅ Sign in/sign up functionality
- ✅ User profiles with editable information
- ✅ Comprehensive stats tracking
- ✅ Global leaderboard
- ✅ Database schema ready for rankings and social features
- ✅ API routes for all user operations
- ✅ Protected routes and session management
- ✅ Foundation for achievements, friends, and tournaments

**Next**: Integrate game result tracking with the stats system and implement the ranking algorithm!
