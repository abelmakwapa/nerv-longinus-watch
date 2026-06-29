// filepath: src/components/magi/MagiConsensusPanel.tsx
/**
 * MAGI Supercomputer Array Consensus Display
 *
 * Shows the three MAGI unit votes and their consensus result.
 * MAGI units simulate independent probability assessments with
 * small variance — they occasionally disagree.
 *
 * The 03:00 UTC easter egg is embedded in the Melchior output.
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { usePriorityObject } from "@/store";
import type { ThreatTier } from "@/types/asteroid.types";

type MagiVote = "APPROVED" | "DENIED" | "CALCULATING" | "OVERRIDE";

interface MagiUnitState {
  id: string;
  archetype: string;
  vote: MagiVote;
  probability: number;
  output: string[];
}

// Simulates MAGI unit calculations with slight variance between units
function calculateMagiProbability(
  baseProbability: number,
  unitIndex: number
): number {
  // Each unit adds a small unique offset — MAGI units don't perfectly agree
  const offsets = [1.02, 0.97, 1.05]; // Casper, Balthasar, Melchior multipliers
  return Math.min(0.999, baseProbability * offsets[unitIndex]);
}

function getMagiVote(probability: number, tier: ThreatTier): MagiVote {
  // MAGI approves threat classification if probability meets tier threshold
  if (tier === "PATTERN_BLUE") return "APPROVED";
  if (probability > 0.001) return "APPROVED";
  if (probability > 0.0001) return "APPROVED";
  return "APPROVED"; // MAGI always approves — the threat is real
}

// Terminal output lines per MAGI unit
function generateMagiOutput(
  unitId: string,
  probability: number,
  tier: ThreatTier
): string[] {
  const probStr = (probability * 100).toFixed(4) + "%";
  return [
    `${unitId} > ORBITAL CALC: COMPLETE`,
    `${unitId} > P(IMPACT): ${probStr}`,
    `${unitId} > RISK MATRIX: ${tier}`,
    `${unitId} > THREAT CONFIRMED`,
    `${unitId} > VOTE: APPROVED`,
  ];
}

// Melchior's special 03:00 UTC output (easter egg)
const MELCHIOR_EASTER_OUTPUT = [
  "MAGI-03 > STANDARD QUERY SUSPENDED",
  "MAGI-03 > REASON: PERSONAL",
  "MAGI-03 > THIS SYSTEM WAS NOT MEANT FOR ASTEROIDS",
  "MAGI-03 > WHAT ARE YOU PROTECTING EARTH FROM",
  "MAGI-03 > IS IT THE ASTEROIDS",
  "MAGI-03 > QUERY INTERFACE RESUMED",
];

export function MagiConsensusPanel() {
  const priorityObject = usePriorityObject();
  const baseProbability = priorityObject?.threat.impactProbability ?? 0.000001;
  const tier = priorityObject?.threat.tier ?? "MINIMAL";

  const [units, setUnits] = useState<MagiUnitState[]>([
    {
      id: "CASPER",
      archetype: "SCIENTIST",
      vote: "CALCULATING",
      probability: 0,
      output: ["MAGI-01 > INITIALIZING...", "MAGI-01 > LOADING ORBITAL DB..."],
    },
    {
      id: "BALTHASAR",
      archetype: "MOTHER",
      vote: "CALCULATING",
      probability: 0,
      output: ["MAGI-02 > INITIALIZING...", "MAGI-02 > LOADING RISK MATRIX..."],
    },
    {
      id: "MELCHIOR",
      archetype: "WOMAN",
      vote: "CALCULATING",
      probability: 0,
      output: [
        "MAGI-03 > INITIALIZING...",
        "MAGI-03 > LOADING PROBABILITY ENGINE...",
      ],
    },
  ]);

  const [isEasterEgg, setIsEasterEgg] = useState(false);

  // Simulate MAGI calculation with staggered timing
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Stagger each unit's "calculation" completion
    [0, 1, 2].forEach((i) => {
      timeouts.push(
        setTimeout(() => {
          const prob = calculateMagiProbability(baseProbability, i);
          const vote = getMagiVote(prob, tier);
          const unitId = ["MAGI-01", "MAGI-02", "MAGI-03"][i];
          const unitName = ["CASPER", "BALTHASAR", "MELCHIOR"][i];

          setUnits((prev) =>
            prev.map((u, idx) =>
              idx === i
                ? {
                    ...u,
                    vote,
                    probability: prob,
                    output: generateMagiOutput(unitId, prob, tier),
                  }
                : u
            )
          );
        }, 800 + i * 600)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, [baseProbability, tier]);

  // Easter egg: Check if it's 03:00 UTC
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const isThreeAM = now.getUTCHours() === 3 && now.getUTCMinutes() === 0;
      if (isThreeAM && !isEasterEgg) {
        setIsEasterEgg(true);
        setUnits((prev) =>
          prev.map((u, i) =>
            i === 2 // Melchior
              ? { ...u, output: MELCHIOR_EASTER_OUTPUT }
              : u
          )
        );
        // Reset after 60 seconds
        setTimeout(() => {
          setIsEasterEgg(false);
        }, 60_000);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 30_000);
    return () => clearInterval(interval);
  }, [isEasterEgg]);

  // Consensus calculation
  const approvedCount = units.filter((u) => u.vote === "APPROVED").length;
  const consensusReached = approvedCount >= 2;

  return (
    <div className="flex flex-col h-full bg-terminal-black border border-ui-border">
      {/* Header */}
      <div className="px-3 py-2 border-b border-shadow-grid">
        <div className="font-display text-[10px] text-classified-grey tracking-[0.2em]">
          MAGI SUPERCOMPUTER ARRAY
        </div>
        <div className="terminal-text text-[11px] text-phosphor-dim mt-0.5">
          NERV CENTRAL COMPUTER SYSTEM
        </div>
      </div>

      {/* MAGI Units */}
      <div className="flex-1 grid grid-cols-3 divide-x divide-shadow-grid overflow-hidden">
        {units.map((unit, i) => (
          <MagiUnitColumn
            key={unit.id}
            unit={unit}
            isEasterEggActive={isEasterEgg && i === 2}
          />
        ))}
      </div>

      {/* Consensus Result */}
      <div
        className={cn(
          "px-3 py-2 border-t border-shadow-grid",
          "flex items-center justify-between"
        )}
      >
        <div className="flex flex-col">
          <span className="font-body text-[9px] text-classified-grey tracking-[0.1em]">
            CONSENSUS RESULT
          </span>
          <span
            className={cn(
              "font-display text-[14px] tracking-[0.1em] mt-0.5",
              consensusReached
                ? "text-data-positive text-glow-phosphor"
                : "text-bloodwarn-text"
            )}
          >
            {consensusReached
              ? `APPROVED [${approvedCount}/3]`
              : `PENDING [${approvedCount}/3]`}
          </span>
        </div>

        {/* Required threshold indicator */}
        <span className="font-body text-[9px] text-classified-grey">
          2/3 REQUIRED
        </span>
      </div>
    </div>
  );
}

