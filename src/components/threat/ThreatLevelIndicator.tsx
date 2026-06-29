// filepath: src/components/threat/ThreatLevelIndicator.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { formatCountdown } from "@/lib/utils/format";
import { useAlertTier, usePriorityObject } from "@/store";
import type { ThreatTier } from "@/types/asteroid.types";

const TIER_TEXT_SIZE: Record<ThreatTier, string> = {
  MINIMAL: "text-xl",
  MONITOR: "text-2xl",
  ELEVATED: "text-3xl",
  PRIORITY_AMBER: "text-4xl",
  PRIORITY_RED: "text-5xl",
  PATTERN_BLUE: "text-6xl",
};

const TIER_COLOR: Record<ThreatTier, string> = {
  MINIMAL: "#006614",
  MONITOR: "#00CC33",
  ELEVATED: "#FFB000",
  PRIORITY_AMBER: "#FF6600",
  PRIORITY_RED: "#FF4444",
  PATTERN_BLUE: "#4488FF",
};

const TIER_GLOW: Record<ThreatTier, string> = {
  MINIMAL: "",
  MONITOR: "text-glow-phosphor",
  ELEVATED: "text-glow-amber",
  PRIORITY_AMBER: "text-glow-orange",
  PRIORITY_RED: "text-glow-red",
  PATTERN_BLUE: "text-glow-blue",
};

const TIER_ANIMATION: Record<ThreatTier, string> = {
  MINIMAL: "",
  MONITOR: "animate-neon-pulse",
  ELEVATED: "animate-neon-pulse",
  PRIORITY_AMBER: "animate-neon-pulse",
  PRIORITY_RED: "animate-critical-blink",
  PATTERN_BLUE: "animate-pattern-blue-pulse",
};

const TIER_BG: Record<ThreatTier, string> = {
  MINIMAL: "bg-terminal-black",
  MONITOR: "bg-terminal-black",
  ELEVATED: "bg-terminal-black",
  PRIORITY_AMBER: "bg-[rgba(20,8,0,0.95)]",
  PRIORITY_RED: "bg-[rgba(30,0,0,0.95)]",
  PATTERN_BLUE: "bg-[rgba(0,4,20,0.95)]",
};

const TIER_DISPLAY_TEXT: Record<ThreatTier, string[]> = {
  MINIMAL: ["MINIMAL"],
  MONITOR: ["MONITOR"],
  ELEVATED: ["ELEVATED"],
  PRIORITY_AMBER: ["PRIORITY", "AMBER"],
  PRIORITY_RED: ["PRIORITY", "RED"],
  PATTERN_BLUE: ["PATTERN", "BLUE"],
};

const SEVERITY_TIERS: ThreatTier[] = [
  "MINIMAL", "MONITOR", "ELEVATED", "PRIORITY_AMBER", "PRIORITY_RED", "PATTERN_BLUE",
];

const BAR_COLORS: Record<ThreatTier, string> = {
  MINIMAL: "#006614",
  MONITOR: "#00CC33",
  ELEVATED: "#FFB000",
  PRIORITY_AMBER: "#FF6600",
  PRIORITY_RED: "#FF4444",
  PATTERN_BLUE: "#4488FF",
};

interface ThreatLevelIndicatorProps {
  className?: string;
}

