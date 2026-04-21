"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    let active = true;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        if (active) {
          console.error("Service worker registration failed", error);
        }
      }
    };

    register();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
