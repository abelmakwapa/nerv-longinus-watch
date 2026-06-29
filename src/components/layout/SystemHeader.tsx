// filepath: src/components/layout/SystemHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useActiveTab, useAlertTier, useStore, useDataSource, useIsRefreshing } from "@/store";

const NAV_TABS = [
  { id: "surveillance", label: "SURVEILLANCE" },
  { id: "tracking", label: "TRACKING" },
  { id: "threat-analysis", label: "THREAT ANALYSIS" },
  { id: "magi-interface", label: "MAGI INTERFACE" },
  { id: "archive", label: "ARCHIVE" },
  { id: "classified", label: "████████", redacted: true },
];

const SYSTEM_STATUS_LEDS = [
  { label: "MAGI", color: "#00CC33", active: true },
  { label: "ARRAY", color: "#00CC33", active: true },
  { label: "COMMS", color: "#FFB000", active: true },
  { label: "POWER", color: "#00CC33", active: true },
];

export function SystemHeader() {
  const activeTab = useActiveTab();
  const setActiveTab = useStore((s) => s.setActiveTab);
  const dataSource = useDataSource();
  const isRefreshing = useIsRefreshing();
  const alertTier = useAlertTier();

  const [utcTime, setUtcTime] = useState<string>("--:--:--");
  const [hexCounter, setHexCounter] = useState<number>(0);
  const [frameCount, setFrameCount] = useState<number>(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().split(" ")[4] ?? "--:--:--");
      setHexCounter((prev) => (prev + 1) & 0xffffff);
      setFrameCount((prev) => (prev + 1) & 0xffff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const isHighAlert =
    alertTier === "PRIORITY_RED" || alertTier === "PATTERN_BLUE";

  return (
    <header
      className={cn(
        "flex items-stretch h-12 shrink-0 relative z-50",
        "bg-terminal-black border-b",
        isHighAlert
          ? alertTier === "PATTERN_BLUE"
            ? "border-b-pattern-blue-mid/60"
            : "border-b-bloodwarn/60"
          : "border-b-nerv-orange/40"
      )}
      style={{
        boxShadow: isHighAlert
          ? alertTier === "PATTERN_BLUE"
            ? "0 2px 20px rgba(0, 68, 255, 0.2)"
            : "0 2px 20px rgba(204, 0, 0, 0.25)"
          : "0 2px 12px rgba(255, 102, 0, 0.12)",
      }}
    >
      {/* Top edge accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: isHighAlert
            ? alertTier === "PATTERN_BLUE"
              ? "linear-gradient(90deg, transparent, #0044FF, #4488FF, #0044FF, transparent)"
              : "linear-gradient(90deg, transparent, #CC0000, #FF1111, #CC0000, transparent)"
            : "linear-gradient(90deg, transparent, #FF6600, #FFB347, #FF6600, transparent)",
          opacity: 0.6,
        }}
      />

      {/* ── NERV IDENTITY ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 border-r border-shadow-grid shrink-0"
        style={{ minWidth: 130 }}
      >
        <NervLogo alertTier={alertTier} />
        <div className="flex flex-col">
          <span
            className={cn(
              "font-display text-[11px] tracking-[0.2em] leading-none",
              isHighAlert
                ? alertTier === "PATTERN_BLUE"
                  ? "text-pattern-blue-bright"
                  : "text-bloodwarn-text"
                : "text-nerv-orange"
            )}
          >
            NERV
          </span>
          <span className="font-body text-classified-grey text-[7px] tracking-[0.12em] leading-none mt-0.5">
            SPECIAL AGENCY
          </span>
        </div>
      </div>

      {/* ── SYSTEM TITLE ───────────────────────────────────────────────────────── */}
      <div className="hidden sm:flex flex-col justify-center px-4 border-r border-shadow-grid shrink-0">
        <span className="font-display text-amber-core text-[10px] tracking-[0.15em] leading-none">
          DEEP SPACE DEFENSE GRID
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="terminal-text text-phosphor-mid text-[10px] leading-none">
            ANGEL APPROACH SYSTEM // LONGINUS WATCH
          </span>
          {/* Frame counter */}
          <span className="font-body text-[7px] text-classified-grey/40">
            [{frameCount.toString(16).toUpperCase().padStart(4, "0")}]
          </span>
        </div>
      </div>

      {/* ── NAVIGATION TABS ────────────────────────────────────────────────────── */}
      <nav className="hidden lg:flex items-stretch flex-1 overflow-hidden">
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.redacted && setActiveTab(tab.id)}
              disabled={tab.redacted}
              className={cn(
                "relative flex items-center justify-center px-4 h-full shrink-0",
                "font-display text-[10px] tracking-[0.15em]",
                "border-r border-shadow-grid",
                "transition-colors duration-150",
                !tab.redacted &&
                  !isActive &&
                  "text-classified-grey hover:text-amber-warm hover:bg-nerv-black",
                isActive && "text-nerv-orange bg-void-black",
                tab.redacted &&
                  "cursor-default text-classified-grey/30 bg-terminal-black"
              )}
            >
              {/* Active tab bottom indicator */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-nerv-orange"
                  layoutId="active-tab-indicator"
                  style={{ boxShadow: "0 0 8px #FF6600" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {/* Active tab top glow */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-px bg-nerv-orange/40" />
              )}
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* On mobile, flex-1 spacer to push clock right */}
      <div className="flex-1 lg:hidden" />

      {/* ── OPERATOR STATUS ─────────────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-3 px-4 border-l border-shadow-grid shrink-0">
        <div className="flex flex-col items-end">
          <span className="font-body text-[9px] text-classified-grey tracking-[0.1em]">
            OPERATOR: LONGINUS-7
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Data source LED */}
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  isRefreshing
                    ? "#FFB000"
                    : dataSource === "live"
                    ? "#00CC33"
                    : "#997700",
                boxShadow: isRefreshing
                  ? "0 0 6px #FFB000"
                  : dataSource === "live"
                  ? "0 0 6px #00CC33"
                  : "none",
                animation: isRefreshing ? "neon-pulse 1s ease-in-out infinite" : "none",
              }}
            />
            <span
              className={cn(
                "font-body text-[8px] tracking-[0.08em]",
                dataSource === "live" && !isRefreshing && "text-data-positive",
                dataSource !== "live" && !isRefreshing && "text-amber-dim",
                isRefreshing && "text-amber-warm animate-neon-pulse"
              )}
            >
              {isRefreshing
                ? "REFRESHING..."
                : dataSource === "live"
                ? "TELEMETRY: LIVE"
                : dataSource === "mock"
                ? "TELEMETRY: MOCK DATA"
                : "TELEMETRY: CONNECTING"}
            </span>
          </div>
        </div>

        {/* Status LEDs with labels */}
        <div className="flex gap-2">
          {SYSTEM_STATUS_LEDS.map(({ label, color, active }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <div className="relative">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: active ? color : "#2A3040",
                    boxShadow: active ? `0 0 5px ${color}` : "none",
                  }}
                />
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: SYSTEM_STATUS_LEDS.findIndex((l) => l.label === label) * 0.3,
                    }}
                  />
                )}
              </div>
              <span className="font-body text-[6px] text-classified-grey/50 tracking-[0.05em]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── UTC CLOCK + HEX COUNTER ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col justify-center items-end px-4 border-l border-shadow-grid shrink-0 min-w-[148px]"
      >
        <span
          className={cn(
            "terminal-text text-[18px] leading-none",
            isHighAlert
              ? alertTier === "PATTERN_BLUE"
                ? "text-pattern-blue-bright"
                : "text-bloodwarn-text animate-critical-blink"
              : "text-phosphor text-glow-phosphor"
          )}
        >
          {utcTime}
        </span>
        <div className="flex gap-2 items-center mt-0.5">
          <span className="font-body text-[7px] text-classified-grey tracking-[0.08em]">
            UTC+0 // ZULU
          </span>
          <span className="terminal-text text-phosphor-dim text-[9px] tabular-nums">
            {hexCounter.toString(16).toUpperCase().padStart(6, "0")}
          </span>
        </div>
      </div>
    </header>
  );
}

