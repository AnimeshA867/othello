# Redux Migration Guide

## ✅ Completed Setup

### 1. Redux Infrastructure

- ✅ Installed `@reduxjs/toolkit` and `react-redux`
- ✅ Created Redux store at `lib/redux/store.ts`
- ✅ Created three slices:
  - `userSlice.ts` - User data, game stats, ELO, guest state
  - `gameSlice.ts` - Game mode, difficulty, matchmaking, opponent info
  - `uiSlice.ts` - Dialog states, loading states, errors
- ✅ Created typed hooks at `lib/redux/hooks.ts`
- ✅ Created `StoreProvider.tsx` component
- ✅ Wrapped app with `StoreProvider` in `app/layout.tsx`
- ✅ Created `useUserSync` hook to sync Stack Auth user to Redux
- ✅ Updated `AuthProvider` to use `useUserSync`

## 📊 Redux Store Structure

### User Slice (`state.user`)

```typescript
{
  stackId: string | null
  email: string | null
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  gameStats: {
    totalGames, wins, losses, draws
    aiGames, aiWins
    multiplayerGames, multiplayerWins
    rankedGames, rankedWins
    eloRating, peakEloRating
    rank, currentWinStreak, longestWinStreak
    averageGameTime, totalPiecesFlipped, perfectGames
  } | null
  isGuest: boolean
  guestGamesPlayed: number
}
```

**Actions:**

- `setUser()` - Set user data from Stack Auth
- `setGameStats()` - Set game statistics
- `updateElo({ change, newElo })` - Update ELO rating
- `incrementGameStats({ won, draw, mode })` - Increment game counters
- `setGuest()` - Mark as guest user
- `incrementGuestGames()` - Increment guest game count
- `clearUser()` - Clear all user data

### Game Slice (`state.game`)

```typescript
{
  mode: "ai" | "multiplayer" | null;
  gameType: "ai" | "friend" | "ranked" | null;
  difficulty: "easy" | "medium" | "hard";
  botName: string | null;
  eloChange: number | null;
  isMatchmaking: boolean;
  matchmakingTimeout: number | null;
  opponentName: string | null;
  opponentElo: number | null;
  gameStartTime: number | null;
  gameRecorded: boolean;
  drawOfferedByPlayer: boolean;
  drawOfferedByOpponent: boolean;
}
```

**Actions:**

- `setGameMode(mode)` - Set ai/multiplayer mode
- `setGameType(type)` - Set ai/friend/ranked type
- `setDifficulty(difficulty)` - Set bot difficulty
- `setBotName(name)` - Set bot opponent name
- `setEloChange(change)` - Set ELO change for game
- `startMatchmaking()` - Begin matchmaking
- `stopMatchmaking()` - Stop matchmaking
- `setMatchmakingTimeout(ms)` - Set timeout value
- `setOpponent({ name, elo })` - Set opponent info
- `startGame()` - Initialize game timing
- `setGameRecorded(bool)` - Mark game as recorded
- `offerDraw()` - Player offers draw
- `receiveDrawOffer()` - Receive draw offer
- `cancelDrawOffer()` - Cancel draw offer
- `resetGame()` - Reset game state

### UI Slice (`state.ui`)

```typescript
{
  showGameOverDialog: boolean
  showResignDialog: boolean
  showDrawOfferDialog: boolean
  showAuthPrompt: boolean
  isLoading: boolean
  loadingMessage: string | null
  error: string | null
  lastToast: { title, description, timestamp } | null
}
```

**Actions:**

- `setShowGameOverDialog(bool)`
- `setShowResignDialog(bool)`
- `setShowDrawOfferDialog(bool)`
- `setShowAuthPrompt(bool)`
- `setLoading({ isLoading, message })`
- `setError(message)`
- `setLastToast({ title, description })`
- `clearError()`
- `resetUI()`

## 🔄 Migration Pattern

### Before (useState):

```typescript
const [userElo, setUserElo] = useState(1200);
const [eloChange, setEloChange] = useState<number | null>(null);
const [showGameOverDialog, setShowGameOverDialog] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [botName, setBotName] = useState("");

// Update state
setUserElo(1500);
setEloChange(-15);
setShowGameOverDialog(true);
```

### After (Redux):

```typescript
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { setEloChange, setBotName } from "@/lib/redux/slices/gameSlice";
import { updateElo } from "@/lib/redux/slices/userSlice";
import { setShowGameOverDialog, setLoading } from "@/lib/redux/slices/uiSlice";

const dispatch = useAppDispatch();

// Select state
const userElo = useAppSelector(
  (state) => state.user.gameStats?.eloRating ?? 1200
);
const eloChange = useAppSelector((state) => state.game.eloChange);
const showGameOverDialog = useAppSelector(
  (state) => state.ui.showGameOverDialog
);
const isLoading = useAppSelector((state) => state.ui.isLoading);
const botName = useAppSelector((state) => state.game.botName);

// Update state
dispatch(updateElo({ change: -15, newElo: 1485 }));
dispatch(setEloChange(-15));
dispatch(setShowGameOverDialog(true));
```

