// filepath: src/hooks/useSoundEngine.ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { soundEngine } from "@/lib/sound/SoundEngine";
import { useStore, useAlertTier } from "@/store";
import type { SoundId } from "@/lib/sound/SoundEngine";
import type { ThreatTier } from "@/types/asteroid.types";

const TIER_ORDER: ThreatTier[] = [
  "MINIMAL", "MONITOR", "ELEVATED", "PRIORITY_AMBER", "PRIORITY_RED", "PATTERN_BLUE",
];

/** Play a sound by ID. Silently no-ops on SSR. */
export function useSound() {
  const play = useCallback((id: SoundId) => {
    soundEngine?.play(id);
  }, []);
  return play;
}

/**
 * Watches the alert tier and fires escalation sounds when tier increases.
 * Attach once at the dashboard root.
 */
export function useAlertSounds() {
  const tier = useAlertTier();
  const prevTierRef = useRef<ThreatTier>("MINIMAL");
  const hasInteracted = useRef(false);

  // Track first interaction so audio context can start
  useEffect(() => {
    const handler = () => { hasInteracted.current = true; };
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  useEffect(() => {
    if (!hasInteracted.current) return;
    const prev = prevTierRef.current;
    const prevIdx = TIER_ORDER.indexOf(prev);
    const currIdx = TIER_ORDER.indexOf(tier);

    if (currIdx > prevIdx) {
      // Escalation
      if (tier === "PATTERN_BLUE") {
        soundEngine?.play("pattern_blue");
      } else if (tier === "PRIORITY_RED") {
        soundEngine?.play("alert_red");
      } else if (tier === "PRIORITY_AMBER") {
        soundEngine?.play("alert_amber");
      } else {
        soundEngine?.play("tier_escalate");
      }
    }

    prevTierRef.current = tier;
  }, [tier]);
}

/**
 * Plays a subtle ping whenever new asteroid data arrives.
 */
export function useDataSounds() {
  const lastRefresh = useStore((s) => s.ui.lastRefresh);
  const isRefreshing = useStore((s) => s.ui.isRefreshing);
  const prevRefresh = useRef<number | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const handler = () => { hasInteracted.current = true; };
    window.addEventListener("click", handler, { once: true });
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!hasInteracted.current) return;
    if (lastRefresh && lastRefresh !== prevRefresh.current) {
      prevRefresh.current = lastRefresh;
      if (!isRefreshing) soundEngine?.play("data_refresh");
    }
  }, [lastRefresh, isRefreshing]);
}
