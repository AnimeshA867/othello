"use client";

import { useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  setUser,
  setGuest,
  setGameStats,
  clearUser,
  completeTutorial,
} from "@/lib/redux/slices/userSlice";

export function useUserSync() {
  const user = useUser();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      // Check if tutorial was completed (from localStorage)
      const tutorialCompleted =
        typeof window !== "undefined" &&
        localStorage.getItem("tutorialCompleted") === "true";

      if (tutorialCompleted) {
        dispatch(completeTutorial());
      }

      if (user) {
        // Initialize user in database (creates if doesn't exist)
        try {
          const initResponse = await fetch("/api/users/init", {
            method: "POST",
          });

          if (!initResponse.ok) {
            console.error("Failed to initialize user in database");
          }
        } catch (error) {
          console.error("Error initializing user:", error);
        }

        // Set user basic info
        dispatch(
          setUser({
            stackId: user.id,
            email: user.primaryEmail || "",
            username:
              user.displayName ||
              user.primaryEmail?.split("@")[0] ||
              `user_${Date.now()}`,
            displayName: user.displayName || null,
            avatarUrl: user.profileImageUrl || null,
            bio: null,
          })
        );

        // Fetch and set game stats
        try {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const data = await response.json();
            if (data.stats) {
              dispatch(setGameStats(data.stats));
            }
          }
        } catch (error) {
          console.error("Failed to fetch user stats:", error);
        }
      } else {
        // User is not logged in, set as guest
        dispatch(setGuest());
      }
    };

    fetchUserData();
  }, [user, dispatch]);

  return user;
}
