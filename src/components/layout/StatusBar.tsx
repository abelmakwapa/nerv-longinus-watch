// filepath: src/components/layout/StatusBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useAlertTier, useDataSource } from "@/store";

const CHATTER_MESSAGES = [
  "MAGI-01 CASPER > ORBITAL CALCULATION CYCLE COMPLETE",
  "MAGI-02 BALTHASAR > PROBABILITY ENGINE NOMINAL",
  "MAGI-03 MELCHIOR > ASSESSMENT VARIANCE: ACCEPTABLE",
  "SYS > TRACKING ARRAY: 2847 OBJECTS IN DATABASE",
  "SYS > TELEMETRY FEED: NOMINAL — LAST UPDATE: T+00:00:03",
  "SYS > CLOSE APPROACH WINDOW: 7-DAY ACTIVE HORIZON",
  "MAGI-01 CASPER > PATTERN RECOGNITION MODULE ACTIVE",
  "SYS > AT FIELD DETECTION ARRAY: NOMINAL — ALL READINGS 0.000%",
  "SYS > AT FIELD DETECTION ARRAY: 0.000% 0.000% 0.000%",
  "MAGI-03 MELCHIOR > QUERY REF: DEAD SEA SCROLL ANNEX-7 — COMPLETE",
  "SYS > SOUL CONTAINMENT: 97.3% — NOMINAL",
  "SYS > SESSION LOG INDEX INCREMENTING",
  "MAGI-02 BALTHASAR > RISK MATRIX UPDATED — 23 PRIORITY OBJECTS",
  "SYS > ABSENCE OF DATA IS NOT ABSENCE OF THREAT",
  "SYS > EVANGELION UNIT-01 — STANDBY STATUS: ACTIVE",
  "MAGI-03 MELCHIOR > TERMINAL DOGMA ACCESS LOG CLEARED",
  "SYS > SECOND IMPACT MEMORIAL: STATUS ARCHIVED",
];

const ALL_MESSAGES = [...CHATTER_MESSAGES, ...CHATTER_MESSAGES];

export function StatusBar() {
  const alertTier = useAlertTier();
  const dataSource = useDataSource();

  const isHighAlert =
    alertTier === "PRIORITY_RED" || alertTier === "PATTERN_BLUE";

  const borderColor =
    alertTier === "PATTERN_BLUE"
      ? "border-t-pattern-blue-mid/40"
      : alertTier === "PRIORITY_RED"
      ? "border-t-bloodwarn/40"
      : "border-t-nerv-orange-dim/40";

  return (
    <footer
      className={cn(
        "flex items-center h-12 shrink-0",
        "bg-terminal-black border-t",
        borderColor,
        "relative z-50 overflow-hidden"
      )}
      style={{
        boxShadow: isHighAlert
          ? alertTier === "PATTERN_BLUE"
            ? "0 -2px 16px rgba(0, 68, 255, 0.15)"
            : "0 -2px 16px rgba(204, 0, 0, 0.2)"
          : "0 -2px 8px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Bottom edge accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: isHighAlert
            ? alertTier === "PATTERN_BLUE"
              ? "linear-gradient(90deg, transparent, #0044FF30, transparent)"
              : "linear-gradient(90deg, transparent, #CC000030, transparent)"
            : "linear-gradient(90deg, transparent, #FF660020, transparent)",
        }}
      />

      <div className="flex items-center gap-3 px-4 h-full">
        {/* System version — desktop only */}
        <span className="hidden sm:inline terminal-text text-[10px] text-classified-grey shrink-0 tracking-[0.05em]">
          NERV // LONGINUS WATCH // REV 4.7.1-DELTA
        </span>

        <Divider className="hidden sm:block" />

        {/* MAGI status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex gap-1">
            {["01", "02", "03"].map((n) => (
              <div
                key={n}
                className="w-1 h-1 rounded-full bg-data-positive"
                style={{ boxShadow: "0 0 4px #00CC33" }}
              />
            ))}
          </div>
          <span className="hidden sm:inline font-body text-[10px] text-data-positive tracking-[0.08em]">
            MAGI: NOMINAL
          </span>
        </div>

        <Divider />

        {/* Data source */}
        <span
          className={cn(
            "font-body text-[10px] shrink-0 tracking-[0.06em]",
            dataSource === "live" ? "text-data-positive" : "text-amber-dim"
          )}
        >
          {dataSource === "live" ? "● LIVE" : "○ MOCK"}
        </span>

        <Divider className="hidden sm:block" />

        {/* Tracking count — desktop only */}
        <span className="hidden sm:inline font-body text-[10px] text-amber-warm shrink-0">
          2847 OBJ // 23 PRIORITY
        </span>

        <Divider className="hidden sm:block" />

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #060A0F, transparent)" }} />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{ background: "linear-gradient(270deg, #060A0F, transparent)" }} />

          <div className="ticker-track">
            {ALL_MESSAGES.map((msg, i) => (
              <span
                key={i}
                className="terminal-text text-[10px] text-phosphor-dim shrink-0 px-4"
              >
                {msg}
                <span className="text-classified-grey/30 px-2">░</span>
              </span>
            ))}
          </div>
        </div>

        <Divider />

        {/* Alert tier indicator */}
        {isHighAlert && (
          <>
            <motion.span
              className={cn(
                "font-display text-[9px] tracking-[0.15em] shrink-0 px-2 py-0.5 border",
                alertTier === "PATTERN_BLUE"
                  ? "text-pattern-blue-bright border-pattern-blue-mid/60 bg-pattern-blue-mid/10"
                  : "text-bloodwarn-text border-bloodwarn/50 bg-bloodwarn/10"
              )}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {alertTier === "PATTERN_BLUE" ? "PATTERN BLUE" : "PRIORITY RED"}
            </motion.span>
            <Divider />
          </>
        )}

        {/* Soul containment — desktop only */}
        <span
          className="hidden md:inline font-body text-[10px] text-amber-dim shrink-0 cursor-help"
          title="SYSTEM: PILOT SYNC ARRAY // UNIT-01 — THIS VALUE HAS NEVER REACHED 100%"
        >
          SOUL CONTAINMENT: 97.3%
        </span>
      </div>
    </footer>
  );
}

function Divider({ className }: { className?: string }) {
  return <div className={cn("w-px h-4 bg-shadow-grid shrink-0", className)} />;
}