## 📝 Next Steps for Ranked Page

### State Variables to Replace:

#### Remove these useState declarations:

```typescript
// ❌ Remove
const [gameMode, setGameMode] = useState<GameMode>("searching");
const [userElo, setUserElo] = useState(1200);
const [botDifficulty, setBotDifficulty] = useState<Difficulty>("medium");
const [isLoading, setIsLoading] = useState(true);
const [eloChange, setEloChange] = useState<number | null>(null);
const [botName, setBotName] = useState("");
const [showGameOverDialog, setShowGameOverDialog] = useState(false);
const [showResignDialog, setShowResignDialog] = useState(false);
const [showDrawOfferDialog, setShowDrawOfferDialog] = useState(false);
const [drawOfferedByPlayer, setDrawOfferedByPlayer] = useState(false);
const [showAuthDialog, setShowAuthDialog] = useState(false);
const [hasStartedMatchmaking, setHasStartedMatchmaking] = useState(false);

// ✅ Replace with Redux selectors
const gameMode = useAppSelector((state) => state.game.mode);
const userElo = useAppSelector(
  (state) => state.user.gameStats?.eloRating ?? 1200
);
const difficulty = useAppSelector((state) => state.game.difficulty);
const isLoading = useAppSelector((state) => state.ui.isLoading);
const eloChange = useAppSelector((state) => state.game.eloChange);
const botName = useAppSelector((state) => state.game.botName);
const showGameOverDialog = useAppSelector(
  (state) => state.ui.showGameOverDialog
);
const showResignDialog = useAppSelector((state) => state.ui.showResignDialog);
const showDrawOfferDialog = useAppSelector(
  (state) => state.ui.showDrawOfferDialog
);
const drawOfferedByPlayer = useAppSelector(
  (state) => state.game.drawOfferedByPlayer
);
const showAuthDialog = useAppSelector((state) => state.ui.showAuthPrompt);
const isMatchmaking = useAppSelector((state) => state.game.isMatchmaking);
```

#### Keep these (local UI state):

```typescript
// ✅ Keep - local component state
const [moveCount, setMoveCount] = useState(0);
const [copiedMessage, setCopiedMessage] = useState(false);
const gameStartTimeRef = useRef<number>(Date.now());
const gameRecordedRef = useRef<boolean>(false);
const matchmakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

### Key Changes Needed:

1. **Add imports at top:**

```typescript
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  setGameMode,
  setDifficulty,
  setBotName,
  setEloChange,
  startMatchmaking,
  stopMatchmaking,
  setOpponent,
  startGame,
  setGameRecorded,
  offerDraw,
  cancelDrawOffer,
} from "@/lib/redux/slices/gameSlice";
import { updateElo, incrementGameStats } from "@/lib/redux/slices/userSlice";
import {
  setShowGameOverDialog,
  setShowResignDialog,
  setShowDrawOfferDialog,
  setShowAuthPrompt,
  setLoading,
} from "@/lib/redux/slices/uiSlice";
```

2. **Replace setState calls:**

```typescript
// Before: setUserElo(newElo)
// After:
dispatch(updateElo({ change: eloChange, newElo }));

// Before: setEloChange(change)
// After:
dispatch(setEloChange(change));

// Before: setShowGameOverDialog(true)
// After:
dispatch(setShowGameOverDialog(true));

// Before: setBotDifficulty("hard")
// After:
dispatch(setDifficulty("hard"));

// Before: setGameMode("ai")
// After:
dispatch(setGameMode("ai"));

// Before: setIsLoading(true)
// After:
dispatch(setLoading({ isLoading: true, message: "Loading..." }));
```

3. **Update game recording logic:**

```typescript
// After game ends
dispatch(incrementGameStats({ won, draw, mode: "ranked" }));
dispatch(setEloChange(calculatedChange));
dispatch(
  updateElo({ change: calculatedChange, newElo: userElo + calculatedChange })
);
```

## 🎯 Benefits

1. **Centralized State** - All app state in one place
2. **Better Performance** - Redux optimizes re-renders
3. **Dev Tools** - Redux DevTools for debugging
4. **Predictable Updates** - Actions make state changes traceable
5. **Less Prop Drilling** - Access state anywhere
6. **Type Safety** - Full TypeScript support
7. **Easier Testing** - Test reducers and actions independently

## 🚀 Implementation Order

1. ✅ **Set up Redux infrastructure** (DONE)
2. 🔄 **Refactor Ranked Page** (IN PROGRESS - recommended next)
3. ⏳ **Refactor Friend Page**
4. ⏳ **Refactor AI Page**
5. ⏳ **Refactor Profile Page**
6. ⏳ **Test and optimize**

## 💡 Tips

- Start with one slice at a time
- Test after each major change
- Use Redux DevTools to inspect state
- Keep local state for UI-only values (like copiedMessage)
- Use selectors for computed values
- Dispatch actions for all state changes

## 📚 Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