export function ThreatLevelIndicator({ className }: ThreatLevelIndicatorProps) {
  const tier = useAlertTier();
  const priorityObject = usePriorityObject();
  const prevTierRef = useRef<ThreatTier>(tier);

  const [countdown, setCountdown] = useState<string>("---:--:--:--");
  const [tierChanged, setTierChanged] = useState(false);

  useEffect(() => {
    if (prevTierRef.current !== tier) {
      setTierChanged(true);
      const t = setTimeout(() => setTierChanged(false), 800);
      prevTierRef.current = tier;
      return () => clearTimeout(t);
    }
  }, [tier]);

  useEffect(() => {
    if (!priorityObject?.closestApproach?.epochMs) {
      setCountdown("NO PRIORITY OBJECT");
      return;
    }
    const tick = () =>
      setCountdown(formatCountdown(priorityObject.closestApproach!.epochMs));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [priorityObject]);

  const tierIndex = SEVERITY_TIERS.indexOf(tier);
  const accentColor = TIER_COLOR[tier];

  const isHighAlert =
    tier === "PRIORITY_RED" || tier === "PATTERN_BLUE";

  return (
    <motion.div
      className={cn(
        "flex flex-col h-full border",
        TIER_BG[tier],
        className
      )}
      style={{
        borderColor: `${accentColor}40`,
        boxShadow: isHighAlert
          ? `0 0 20px ${accentColor}20, inset 0 0 30px ${accentColor}05`
          : "none",
      }}
      animate={
        tierChanged
          ? {
              boxShadow: [
                `0 0 0px ${accentColor}00`,
                `0 0 40px ${accentColor}60`,
                `0 0 20px ${accentColor}20`,
              ],
            }
          : {}
      }
      transition={{ duration: 0.6 }}
    >
      {/* Panel header */}
      <div
        className="px-3 pt-3 pb-2 border-b shrink-0"
        style={{ borderColor: `${accentColor}20` }}
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-[10px] text-classified-grey tracking-[0.2em]">
            THREAT LEVEL // CURRENT ASSESSMENT
          </span>
          {/* Tier escalation badge */}
          <AnimatePresence>
            {tierChanged && (
              <motion.span
                className="font-display text-[8px] tracking-[0.15em] px-1.5 py-0.5"
                style={{ color: accentColor, border: `1px solid ${accentColor}60` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                UPDATED
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main threat level text */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 gap-1 relative overflow-hidden">
        {/* Background pulse on high alert */}
        {isHighAlert && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: accentColor }}
            animate={{ opacity: [0, 0.04, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={tier}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {TIER_DISPLAY_TEXT[tier].map((word, i) => (
              <span
                key={i}
                className={cn(
                  "font-display font-bold text-center leading-none tracking-[0.05em]",
                  TIER_TEXT_SIZE[tier],
                  TIER_GLOW[tier],
                  TIER_ANIMATION[tier]
                )}
                style={{ color: accentColor }}
              >
                {word}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pattern Blue special text */}
        {tier === "PATTERN_BLUE" && (
          <motion.div
            className="mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="font-display text-[9px] text-pattern-blue-mid tracking-[0.25em]">
              ANGEL-CLASS EVENT DETECTED
            </span>
          </motion.div>
        )}
      </div>

      {/* Severity meter */}
      <div className="px-3 py-2 shrink-0">
        <span className="font-body text-[9px] text-classified-grey tracking-[0.1em] mb-2 block">
          SEVERITY INDEX
        </span>
        <div className="flex gap-1">
          {SEVERITY_TIERS.map((t, i) => {
            const isActive = i <= tierIndex;
            const isCurrentTier = i === tierIndex;
            const barColor = BAR_COLORS[t];
            return (
              <motion.div
                key={t}
                className="flex-1 h-1.5"
                style={{
                  backgroundColor: isActive ? barColor : "#0F1520",
                  boxShadow: isCurrentTier && isActive
                    ? `0 0 8px ${barColor}, 0 0 16px ${barColor}40`
                    : "none",
                }}
                animate={
                  isCurrentTier && isActive && isHighAlert
                    ? { opacity: [1, 0.5, 1] }
                    : { opacity: 1 }
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            );
          })}
        </div>

        {/* Tier labels under bars */}
        <div className="flex mt-0.5">
          {SEVERITY_TIERS.map((t, i) => (
            <div key={t} className="flex-1">
              {i === tierIndex && (
                <div className="h-1 flex justify-center">
                  <div
                    className="w-px"
                    style={{ backgroundColor: accentColor, opacity: 0.6 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data section */}
      <div
        className="px-3 pb-3 border-t pt-2 space-y-2 shrink-0"
        style={{ borderColor: `${accentColor}15` }}
      >
        {/* T-minus countdown */}
        <div>
          <span className="font-body text-[9px] text-classified-grey tracking-[0.08em] block mb-0.5">
            T-MINUS CLOSEST APPROACH
          </span>
          <motion.span
            className={cn(
              "terminal-text block leading-none",
              tier === "MINIMAL" ? "text-[16px]" : "text-[20px]",
              TIER_ANIMATION[tier]
            )}
            style={{
              color: accentColor,
              textShadow:
                isHighAlert
                  ? `0 0 10px ${accentColor}, 0 0 20px ${accentColor}60`
                  : undefined,
            }}
          >
            {countdown}
          </motion.span>
        </div>

        {/* Priority object */}
        {priorityObject && (
          <div>
            <span className="font-body text-[9px] text-classified-grey block mb-0.5">
              PRIORITY TARGET
            </span>
            <span
              className="font-display text-[11px] tracking-[0.1em] truncate block"
              style={{ color: "#E89020" }}
            >
              {priorityObject.designation}
            </span>
            <span className="font-body text-[8px] text-classified-grey/60 tracking-[0.06em]">
              NERV: {priorityObject.nervCodename}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
