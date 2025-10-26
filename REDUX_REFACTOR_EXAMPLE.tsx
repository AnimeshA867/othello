// Example of how to refactor the ranked page state to Redux
// This shows the pattern - actual implementation will be done step by step

import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  setGameMode,
  setGameType,
  setDifficulty,
  setBotName,
  setEloChange,
  startMatchmaking,
  stopMatchmaking,
  setOpponent,
  startGame,
  setGameRecorded,
} from "@/lib/redux/slices/gameSlice";
import {
  setShowGameOverDialog,
  setShowResignDialog,
  setShowDrawOfferDialog,
  setShowAuthPrompt,
  setLoading,
} from "@/lib/redux/slices/uiSlice";
import { updateElo, incrementGameStats } from "@/lib/redux/slices/userSlice";

// In your component:
function RankedGamePageExample() {
  const dispatch = useAppDispatch();

  // Select state from Redux instead of using useState
  const userElo = useAppSelector(
    (state) => state.user.gameStats?.eloRating ?? 1200
  );
  const eloChange = useAppSelector((state) => state.game.eloChange);
  const gameMode = useAppSelector((state) => state.game.mode);
  const difficulty = useAppSelector((state) => state.game.difficulty);
  const botName = useAppSelector((state) => state.game.botName);
  const isLoading = useAppSelector((state) => state.ui.isLoading);
  const showGameOverDialog = useAppSelector(
    (state) => state.ui.showGameOverDialog
  );
  const showResignDialog = useAppSelector((state) => state.ui.showResignDialog);
  const isGuest = useAppSelector((state) => state.user.isGuest);
  const guestGamesPlayed = useAppSelector(
    (state) => state.user.guestGamesPlayed
  );

  // Dispatch actions instead of setState
  const handleSetDifficulty = (diff: "easy" | "medium" | "hard") => {
    dispatch(setDifficulty(diff));
  };

  const handleStartGame = () => {
    dispatch(startGame());
    dispatch(setGameRecorded(false));
  };

  const handleGameOver = (won: boolean, eloChange: number) => {
    dispatch(setEloChange(eloChange));
    dispatch(updateElo({ change: eloChange, newElo: userElo + eloChange }));
    dispatch(incrementGameStats({ won, draw: false, mode: "ranked" }));
    dispatch(setShowGameOverDialog(true));
  };

  // ...rest of component logic
}

export default RankedGamePageExample;
