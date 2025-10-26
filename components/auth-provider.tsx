"use client";

import { Suspense } from "react";
import { useUserSync } from "@/hooks/use-user-sync";

function AuthSync() {
  // Sync user data to Redux store
  useUserSync();
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthSync />
      </Suspense>
      {children}
    </>
  );
}
