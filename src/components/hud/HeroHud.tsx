// filepath: src/components/hud/HeroHud.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import {
  useStore,
  useAlertTier,
  usePriorityObject,
  useSelectedId,
  useHoveredId,
} from "@/store";
import { TIER_HEX } from "@/lib/three/nerv-colors";
import { soundEngine } from "@/lib/sound/SoundEngine";
import {
  formatProbability,
  formatCountdown,
  formatThreatTier,
  formatDistanceLd,
} from "@/lib/utils/format";
import { SurveillanceList } from "@/components/asteroid/SurveillanceList";
import type { AsteroidListResponse, NervAsteroid } from "@/types/asteroid.types";

// ── shared glass panel shell ─────────────────────────────────────────────────────────

function GlassPanel({
  accent,
  title,
  subtitle,
  children,
  className,
}: {
  accent: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto relative bg-[#04060a]/55 backdrop-blur-md border",
        className
      )}
      style={{ borderColor: `${accent}33`, boxShadow: `0 0 30px ${accent}1f, inset 0 0 30px rgba(0,0,0,0.5)` }}
    >
      {/* top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.7 }}
      />
      <div className="px-3 py-2 border-b" style={{ borderColor: `${accent}22` }}>
        <div className="font-display text-[10px] tracking-[0.22em]" style={{ color: accent }}>
          {title}
        </div>
        {subtitle && (
          <div className="font-body text-[8px] tracking-[0.14em] text-[#5a6678] mt-0.5">{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

// ── LEFT: COMMAND RAIL (alert posture + priority object + MAGI) ───────────────────────

export function CommandRail() {
  const tier = useAlertTier();
  const priority = usePriorityObject();
  const accent = TIER_HEX[tier];
  const [, force] = useState(0);

  // tick the countdown every second
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute top-4 left-4 z-30 w-60 space-y-3 pointer-events-none">
      <GlassPanel accent={accent} title="ALERT POSTURE" subtitle="MAGI CONSENSUS DIRECTIVE">
        <div className="px-3 py-3">
          <motion.div
            key={tier}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            className="font-display text-[20px] leading-none tracking-[0.08em]"
            style={{ color: accent, textShadow: `0 0 18px ${accent}99` }}
          >
            {formatThreatTier(tier)}
          </motion.div>

          {priority ? (
            <div className="mt-3 space-y-2">
              <div>
                <div className="font-display text-[11px] text-[#e8c47a] tracking-[0.05em] truncate">
                  {priority.designation}
                </div>
                <div className="font-body text-[8px] tracking-[0.12em] text-[#5a6678]">
                  NERV CODENAME: {priority.nervCodename}
                </div>
              </div>
              <StatLine label="P(IMPACT)" value={formatProbability(priority.threat.impactProbability)} accent={accent} />
              {priority.closestApproach && (
                <StatLine
                  label="T-MINUS"
                  value={formatCountdown(priority.closestApproach.epochMs)}
                  mono
                />
              )}
              {priority.closestApproach && (
                <StatLine label="MISS DIST" value={formatDistanceLd(priority.closestApproach.distanceLd)} />
              )}
            </div>
          ) : (
            <div className="mt-3 terminal-text text-[10px] text-[#5a6678]">SYS &gt; AWAITING TELEMETRY…</div>
          )}
        </div>
      </GlassPanel>

      <GlassPanel accent={accent} title="MAGI NETWORK" subtitle="CASPER · BALTHASAR · MELCHIOR">
        <div className="px-3 py-2.5 space-y-1.5">
          {["CASPER", "BALTHASAR", "MELCHIOR"].map((u, i) => (
            <div key={u} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#39ff7a", boxShadow: "0 0 6px #39ff7a", animationDelay: `${i * 0.4}s` }}
                />
                <span className="font-body text-[9px] tracking-[0.1em] text-[#7d8a9c]">MAGI-0{i + 1} {u}</span>
              </div>
              <span className="font-body text-[8px] tracking-[0.12em] text-[#39ff7a]">NOMINAL</span>
            </div>
          ))}
          <div className="pt-1 mt-1 border-t border-[#1a2230] flex items-center justify-between">
            <span className="font-body text-[8px] tracking-[0.12em] text-[#5a6678]">CONSENSUS</span>
            <span className="font-display text-[9px] tracking-[0.14em]" style={{ color: accent }}>
              {priority ? "UNANIMOUS" : "STANDBY"}
            </span>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function StatLine({ label, value, accent, mono }: { label: string; value: string; accent?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-body text-[8px] tracking-[0.14em] text-[#5a6678]">{label}</span>
      <span className={cn("text-[11px]", mono && "terminal-text tabular-nums")} style={{ color: accent ?? "#9fb4c8" }}>
        {value}
      </span>
    </div>
  );
}

// ── RIGHT: TRACKING RAIL (live NEO roster) ────────────────────────────────────────────

export function TrackingRail() {
  const { data } = useQuery<AsteroidListResponse>({ queryKey: ["asteroids"], enabled: false, staleTime: 14 * 60 * 1000 });
  const tier = useAlertTier();
  const accent = TIER_HEX[tier];
  const selectedId = useSelectedId();
  const hoveredId = useHoveredId();
  const selectAsteroid = useStore((s) => s.selectAsteroid);
  const hoverAsteroid = useStore((s) => s.hoverAsteroid);

  const sorted = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => b.threat.score - a.threat.score),
    [data]
  );

  return (
    <div className="absolute top-4 right-4 z-30 w-60 pointer-events-none">
      <GlassPanel accent={accent} title="ACTIVE TRACKING" subtitle={`${sorted.length} OBJECTS // SORTED BY THREAT`}>
        <div className="max-h-[52vh] overflow-y-auto">
          {sorted.map((a) => (
            <TrackingRow
              key={a.id}
              asteroid={a}
              selected={selectedId === a.id}
              hovered={hoveredId === a.id}
              onSelect={() => {
                soundEngine?.play("ui_select");
                selectAsteroid(a.id);
              }}
              onHover={(h) => hoverAsteroid(h ? a.id : null)}
            />
          ))}
          {sorted.length === 0 && (
            <div className="px-3 py-6 text-center terminal-text text-[10px] text-[#5a6678]">
              SYS &gt; NO OBJECTS IN FEED
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

function TrackingRow({
  asteroid,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  asteroid: NervAsteroid;
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  const c = TIER_HEX[asteroid.threat.tier];
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors duration-100 border-l-2",
        selected ? "bg-white/[0.06]" : hovered ? "bg-white/[0.03]" : "bg-transparent"
      )}
      style={{ borderLeftColor: selected || hovered ? c : "transparent" }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
      <div className="flex-1 min-w-0">
        <div className="font-display text-[9px] tracking-[0.04em] text-[#cdd8e6] truncate">
          {asteroid.designation}
        </div>
        <div className="font-body text-[7px] tracking-[0.1em] text-[#5a6678] truncate">
          {asteroid.nervCodename}
        </div>
      </div>
      <span className="terminal-text text-[9px] tabular-nums shrink-0" style={{ color: c }}>
        {formatProbability(asteroid.threat.impactProbability)}
      </span>
    </button>
  );
}

// ── BOTTOM: SURVEILLANCE ROSTER DRAWER ────────────────────────────────────────────────

export function RosterDrawer() {
  const [open, setOpen] = useState(false);
  const tier = useAlertTier();
  const accent = TIER_HEX[tier];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="flex justify-center">
        <button
          onClick={() => {
            soundEngine?.play("ui_click");
            setOpen((v) => !v);
          }}
          className="pointer-events-auto px-5 py-1 mb-px font-display text-[9px] tracking-[0.2em] bg-[#04060a]/80 backdrop-blur border-t border-x transition-colors"
          style={{ borderColor: `${accent}44`, color: accent }}
        >
          {open ? "▼ COLLAPSE SURVEILLANCE ROSTER" : "▲ EXPAND SURVEILLANCE ROSTER"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "46vh", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="pointer-events-auto overflow-hidden bg-[#04060a]/90 backdrop-blur-md border-t"
            style={{ borderColor: `${accent}44` }}
          >
            <div className="h-full">
              <SurveillanceList />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
