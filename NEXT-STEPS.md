# Next Steps - Othello v2 Authentication Integration

## Immediate Tasks (High Priority)

### 1. Seed Achievements Database

**File**: `prisma/seed-achievements.ts`

- [x] Script created with 17 achievements
- [ ] Fix database connection for script execution
- [ ] Run: `bunx tsx prisma/seed-achievements.ts`
- [ ] Verify achievements in database

### 2. Connect Ranked Game Mode

**File**: `app/(shared)/game/ranked/page.tsx`

- [ ] Add stat tracking similar to AI/friend modes
- [ ] Integrate with `/api/games/ranked` endpoint
- [ ] Show ELO change notification after game
- [ ] Display opponent ELO during game
- [ ] Update UI with current player ELO

### 3. Implement Achievement Notifications

**Location**: Game completion handlers

- [ ] Call `POST /api/achievements` after recording game
- [ ] Create toast notification component for achievements
- [ ] Add achievement unlock animation
- [ ] Show achievement icon + description
- [ ] Play sound effect on unlock (optional)

### 4. Test Game Stat Tracking

- [ ] Play AI game as authenticated user
- [ ] Verify stats update in profile
- [ ] Check rank calculation
- [ ] Test win streak tracking
- [ ] Verify perfect game detection (64-0)
- [ ] Test guest user doesn't break games

## Secondary Tasks (Medium Priority)

### 5. Match History Page

**New File**: `app/match-history/page.tsx`

- [ ] Create `/api/games/history` endpoint
- [ ] Fetch user's game history
- [ ] Display in table/cards with:
  - Date/time
  - Mode (AI/Friend/Ranked)
  - Opponent (for multiplayer)
  - Result (Win/Loss/Draw)
  - Score
  - Duration
  - ELO change (ranked only)
- [ ] Add filters (mode, date range, outcome)
- [ ] Add pagination

### 6. Leaderboard Enhancements

**File**: `app/leaderboard/page.tsx`

- [ ] Add ELO-based leaderboard tab
- [ ] Add time period filters (daily/weekly/monthly/all-time)
- [ ] Show rank changes (▲▼ indicators)
- [ ] Add user search/filter
- [ ] Highlight current user's position
- [ ] Add "View Profile" links

### 7. Achievement Display in Profile

**File**: `app/profile/page.tsx`

- [ ] Fetch achievements from `/api/achievements`
- [ ] Display in Achievements tab
- [ ] Group by category
- [ ] Show locked vs unlocked
- [ ] Progress bars for incremental achievements
- [ ] Achievement icons/badges
- [ ] Total points display

### 8. Friend System

**New Files**: `app/api/friends/*.ts`

- [ ] `/api/friends` - List user's friends
- [ ] `/api/friends/requests` - Pending requests
- [ ] `/api/friends/search` - Find users
- [ ] `/api/friends/accept` - Accept request
- [ ] `/api/friends/decline` - Decline request
- [ ] `/api/friends/remove` - Unfriend
- [ ] Update Prisma queries for Friendship model

## Polish & UX (Low Priority)

### 9. Statistics Dashboard

**File**: `app/profile/page.tsx` (Stats tab)

- [ ] Win/loss pie chart
- [ ] Performance over time line graph
- [ ] Most played mode bar chart
- [ ] Win rate by mode
- [ ] Average game duration
- [ ] Peak vs current ELO

### 10. Social Features

- [ ] Public user profiles (`/users/[username]`)
- [ ] Recent activity feed
- [ ] Player search page
- [ ] Follow system (extend Friendship model)
- [ ] Online status indicators

### 11. Game Notifications

- [ ] Friend request notifications
- [ ] Game challenge notifications
- [ ] Achievement unlock notifications
- [ ] Rank up notifications
- [ ] New message notifications

### 12. SEO & Performance

- [ ] Add meta tags to profile pages
- [ ] Optimize database queries with indexes
- [ ] Add caching for leaderboard
- [ ] Image optimization for avatars
- [ ] Lazy load achievement images

## Bug Fixes & Improvements

### Known Issues

- [x] Navbar Suspense boundary error - FIXED
- [x] TypeScript errors in profile page - FIXED
- [ ] Achievement seed script database connection
- [ ] Guest user testing in all game modes

### Code Quality

- [ ] Add error boundaries for game pages
- [ ] Add loading skeletons for async data
- [ ] Improve error messages
- [ ] Add API rate limiting
- [ ] Add input validation on all forms

### Testing

- [ ] Unit tests for ELO calculation
- [ ] Unit tests for rank calculation
- [ ] Integration tests for game recording
- [ ] E2E tests for game flows
- [ ] Test achievement unlock conditions

## Documentation

### 13. User Guide

- [ ] How achievements work
- [ ] ELO rating explanation
- [ ] Rank system breakdown
- [ ] Game modes comparison
- [ ] Profile customization guide

### 14. Developer Docs

- [x] API reference in summary doc
- [x] Data flow diagrams
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Contributing guidelines

## Deployment Checklist

- [ ] Set environment variables in production
- [ ] Run database migrations
- [ ] Seed achievements
- [ ] Configure Stack Auth production keys
- [ ] Set up Neon production database
- [ ] Configure domain/SSL
- [ ] Test authentication flow
- [ ] Verify stat tracking works
- [ ] Check all API endpoints
- [ ] Monitor error logs

---

## Priority Order

1. **Seed achievements** (database setup)
2. **Connect ranked mode** (complete game integration)
3. **Add achievement notifications** (user engagement)
4. **Test thoroughly** (ensure quality)
5. **Match history** (user retention)
6. **Leaderboard enhancements** (competitive features)
7. **Friend system** (social features)
8. **Statistics dashboard** (analytics)
9. **Polish & UX improvements** (delight users)
10. **Deploy to production** (launch!)

## Quick Wins

- ✅ Navbar Suspense fix
- ✅ Game stat tracking (AI & Friend)
- ✅ Achievement system API
- ✅ Ranked match ELO API
- [ ] Seed achievements (5 minutes)
- [ ] Achievement notifications (30 minutes)
- [ ] Ranked game integration (1 hour)

## Time Estimates

- **Immediate Tasks**: 4-6 hours
- **Secondary Tasks**: 12-16 hours
- **Polish & UX**: 8-12 hours
- **Total**: ~30-35 hours to complete all features
