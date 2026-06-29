// filepath: src/components/asteroid/SurveillanceFilters.tsx
/**
 * Filter and sort controls for the surveillance list.
 * All filters operate client-side via Zustand — no refetch on filter change.
 */

"use client";

import { cn } from "@/lib/utils/cn";
import { useStore, useFilterState } from "@/store";
import type { ThreatTier } from "@/types/asteroid.types";
import { formatThreatTier } from "@/lib/utils/format";

const TIER_OPTIONS: Array<{ value: ThreatTier | "ALL"; label: string }> = [
  { value: "ALL", label: "ALL TIERS" },
  { value: "PATTERN_BLUE", label: "PATTERN BLUE" },
  { value: "PRIORITY_RED", label: "PRIORITY RED" },
  { value: "PRIORITY_AMBER", label: "PRIORITY AMBER" },
  { value: "ELEVATED", label: "ELEVATED" },
  { value: "MONITOR", label: "MONITOR" },
  { value: "MINIMAL", label: "MINIMAL" },
];

interface SurveillanceFiltersProps {
  totalCount: number;
}

export function SurveillanceFilters({ totalCount }: SurveillanceFiltersProps) {
  const filter = useFilterState();
  const setFilter = useStore((s) => s.setFilter);
  const resetFilters = useStore((s) => s.resetFilters);

  const hasActiveFilters =
    filter.tier !== "ALL" ||
    filter.search !== "" ||
    filter.showHazardousOnly;

  return (
    <div className="flex items-center gap-3 flex-wrap">

      {/* Search input */}
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 terminal-text text-[11px] text-phosphor-dim pointer-events-none">
          &gt;
        </span>
        <input
          type="text"
          placeholder="SEARCH DESIGNATION..."
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          className={cn(
            "pl-6 pr-3 py-1",
            "bg-void-black border border-ui-border",
            "terminal-text text-[12px] text-phosphor",
            "placeholder:text-phosphor-dim/40",
            "focus:outline-none focus:border-nerv-orange/60",
            "w-48 transition-colors duration-150",
            // Cursor style
            "caret-phosphor"
          )}
        />
      </div>

      {/* Tier filter dropdown */}
      <select
        value={filter.tier}
        onChange={(e) =>
          setFilter({ tier: e.target.value as ThreatTier | "ALL" })
        }
        className={cn(
          "px-3 py-1",
          "bg-void-black border border-ui-border",
          "font-display text-[10px] text-amber-warm tracking-[0.1em]",
          "focus:outline-none focus:border-nerv-orange/60",
          "cursor-pointer",
          "transition-colors duration-150"
        )}
      >
        {TIER_OPTIONS.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-deep-station"
          >
            {opt.label}
          </option>
        ))}
      </select>

      {/* Hazardous only toggle */}
      <button
        onClick={() =>
          setFilter({ showHazardousOnly: !filter.showHazardousOnly })
        }
        className={cn(
          "px-3 py-1 font-display text-[10px] tracking-[0.12em]",
          "border transition-colors duration-150",
          filter.showHazardousOnly
            ? "border-bloodwarn-mid/60 text-bloodwarn-text bg-bloodwarn-mid/10"
            : "border-ui-border text-classified-grey hover:border-bloodwarn-mid/40 hover:text-amber-dim"
        )}
      >
        PHA ONLY
      </button>

      {/* Reset filters — only shown when filters are active */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className={cn(
            "px-2 py-1 font-display text-[9px] tracking-[0.12em]",
            "border border-nerv-orange-dim/40 text-nerv-orange-dim",
            "hover:border-nerv-orange hover:text-nerv-orange",
            "transition-colors duration-150"
          )}
        >
          CLEAR ×
        </button>
      )}

      {/* Active filter count */}
      {hasActiveFilters && (
        <span className="font-body text-[9px] text-classified-grey">
          FILTERS ACTIVE
        </span>
      )}
    </div>
  );
}
