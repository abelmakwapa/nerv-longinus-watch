// filepath: src/components/asteroid/SurveillanceList.tsx
/**
 * NERV Surveillance Roster — Asteroid List View
 *
 * The primary data table for the surveillance dashboard.
 * Includes:
 * - Search and filter controls
 * - Sortable column headers
 * - Color-coded threat tier rows
 * - Live data via TanStack Query with 15-minute polling
 * - Error state with mock fallback awareness
 */

"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { AsteroidRow } from "./AsteroidRow";
import { SurveillanceFilters } from "./SurveillanceFilters";
import { useStore, useFilterState, useAlertTier } from "@/store";
import type { NervAsteroid, AsteroidListResponse, SortField } from "@/types/asteroid.types";

// Column header definition
interface Column {
  key: SortField | string;
  label: string;
  sortable: boolean;
  width?: string;
}

const COLUMNS: Column[] = [
  { key: "tier_bar", label: "", sortable: false, width: "w-2" },
  { key: "designation", label: "DESIGNATION", sortable: true },
  { key: "class", label: "CLASS", sortable: false },
  { key: "tier", label: "THREAT TIER", sortable: true },
  { key: "approach_date", label: "APPROACH DATE", sortable: true },
  { key: "distance", label: "MISS DIST.", sortable: false },
  { key: "probability", label: "P(IMPACT)", sortable: true },
  { key: "delta", label: "Δ7D", sortable: false },
  { key: "diameter", label: "DIAMETER", sortable: true },
  { key: "classification", label: "CLASS.", sortable: false },
  { key: "action", label: "", sortable: false },
];

