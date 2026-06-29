// filepath: src/components/alerts/AlertBanner.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useAlertTier, usePriorityObject } from "@/store";
import { formatApproachDate, formatProbability, formatCountdown } from "@/lib/utils/format";
import type { ThreatTier } from "@/types/asteroid.types";

const BANNER_TIERS: ThreatTier[] = ["PRIORITY_AMBER", "PRIORITY_RED", "PATTERN_BLUE"];

const TIER_CONFIG: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    accentText: string;
    pulse?: boolean;
    blink?: boolean;
    prefix: string;
  }
> = {
  PRIORITY_AMBER: {
    bg: "bg-amber-deep border-amber-core/40",
    border: "border-amber-core/40",
    text: "text-amber-bright",
    accentText: "text-amber-core",
    prefix: "⚠ PRIORITY AMBER",
  },
  PRIORITY_RED: {
    bg: "bg-bloodwarn-deep border-bloodwarn/60",
    border: "border-bloodwarn/60",
    text: "text-bloodwarn-text",
    accentText: "text-bloodwarn-bright",
    pulse: true,
    prefix: "🔴 PRIORITY RED — IMPACT TRAJECTORY CONFIRMED",
  },
  PATTERN_BLUE: {
    bg: "bg-void-black border-pattern-blue-mid/60",
    border: "border-pattern-blue-mid/60",
    text: "text-pattern-blue-bright",
    accentText: "text-pattern-blue-glow",
    blink: true,
    prefix: "◈ PATTERN BLUE — ANGEL-CLASS EVENT DETECTED",
  },
};

export function AlertBanner() {
  const tier = useAlertTier();
  const priority = usePriorityObject();

  const isVisible = BANNER_TIERS.includes(tier) && !!priority;
  const config = TIER_CONFIG[tier];

  return (
    <AnimatePresence>
      {isVisible && config && (
        <motion.div
          className={cn(
            "w-full shrink-0 overflow-hidden border-b",
            config.border
          )}
          style={{
            backgroundColor:
              tier === "PATTERN_BLUE"
                ? "rgba(0, 4, 20, 0.95)"
                : tier === "PRIORITY_RED"
                ? "rgba(40, 0, 0, 0.95)"
                : "rgba(20, 12, 0, 0.95)",
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Warning stripe at top edge */}
          <div
            className="h-0.5 w-full"
            style={{
              background:
                tier === "PATTERN_BLUE"
                  ? "repeating-linear-gradient(90deg, #0044FF 0px, #0044FF 8px, transparent 8px, transparent 14px)"
                  : tier === "PRIORITY_RED"
                  ? "repeating-linear-gradient(90deg, #CC0000 0px, #CC0000 8px, transparent 8px, transparent 14px)"
                  : "repeating-linear-gradient(90deg, #FF6600 0px, #FF6600 8px, transparent 8px, transparent 14px)",
            }}
          />

          <div className="flex items-center justify-between px-4 py-1.5">
            {/* Left: Alert identifier */}
            <div className="flex items-center gap-3">
              {/* Pulsing indicator */}
              <motion.div
                className="relative flex items-center justify-center"
                animate={
                  tier === "PRIORITY_RED" || tier === "PATTERN_BLUE"
                    ? { opacity: [1, 0.2, 1] }
                    : {}
                }
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      tier === "PATTERN_BLUE"
                        ? "#4488FF"
                        : tier === "PRIORITY_RED"
                        ? "#FF1111"
                        : "#FFB000",
                    boxShadow:
                      tier === "PATTERN_BLUE"
                        ? "0 0 8px #4488FF, 0 0 16px #0044FF"
                        : tier === "PRIORITY_RED"
                        ? "0 0 8px #FF1111, 0 0 16px #CC0000"
                        : "0 0 8px #FFB000",
                  }}
                />
                {(tier === "PRIORITY_RED" || tier === "PATTERN_BLUE") && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor:
                        tier === "PATTERN_BLUE" ? "#4488FF" : "#FF1111",
                    }}
                    animate={{ scale: [1, 2.5, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <span
                className={cn(
                  "font-display text-[11px] tracking-[0.16em] font-bold",
                  config.accentText
                )}
              >
                {config.prefix}
              </span>

              <span className="text-classified-grey/40 font-body text-[10px]">
                //
              </span>

              <span className={cn("font-body text-[10px] tracking-[0.06em]", config.text)}>
                {priority!.designation} — {priority!.nervCodename}
              </span>
            </div>

            {/* Right: Key metrics */}
            <div className="flex items-center gap-5 shrink-0">
              <MetricChip
                label="P(IMPACT)"
                value={formatProbability(priority!.threat.impactProbability)}
                color={
                  tier === "PATTERN_BLUE"
                    ? "#4488FF"
                    : tier === "PRIORITY_RED"
                    ? "#FF4444"
                    : "#FFB000"
                }
              />
              {priority!.closestApproach && (
                <>
                  <MetricChip
                    label="T-MINUS"
                    value={formatCountdown(priority!.closestApproach.epochMs)}
                    color={
                      tier === "PATTERN_BLUE"
                        ? "#4488FF"
                        : tier === "PRIORITY_RED"
                        ? "#FF4444"
                        : "#FFB000"
                    }
                    blink={tier === "PRIORITY_RED"}
                  />
                  <MetricChip
                    label="APPROACH"
                    value={formatApproachDate(priority!.closestApproach.date)}
                    color="#4A5566"
                  />
                </>
              )}
            </div>
          </div>

          {/* Pattern Blue: second row with additional alert */}
          {tier === "PATTERN_BLUE" && (
            <motion.div
              className="px-4 py-1 border-t border-pattern-blue-mid/20 pattern-blue-stripe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-body text-[9px] text-pattern-blue-bright/70 tracking-[0.1em]">
                MAGI SYSTEM ALERT // A.T. FIELD PROBABILITY: {(priority!.atFieldProbability * 100).toFixed(3)}% //
                EVANGELION UNITS ON STANDBY // ESCALATION PROTOCOL OMEGA ACTIVE
              </span>
            </motion.div>
          )}

          {/* Bottom stripe */}
          <div
            className="h-px w-full"
            style={{
              background:
                tier === "PATTERN_BLUE"
                  ? "linear-gradient(90deg, transparent, #0044FF50, transparent)"
                  : tier === "PRIORITY_RED"
                  ? "linear-gradient(90deg, transparent, #CC000050, transparent)"
                  : "linear-gradient(90deg, transparent, #FF660050, transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetricChip({
  label,
  value,
  color,
  blink = false,
}: {
  label: string;
  value: string;
  color: string;
  blink?: boolean;
}) {
  return (
    <div className="flex flex-col items-end">
      <span className="font-body text-[8px] text-classified-grey tracking-[0.1em]">
        {label}
      </span>
      <motion.span
        className="terminal-text text-[13px] leading-none"
        style={{ color }}
        animate={blink ? { opacity: [1, 0.2, 1] } : {}}
        transition={blink ? { duration: 1.6, repeat: Infinity } : {}}
      >
        {value}
      </motion.span>
    </div>
  );
}
