// filepath: src/components/asteroid/ActiveTrackingList.tsx
/**
 * Compact active tracking list showing the top 6 priority objects.
 * Used in the right panel of the dashboard.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { useStore, useSelectedId } from "@/store";
import { getTierColorClass } from "@/lib/utils/format";
import type { NervAsteroid, AsteroidListResponse } from "@/types/asteroid.types";

export function ActiveTrackingList() {
  const selectedId = useSelectedId();
  const selectAsteroid = useStore((s) => s.selectAsteroid);

  const { data, isLoading } = useQuery<AsteroidListResponse>({
    queryKey: ["asteroids"],
    queryFn: async () => {
      const res = await fetch("/api/asteroids?days=7");
      return res.json();
    },
    staleTime: 14 * 60 * 1000,
  });

  const topObjects = data?.data.slice(0, 6) ?? [];

  return (
    <div className="flex flex-col h-full bg-terminal-black">
      <div className="px-3 py-2 border-b border-shadow-grid shrink-0">
        <span className="font-display text-[10px] text-classified-grey tracking-[0.2em]">
          ACTIVE SURVEILLANCE ROSTER
        </span>
      </div>

      <div className="flex-1 overflow-hidden divide-y divide-shadow-grid/50">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-3 py-2 flex gap-2 items-center opacity-50">
              <div className="w-1 h-full bg-shadow-grid" />
              <div className="h-3 flex-1 bg-shadow-grid animate-neon-pulse" />
            </div>
          ))
        ) : (
          topObjects.map((asteroid) => (
            <TrackingRow
              key={asteroid.id}
              asteroid={asteroid}
              isSelected={selectedId === asteroid.id}
              onSelect={() =>
                selectAsteroid(
                  selectedId === asteroid.id ? null : asteroid.id
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function TrackingRow({
  asteroid,
  isSelected,
  onSelect,
}: {
  asteroid: NervAsteroid;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const tierColors: Record<string, string> = {
    PATTERN_BLUE: "bg-bloodwarn-bright",
    PRIORITY_RED: "bg-bloodwarn-text",
    PRIORITY_AMBER: "bg-nerv-orange",
    ELEVATED: "bg-amber-bright",
    MONITOR: "bg-phosphor-mid",
    MINIMAL: "bg-phosphor-dim/40",
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2",
        "transition-colors duration-100 text-left",
        isSelected ? "bg-nerv-orange/5" : "hover:bg-nerv-black"
      )}
    >
      {/* Tier color bar */}
      <div
        className={cn(
          "w-1 self-stretch rounded-none shrink-0",
          tierColors[asteroid.threat.tier]
        )}
      />

      <div className="flex-1 min-w-0">
        <div className="font-display text-[11px] text-amber-warm truncate tracking-[0.05em]">
          {asteroid.designation}
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span
            className={cn(
              "terminal-text text-[10px]",
              getTierColorClass(asteroid.threat.tier)
            )}
          >
            {asteroid.threat.tier.replace("_", " ")}
          </span>
          <span className="terminal-text text-[10px] text-phosphor-dim">
            {asteroid.closestApproach?.date ?? "—"}
          </span>
        </div>
      </div>
    </button>
  );
}