export function SurveillanceList() {
  const filter = useFilterState();
  const setFilter = useStore((s) => s.setFilter);
  const setAlertTier = useStore((s) => s.setAlertTier);
  const setDataSource = useStore((s) => s.setDataSource);
  const setRefreshing = useStore((s) => s.setRefreshing);
  const setLastRefresh = useStore((s) => s.setLastRefresh);

  // ── TANSTACK QUERY — live polling ────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    dataUpdatedAt,
  } = useQuery<AsteroidListResponse>({
    queryKey: ["asteroids"],
    queryFn: async () => {
      const res = await fetch("/api/asteroids?days=7");
      if (!res.ok) throw new Error(`API ERROR: ${res.status}`);
      return res.json();
    },
    // Refetch every 15 minutes — balances freshness against NASA rate limit
    refetchInterval: 15 * 60 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 14 * 60 * 1000,
  });

  // Sync data source and refresh state to Zustand
  useEffect(() => {
    if (data?.meta.source) {
      setDataSource(data.meta.source);
    }
    if (dataUpdatedAt) {
      setLastRefresh(dataUpdatedAt);
    }
  }, [data, dataUpdatedAt, setDataSource, setLastRefresh]);

  useEffect(() => {
    setRefreshing(isFetching);
  }, [isFetching, setRefreshing]);

  // Update global threat tier based on highest-priority object
  useEffect(() => {
    if (data?.data?.length) {
      const highest = data.data[0]; // Already sorted by threat score
      setAlertTier(highest.threat.tier, highest);
    }
  }, [data, setAlertTier]);

  // ── CLIENT-SIDE FILTERING AND SORTING ────────────────────────────────────────────
  const filteredAsteroids = useMemo(() => {
    if (!data?.data) return [];

    let result = [...data.data];

    // Filter by threat tier
    if (filter.tier !== "ALL") {
      result = result.filter((a) => a.threat.tier === filter.tier);
    }

    // Filter by search term
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.designation.toLowerCase().includes(searchLower) ||
          a.nervCodename.toLowerCase().includes(searchLower) ||
          a.id.includes(filter.search)
      );
    }

    // Filter by hazardous only
    if (filter.showHazardousOnly) {
      result = result.filter((a) => a.threat.isPotentiallyHazardous);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (filter.sortField) {
        case "threat":
          comparison = a.threat.score - b.threat.score;
          break;
        case "probability":
          comparison =
            a.threat.impactProbability - b.threat.impactProbability;
          break;
        case "approach_date":
          comparison =
            (a.closestApproach?.epochMs ?? Infinity) -
            (b.closestApproach?.epochMs ?? Infinity);
          break;
        case "designation":
          comparison = a.designation.localeCompare(b.designation);
          break;
        case "diameter":
          comparison =
            a.physical.diameter.max - b.physical.diameter.max;
          break;
        default:
          comparison = 0;
      }

      return filter.sortDirection === "desc" ? -comparison : comparison;
    });

    return result;
  }, [data, filter]);

  const handleSort = (field: string) => {
    const sortableFields: SortField[] = [
      "threat", "probability", "approach_date", "designation", "diameter"
    ];
    if (!sortableFields.includes(field as SortField)) return;

    const sortField = field as SortField;
    if (filter.sortField === sortField) {
      // Toggle direction
      setFilter({
        sortDirection: filter.sortDirection === "desc" ? "asc" : "desc",
      });
    } else {
      setFilter({ sortField, sortDirection: "desc" });
    }
  };

  // ── LOADING STATE ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <SurveillanceListSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-terminal-black">

      {/* ── HEADER ──────────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2 border-b border-shadow-grid shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-display text-amber-core text-[13px] tracking-[0.15em]">
              SURVEILLANCE ROSTER
            </h2>
            <p className="terminal-text text-[11px] text-classified-grey mt-0.5">
              {isLoading
                ? "LOADING TELEMETRY..."
                : `${filteredAsteroids.length} OBJECTS DISPLAYED // ${data?.meta.total ?? 0} IN DATABASE`}
              {data?.meta.source === "mock" && (
                <span className="ml-2 text-amber-dim">
                  [MOCK DATA — NASA API UNAVAILABLE]
                </span>
              )}
            </p>
          </div>

          {/* Refresh indicator */}
          {isFetching && (
            <span className="terminal-text text-[11px] text-phosphor-mid animate-neon-pulse">
              UPDATING TELEMETRY...
            </span>
          )}
        </div>

        {/* Filter controls */}
        <SurveillanceFilters totalCount={data?.data.length ?? 0} />
      </div>

      {/* ── ERROR STATE ─────────────────────────────────────────────────────────── */}
      {isError && (
        <div className="px-4 py-2 bg-bloodwarn-mid/10 border-b border-bloodwarn-mid/30">
          <span className="terminal-text text-[11px] text-bloodwarn-text">
            ERR &gt; TELEMETRY DEGRADED — OPERATING ON CACHED/MOCK PARAMETERS
          </span>
        </div>
      )}

      {/* ── TABLE ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          {/* Column headers */}
          <thead className="sticky top-0 z-10 bg-deep-station border-b border-shadow-grid">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "px-3 py-2 text-left",
                    "font-display text-[9px] text-classified-grey tracking-[0.2em]",
                    col.sortable &&
                      "cursor-pointer hover:text-amber-warm transition-colors",
                    filter.sortField === col.key && "text-amber-bright",
                    col.width
                  )}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && filter.sortField === col.key && (
                      <span className="text-nerv-orange">
                        {filter.sortDirection === "desc" ? "▼" : "▲"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {filteredAsteroids.length > 0 ? (
              filteredAsteroids.map((asteroid, index) => (
                <AsteroidRow
                  key={asteroid.id}
                  asteroid={asteroid}
                  index={index}
                />
              ))
            ) : (
              <tr>
                <td colSpan={COLUMNS.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="terminal-text text-[14px] text-phosphor-mid">
                      SYS &gt; SURVEILLANCE QUERY RETURNED: 0 RESULTS
                    </span>
                    <span className="font-body text-[11px] text-classified-grey">
                      FILTER PARAMETERS: ACTIVE
                    </span>
                    <span className="terminal-text text-[12px] text-amber-dim italic">
                      ABSENCE OF DATA IS NOT ABSENCE OF THREAT
                    </span>
                    <button
                      onClick={() => useStore.getState().resetFilters()}
                      className={cn(
                        "mt-2 px-4 py-1.5 font-display text-[10px] tracking-[0.15em]",
                        "border border-nerv-orange/40 text-amber-warm",
                        "hover:border-nerv-orange hover:text-nerv-orange",
                        "transition-colors duration-150"
                      )}
                    >
                      RESET FILTERS
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-shadow-grid shrink-0 flex justify-between items-center">
        <span className="terminal-text text-[10px] text-classified-grey">
          LAST UPDATE:{" "}
          {dataUpdatedAt
            ? new Date(dataUpdatedAt).toUTCString()
            : "PENDING"}
        </span>
        <span className="terminal-text text-[10px] text-classified-grey">
          NEXT REFRESH: T+{Math.ceil((15 * 60 * 1000 - (Date.now() - (dataUpdatedAt ?? Date.now()))) / 60000)}M
        </span>
      </div>
    </div>
  );
}

// ── SKELETON LOADING STATE ────────────────────────────────────────────────────────

function SurveillanceListSkeleton() {
  return (
    <div className="flex flex-col h-full bg-terminal-black">
      <div className="px-4 pt-3 pb-2 border-b border-shadow-grid">
        <div className="h-5 w-48 bg-shadow-grid animate-neon-pulse mb-1" />
        <div className="h-3 w-72 bg-shadow-grid/60 animate-neon-pulse" />
      </div>
      <div className="flex-1 overflow-hidden p-2 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 px-3 py-2.5 bg-void-black border-l-2 border-shadow-grid"
            style={{ opacity: 1 - i * 0.08 }}
          >
            <div className="h-4 w-32 bg-shadow-grid animate-neon-pulse" />
            <div className="h-4 w-16 bg-shadow-grid/60 animate-neon-pulse" />
            <div className="h-4 w-20 bg-shadow-grid/40 animate-neon-pulse" />
            <div className="h-4 w-24 bg-shadow-grid/60 animate-neon-pulse" />
            <div className="h-4 w-16 bg-shadow-grid/40 animate-neon-pulse" />
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-shadow-grid">
        <div className="terminal-text text-[11px] text-phosphor-mid animate-neon-pulse">
          SYS &gt; LOADING TELEMETRY FEED... MAGI ARRAY INITIALIZING...
        </div>
      </div>
    </div>
  );
}
