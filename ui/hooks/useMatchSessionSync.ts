"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  applyAuthoritativeSnapshot,
  markStale,
  markTurnPassed,
} from "@/state/slices/matchSessionSlice";

type Message =
  | { type: "game_state"; gameState: Record<string, unknown> }
  | { type: "turn_passed" }
  | { type: "stale_state"; gameState: Record<string, unknown> }
  | { type: string; [key: string]: unknown };

export function useMatchSessionSync(
  onMessage: (callback: (message: Message) => void) => () => void,
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onMessage((message) => {
      switch (message.type) {
        case "game_state":
          dispatch(applyAuthoritativeSnapshot(message.gameState));
          break;
        case "turn_passed":
          dispatch(markTurnPassed());
          break;
        case "stale_state":
          dispatch(markStale());
          dispatch(applyAuthoritativeSnapshot(message.gameState));
          break;
      }
    });

    return unsubscribe;
  }, [dispatch, onMessage]);
}
