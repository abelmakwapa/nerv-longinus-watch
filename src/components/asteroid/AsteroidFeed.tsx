// filepath: src/components/asteroid/AsteroidFeed.tsx
"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store";
import type { AsteroidListResponse } from "@/types/asteroid.types";

/**
 * Headless data owner for the asteroid feed.
 *
 * Mounted once at the dashboard root so the canonical ["asteroids"] query — with
 * its queryFn and 15-minute polling — is ALWAYS active, regardless of which
 * panels happen to be visible. Every other consumer (the 3D scene, the HUD
 * rails, the dossier) reads the shared cache by key. Also keeps the Zustand
 * store (alert tier, data source, refresh state) in sync with the feed.
 */
export function AsteroidFeed() {
  const setAlertTier = useStore((s) => s.setAlertTier);
  const setDataSource = useStore((s) => s.setDataSource);
  const setRefreshing = useStore((s) => s.setRefreshing);
  const setLastRefresh = useStore((s) => s.setLastRefresh);

  const { data, isFetching, dataUpdatedAt } = useQuery<AsteroidListResponse>({
    queryKey: ["asteroids"],
    queryFn: async () => {
      const res = await fetch("/api/asteroids?days=7");
      if (!res.ok) throw new Error(`API ERROR: ${res.status}`);
      return res.json();
    },
    refetchInterval: 15 * 60 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 14 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.meta.source) setDataSource(data.meta.source);
    if (dataUpdatedAt) setLastRefresh(dataUpdatedAt);
  }, [data, dataUpdatedAt, setDataSource, setLastRefresh]);

  useEffect(() => {
    setRefreshing(isFetching);
  }, [isFetching, setRefreshing]);

  useEffect(() => {
    if (data?.data?.length) {
      const highest = data.data[0]; // API returns objects sorted by threat score
      setAlertTier(highest.threat.tier, highest);
    }
  }, [data, setAlertTier]);

  return null;
}