function NervLogo({ alertTier }: { alertTier: string }) {
  const isHighAlert =
    alertTier === "PRIORITY_RED" || alertTier === "PATTERN_BLUE";
  const strokeColor =
    alertTier === "PATTERN_BLUE"
      ? "#4488FF"
      : alertTier === "PRIORITY_RED"
      ? "#CC0000"
      : "#FF6600";
  const fillColor =
    alertTier === "PATTERN_BLUE"
      ? "#0044FF"
      : alertTier === "PRIORITY_RED"
      ? "#CC0000"
      : "#FF6600";

  return (
    <motion.svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      className="shrink-0"
      aria-label="NERV logo"
      animate={
        isHighAlert
          ? {
              filter: [
                `drop-shadow(0 0 4px ${strokeColor})`,
                `drop-shadow(0 0 10px ${strokeColor})`,
                `drop-shadow(0 0 4px ${strokeColor})`,
              ],
            }
          : { filter: "drop-shadow(0 0 3px rgba(255,102,0,0.4))" }
      }
      transition={isHighAlert ? { duration: 1.5, repeat: Infinity } : {}}
    >
      {/* Outer rings */}
      <circle cx="14" cy="14" r="13" fill="none" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="14" cy="14" r="10" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.3" />
      {/* Left half — filled */}
      <path d="M 14,1 A 13,13 0 0,0 14,27 Z" fill={fillColor} opacity="0.9" />
      {/* Right half — dark */}
      <path d="M 14,1 A 13,13 0 0,1 14,27 Z" fill="#060A0F" />
      {/* Center spine */}
      <line x1="14" y1="1" x2="14" y2="27" stroke={strokeColor} strokeWidth="1" />
      {/* Inner leaf */}
      <ellipse cx="14" cy="14" rx="4" ry="8" fill="none" stroke={strokeColor} strokeWidth="0.75" opacity="0.5" />
      {/* Tick marks */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1={14 + 13 * Math.cos((deg * Math.PI) / 180)}
          y1={14 + 13 * Math.sin((deg * Math.PI) / 180)}
          x2={14 + 10 * Math.cos((deg * Math.PI) / 180)}
          y2={14 + 10 * Math.sin((deg * Math.PI) / 180)}
          stroke={strokeColor}
          strokeWidth="1"
          opacity="0.35"
        />
      ))}
    </motion.svg>
  );
}
