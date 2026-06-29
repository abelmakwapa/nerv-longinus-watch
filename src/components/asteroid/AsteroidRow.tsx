// filepath: src/components/asteroid/AsteroidRow.tsx
/**
 * Single row in the asteroid surveillance table.
 *
 * Displays: threat tier indicator, designation, orbital class,
 * approach date, impact probability, 7-day delta, and classification.
 *
 * Selection and hover states are managed via Zustand store.
 */

"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { soundEngine } from "@/lib/sound/SoundEngine";
import { ClassificationBadge } from "@/components/ui/ClassificationBadge";
import { ThreatBadge } from "@/components/ui/ThreatBadge";
import {
  formatProbability,
  formatDistanceLd,
  formatApproachDate,
  formatDiameter,
  getTierBorderClass,
  getTierBgClass,
  getTierColorClass,
} from "@/lib/utils/format";
import { useStore, useSelectedId, useHoveredId } from "@/store";
import type { NervAsteroid } from "@/types/asteroid.types";

interface AsteroidRowProps {
  asteroid: NervAsteroid;
  index: number;
}

export function AsteroidRow({ asteroid, index }: AsteroidRowProps) {
  const selectedId = useSelectedId();
  const hoveredId = useHoveredId();
  const selectAsteroid = useStore((s) => s.selectAsteroid);
  const hoverAsteroid = useStore((s) => s.hoverAsteroid);

  const isSelected = selectedId === asteroid.id;
  const isHovered = hoveredId === asteroid.id;
  const isActive = isSelected || isHovered;

  const handleClick = useCallback(() => {
    if (isSelected) {
      soundEngine?.play("ui_close");
      selectAsteroid(null);
    } else {
      soundEngine?.play("ui_select");
      selectAsteroid(asteroid.id);
    }
  }, [asteroid.id, isSelected, selectAsteroid]);

  // Delta trend indicator
  const delta = asteroid.threat.probabilityDelta7d;
  const deltaSign = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
  const deltaColor =
    delta > 0
      ? "text-data-negative"
      : delta < 0
      ? "text-data-positive"
      : "text-classified-grey";

  // Row background alternates between void-black and terminal-black
  const altBg = index % 2 === 0 ? "bg-void-black" : "bg-terminal-black";

  return (
    <tr
      onClick={handleClick}
      onMouseEnter={() => hoverAsteroid(asteroid.id)}
      onMouseLeave={() => hoverAsteroid(null)}
      className={cn(
        "cursor-pointer group transition-colors duration-100",
        // Alternating rows
        !isActive && altBg,
        // Active states
        isSelected && "bg-nerv-orange/5",
        isHovered && !isSelected && "bg-nerv-black",
        // Left border via box-shadow (table rows don't support border-left well)
        "relative"
      )}
    >
      {/* Threat tier color indicator */}
      <td className="w-0 p-0">
        <div
          className={cn(
            "w-1 h-full min-h-[44px] absolute left-0 top-0",
            // Map tier to solid background
            asteroid.threat.tier === "PATTERN_BLUE" && "bg-bloodwarn-bright",
            asteroid.threat.tier === "PRIORITY_RED" && "bg-bloodwarn-text",
            asteroid.threat.tier === "PRIORITY_AMBER" && "bg-nerv-orange",
            asteroid.threat.tier === "ELEVATED" && "bg-amber-bright",
            asteroid.threat.tier === "MONITOR" && "bg-phosphor-mid",
            asteroid.threat.tier === "MINIMAL" && "bg-phosphor-dim/50",
            // Active glow on left border
            isActive && "shadow-[2px_0_8px_currentColor]"
          )}
        />
      </td>

      {/* Designation */}
      <td className="pl-4 pr-3 py-2.5">
        <div className="flex flex-col">
          <span
            className={cn(
              "font-display text-[12px] tracking-[0.05em]",
              isActive ? "text-nerv-orange-text" : "text-amber-bright",
              getTierColorClass(asteroid.threat.tier) && asteroid.threat.tier !== "MINIMAL"
                ? ""
                : ""
            )}
          >
            {asteroid.designation}
          </span>
          <span className="font-body text-[9px] text-classified-grey tracking-[0.08em]">
            NERV: {asteroid.nervCodename}
          </span>
        </div>
      </td>

      {/* Orbital class */}
      <td className="px-3 py-2.5">
        <span className="font-body text-[11px] text-amber-warm">
          {asteroid.physical.orbitalClass}
        </span>
      </td>

      {/* Threat tier badge */}
      <td className="px-3 py-2.5">
        <ThreatBadge tier={asteroid.threat.tier} animate />
      </td>

      {/* Closest approach date */}
      <td className="px-3 py-2.5">
        {asteroid.closestApproach ? (
          <div className="flex flex-col">
            <span className="terminal-text text-[12px] text-phosphor-mid">
              {asteroid.closestApproach.date}
            </span>
            <span className="font-body text-[9px] text-classified-grey">
              {formatApproachDate(asteroid.closestApproach.date)}
            </span>
          </div>
        ) : (
          <span className="font-body text-[11px] text-classified-grey">
            NO DATA
          </span>
        )}
      </td>

      {/* Miss distance */}
      <td className="px-3 py-2.5">
        {asteroid.closestApproach ? (
          <span className="terminal-text text-[12px] text-amber-warm">
            {formatDistanceLd(asteroid.closestApproach.distanceLd)}
          </span>
        ) : (
          <span className="text-classified-grey text-[11px]">—</span>
        )}
      </td>

      {/* Impact probability */}
      <td className="px-3 py-2.5">
        <span
          className={cn(
            "terminal-text text-[13px] font-bold",
            getTierColorClass(asteroid.threat.tier)
          )}
        >
          {formatProbability(asteroid.threat.impactProbability)}
        </span>
      </td>

      {/* 7-day delta */}
      <td className="px-3 py-2.5">
        <span className={cn("terminal-text text-[12px]", deltaColor)}>
          {deltaSign}
        </span>
      </td>

      {/* Diameter */}
      <td className="px-3 py-2.5">
        <span className="font-body text-[11px] text-amber-dim">
          {formatDiameter(
            asteroid.physical.diameter.min,
            asteroid.physical.diameter.max,
            asteroid.physical.diameter.unit
          )}
        </span>
      </td>

      {/* Classification */}
      <td className="px-3 py-2.5">
        <ClassificationBadge level={asteroid.classificationLevel} />
      </td>

      {/* Action revealed on hover */}
      <td className="px-3 py-2.5">
        <span
          className={cn(
            "font-body text-[9px] text-classified-grey tracking-[0.1em]",
            "transition-opacity duration-200",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          → OPEN DOSSIER
        </span>
      </td>
    </tr>
  );
}