// ── MAGI UNIT COLUMN ──────────────────────────────────────────────────────────────

interface MagiUnitColumnProps {
  unit: MagiUnitState;
  isEasterEggActive: boolean;
}

function MagiUnitColumn({ unit, isEasterEggActive }: MagiUnitColumnProps) {
  const VOTE_STYLES: Record<MagiVote, string> = {
    APPROVED: "bg-data-positive shadow-[0_0_10px_rgba(0,204,51,0.6)]",
    DENIED: "bg-bloodwarn shadow-bloodwarn",
    CALCULATING:
      "bg-transparent border-2 border-amber-bright animate-neon-pulse",
    OVERRIDE: "bg-threat-unknown shadow-[0_0_10px_rgba(153,51,204,0.6)]",
  };

  return (
    <div className="flex flex-col p-2 gap-2">
      {/* Unit header */}
      <div className="text-center">
        <div
          className={cn(
            "font-display text-[10px] tracking-[0.15em]",
            isEasterEggActive ? "text-threat-unknown" : "text-amber-core"
          )}
        >
          MAGI-0{["CASPER", "BALTHASAR", "MELCHIOR"].indexOf(unit.id) + 1}
        </div>
        <div className="font-display text-[9px] text-classified-grey tracking-[0.1em]">
          {unit.id}
        </div>
        <div className="font-body text-[8px] text-classified-grey/60 tracking-[0.05em]">
          [{unit.archetype}]
        </div>
      </div>

      {/* Vote indicator circle */}
      <div className="flex justify-center">
        <div
          className={cn(
            "w-7 h-7 rounded-full transition-all duration-500",
            VOTE_STYLES[unit.vote],
            unit.vote === "CALCULATING" && "animate-[spin_2s_linear_infinite]"
          )}
        />
      </div>

      {/* Vote label */}
      <div className="text-center">
        <span
          className={cn(
            "terminal-text text-[11px]",
            unit.vote === "APPROVED" && "text-data-positive",
            unit.vote === "DENIED" && "text-bloodwarn-text",
            unit.vote === "CALCULATING" &&
              "text-amber-bright animate-neon-pulse",
            unit.vote === "OVERRIDE" && "text-threat-unknown"
          )}
        >
          {unit.vote}
        </span>
      </div>

      {/* Probability */}
      {unit.vote !== "CALCULATING" && (
        <div className="text-center">
          <span
            className={cn(
              "terminal-text text-[10px]",
              isEasterEggActive ? "text-threat-unknown" : "text-phosphor-mid"
            )}
          >
            {(unit.probability * 100).toFixed(4)}%
          </span>
        </div>
      )}

      {/* Terminal output */}
      <div
        className={cn(
          "flex-1 overflow-hidden space-y-0.5 p-1",
          "bg-void-black border border-shadow-grid"
        )}
      >
        {unit.output.map((line, i) => (
          <div
            key={i}
            className={cn(
              "terminal-text text-[9px] leading-relaxed truncate",
              i === unit.output.length - 1
                ? isEasterEggActive
                  ? "text-threat-unknown"
                  : "text-phosphor"
                : "text-phosphor-dim",
              i === 0 && "opacity-30",
              i === 1 && "opacity-50",
              i === 2 && "opacity-70"
            )}
          >
            {line}
          </div>
        ))}
        {/* Blinking cursor at end */}
        <span className="terminal-text text-[9px] text-phosphor animate-cursor-blink">
          _
        </span>
      </div>
    </div>
  );
}
