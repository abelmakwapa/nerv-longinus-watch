// filepath: src/providers/StoreProvider.tsx
/**
 * Zustand store initialization wrapper.
 * Primarily used for SSR hydration safety.
 */

"use client";

import { useEffect } from "react";
import { useStore } from "@/store";

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  // Mark boot sequence as ready after initial hydration
  const completeBootSequence = useStore((s) => s.completeBootSequence);

  useEffect(() => {
    // Brief delay to allow boot animation to play before revealing main content
    const timer = setTimeout(completeBootSequence, 3500);
    return () => clearTimeout(timer);
  }, [completeBootSequence]);

  return <>{children}</>;
}
