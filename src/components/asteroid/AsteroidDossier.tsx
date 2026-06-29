// filepath: src/components/asteroid/AsteroidDossier.tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { useSelectedId, useStore } from "@/store";
import { soundEngine } from "@/lib/sound/SoundEngine";
import {
  formatCountdown,
  formatDistanceLd,
  formatDistanceAu,
  formatProbability,
  formatVelocity,
  formatMass,
  formatYield,
  formatDiameter,
  formatNervDate,
  getTierColorClass,
  getTierBorderClass,
} from "@/lib/utils/format";
import type { NervAsteroid, AsteroidListResponse, ThreatTier } from "@/types/asteroid.types";

// ── TIER VISUAL CONFIG ─────────────────────────────────────────────────────────────

const TIER_ACCENT: Record<ThreatTier, string> = {
  MINIMAL: "#006614",
  MONITOR: "#00CC33",
  ELEVATED: "#FFB000",
  PRIORITY_AMBER: "#FF6600",
  PRIORITY_RED: "#CC0000",
  PATTERN_BLUE: "#0044FF",
};

const TIER_LABEL: Record<ThreatTier, string> = {
  MINIMAL: "MINIMAL",
  MONITOR: "MONITOR",
  ELEVATED: "ELEVATED",
  PRIORITY_AMBER: "PRIORITY AMBER",
  PRIORITY_RED: "PRIORITY RED",
  PATTERN_BLUE: "PATTERN BLUE",
};

// ── WIREFRAME ORBIT CANVAS ─────────────────────────────────────────────────────────

function drawWireframeOrbit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  asteroid: NervAsteroid,
  animAngle: number
) {
  const cx = w * 0.5;
  const cy = h * 0.52;
  const scale = Math.min(w, h) * 0.38;
  const tilt = 0.38; // y-compression — simulates 3D orbital plane tilt

  ctx.clearRect(0, 0, w, h);

  // Deep void background
  ctx.fillStyle = "#020304";
  ctx.fillRect(0, 0, w, h);

  // Perspective grid
  ctx.strokeStyle = "rgba(15, 21, 32, 0.9)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Outer boundary
  ctx.strokeStyle = "rgba(0, 102, 20, 0.2)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, scale * 1.08, scale * 1.08 * tilt * 1.6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── VENUS ORBIT ────────────────────────────────────────────────────────────────
  const venusR = scale * 0.3;
  ctx.strokeStyle = "rgba(232, 144, 32, 0.12)";
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.ellipse(cx, cy, venusR, venusR * tilt, 0, 0, Math.PI * 2);
  ctx.stroke();

  const venusAngle = animAngle * 0.55;
  const vx = cx + venusR * Math.cos(venusAngle);
  const vy = cy + venusR * tilt * Math.sin(venusAngle);
  drawGlowDot(ctx, vx, vy, 2.5, "#E89020", 8);

  // ── EARTH ORBIT ────────────────────────────────────────────────────────────────
  const earthR = scale * 0.48;
  ctx.strokeStyle = "rgba(57, 255, 126, 0.2)";
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.ellipse(cx, cy, earthR, earthR * tilt, 0, 0, Math.PI * 2);
  ctx.stroke();

  const earthAngle = animAngle * 0.35;
  const ex = cx + earthR * Math.cos(earthAngle);
  const ey = cy + earthR * tilt * Math.sin(earthAngle);
  drawGlowDot(ctx, ex, ey, 4, "#39FF7E", 14);

  // Earth label
  ctx.font = "9px 'Share Tech Mono', monospace";
  ctx.fillStyle = "rgba(57, 255, 126, 0.4)";
  ctx.fillText("EARTH", ex + 7, ey - 3);

  // ── MARS ORBIT ─────────────────────────────────────────────────────────────────
  const marsR = scale * 0.7;
  ctx.strokeStyle = "rgba(204, 68, 0, 0.1)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, marsR, marsR * tilt, 0, 0, Math.PI * 2);
  ctx.stroke();

  const marsAngle = animAngle * 0.22;
  const mx = cx + marsR * Math.cos(marsAngle);
  const my = cy + marsR * tilt * Math.sin(marsAngle);
  drawGlowDot(ctx, mx, my, 2, "#CC4400", 6);

  // ── ASTEROID ORBIT ─────────────────────────────────────────────────────────────
  const tier = asteroid.threat.tier;
  const orbitColor = TIER_ACCENT[tier] || "#FF4444";

  if (asteroid.orbitalElements) {
    const { semiMajorAxis: a, eccentricity: e, inclination: inc } = asteroid.orbitalElements;

    // Scale semi-major axis to canvas (1 AU = earthR)
    const scaledA = (a / 1.0) * earthR;
    const scaledB = scaledA * Math.sqrt(Math.max(0, 1 - e * e));
    const focusOffset = scaledA * e;

    // Inclination modifies the visual tilt
    const incFactor = Math.cos((Math.abs(inc) * Math.PI) / 180);
    const orbitTilt = tilt * (0.5 + incFactor * 0.5);

    // Draw asteroid orbit ellipse
    ctx.strokeStyle = orbitColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = orbitColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(cx - focusOffset, cy, scaledA, scaledB * orbitTilt, -0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Perihelion marker
    const perX = cx - focusOffset - scaledA;
    const perY = cy;
    ctx.strokeStyle = `${orbitColor}60`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(perX, perY, 3, 0, Math.PI * 2);
    ctx.stroke();

    // ── ANIMATED ASTEROID POSITION ─────────────────────────────────────────────
    const astAngle = animAngle * 1.8;
    const rTrue = (scaledA * (1 - e * e)) / (1 + e * Math.cos(astAngle));
    const ax = cx - focusOffset + rTrue * Math.cos(astAngle);
    const ay = cy + rTrue * orbitTilt * Math.sin(astAngle);

    // Approach vector to Earth
    ctx.strokeStyle = `${orbitColor}50`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.setLineDash([]);

    // Asteroid glow
    drawGlowDot(ctx, ax, ay, 4, orbitColor, 16);

    // Targeting reticle around asteroid
    drawTargetingReticle(ctx, ax, ay, orbitColor, animAngle);

    // Distance annotation
    const midX = (ax + ex) / 2;
    const midY = (ay + ey) / 2;
    const distLd = asteroid.closestApproach?.distanceLd ?? 0;
    ctx.font = "8px 'Share Tech Mono', monospace";
    ctx.fillStyle = `${orbitColor}90`;
    ctx.fillText(`${distLd.toFixed(2)} LD`, midX + 4, midY - 2);
  } else {
    // Default circular orbit at ~1.3 AU if no orbital elements
    const defR = earthR * 1.3;
    ctx.strokeStyle = `${orbitColor}80`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = orbitColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, defR, defR * tilt, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const ax = cx + defR * Math.cos(animAngle * 1.5);
    const ay = cy + defR * tilt * Math.sin(animAngle * 1.5);
    drawGlowDot(ctx, ax, ay, 4, orbitColor, 16);
    drawTargetingReticle(ctx, ax, ay, orbitColor, animAngle);
  }

  // ── SUN ────────────────────────────────────────────────────────────────────────
  const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
  sunGlow.addColorStop(0, "rgba(255, 200, 100, 0.95)");
  sunGlow.addColorStop(0.4, "rgba(255, 102, 0, 0.5)");
  sunGlow.addColorStop(1, "rgba(255, 102, 0, 0)");
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FF8C1A";
  ctx.beginPath();
  ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // ── PANEL LABELS ───────────────────────────────────────────────────────────────
  ctx.font = "8px 'Share Tech Mono', monospace";
  ctx.fillStyle = "rgba(74, 85, 102, 0.6)";
  ctx.fillText("ORBITAL MECHANICS // ECLIPTIC PROJECTION // AU SCALE", 8, h - 8);
  ctx.fillStyle = "rgba(74, 85, 102, 0.4)";
  ctx.fillText("SOL", cx + 6, cy + 3);
}

function drawGlowDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  glowRadius: number
) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  glow.addColorStop(0, `${color}CC`);
  glow.addColorStop(1, `${color}00`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawTargetingReticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  angle: number
) {
  const s = 8;
  const gap = 3;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  ctx.beginPath();
  // Top-left
  ctx.moveTo(x - s - gap, y - s); ctx.lineTo(x - gap, y - s);
  ctx.moveTo(x - s - gap, y - s); ctx.lineTo(x - s - gap, y - gap);
  // Top-right
  ctx.moveTo(x + gap, y - s); ctx.lineTo(x + s + gap, y - s);
  ctx.moveTo(x + s + gap, y - s); ctx.lineTo(x + s + gap, y - gap);
  // Bottom-left
  ctx.moveTo(x - s - gap, y + s); ctx.lineTo(x - gap, y + s);
  ctx.moveTo(x - s - gap, y + s); ctx.lineTo(x - s - gap, y + gap);
  // Bottom-right
  ctx.moveTo(x + gap, y + s); ctx.lineTo(x + s + gap, y + s);
  ctx.moveTo(x + s + gap, y + s); ctx.lineTo(x + s + gap, y + gap);
  ctx.stroke();

  // Crosshair
  ctx.strokeStyle = `${color}50`;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(x - 18, y); ctx.lineTo(x + 18, y);
  ctx.moveTo(x, y - 18); ctx.lineTo(x, y + 18);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
}

// ── CANVAS COMPONENT ───────────────────────────────────────────────────────────────

function OrbitCanvas({ asteroid }: { asteroid: NervAsteroid }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      drawWireframeOrbit(ctx, w, h, asteroid, angleRef.current);
      angleRef.current += 0.004;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [asteroid]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "crisp-edges" }}
    />
  );
}

// ── DATA CELL COMPONENT ────────────────────────────────────────────────────────────

function DataCell({
  label,
  value,
  highlight = false,
  small = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-body text-[8px] text-classified-grey tracking-[0.12em] uppercase">
        {label}
      </span>
      <span
        className={cn(
          "terminal-text leading-none",
          small ? "text-[13px]" : "text-[15px]",
          highlight ? "text-nerv-orange text-glow-orange" : "text-phosphor-mid"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ── MAIN DOSSIER COMPONENT ─────────────────────────────────────────────────────────

export function AsteroidDossier() {
  const selectedId = useSelectedId();
  const clearSelection = useStore((s) => s.selectAsteroid);

  const { data } = useQuery<AsteroidListResponse>({
    queryKey: ["asteroids"],
    staleTime: 14 * 60 * 1000,
  });

  const asteroid = data?.data.find((a) => a.id === selectedId) ?? null;
  const tier = asteroid?.threat.tier ?? "MINIMAL";
  const accent = TIER_ACCENT[tier];

  const handleClose = useCallback(() => {
    soundEngine?.play("dossier_close");
    clearSelection(null);
  }, [clearSelection]);

  // Play open sound when asteroid changes to a new selection
  useEffect(() => {
    if (asteroid) soundEngine?.play("dossier_open");
  }, [asteroid?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  return (
    <AnimatePresence>
      {asteroid && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-void-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />

          {/* Dossier Panel */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col dossier-panel"
            style={{
              width: "min(64vw, 900px)",
              borderLeft: `1px solid ${accent}50`,
              boxShadow: `-24px 0 80px rgba(0,0,0,0.9), -1px 0 0 ${accent}30`,
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* ── HEADER BAR ──────────────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0 border-b"
              style={{
                backgroundColor: `${accent}12`,
                borderColor: `${accent}30`,
                borderBottom: `1px solid ${accent}25`,
              }}
            >
              <div className="flex items-center gap-4">
                {/* Tier badge */}
                <div
                  className="flex items-center gap-2 px-2 py-1 border"
                  style={{ borderColor: `${accent}60`, backgroundColor: `${accent}15` }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-neon-pulse"
                    style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
                  />
                  <span
                    className="font-display text-[9px] tracking-[0.2em]"
                    style={{ color: accent }}
                  >
                    {TIER_LABEL[tier]}
                  </span>
                </div>

                <div>
                  <div className="font-display text-amber-bright text-[14px] tracking-[0.08em] leading-none">
                    {asteroid.designation}
                  </div>
                  <div className="font-body text-[9px] text-classified-grey tracking-[0.12em] mt-0.5">
                    NERV CODENAME: {asteroid.nervCodename} // NEO REF: {asteroid.neoReferenceId}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="classification-stamp text-classified-grey/50 text-[8px]">
                  {asteroid.classificationLevel}
                </span>
                <button
                  onClick={handleClose}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center",
                    "border border-classified-grey/30 text-classified-grey",
                    "hover:border-nerv-orange/60 hover:text-nerv-orange",
                    "font-display text-[13px] tracking-widest",
                    "transition-colors duration-150"
                  )}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── ORBIT CANVAS ────────────────────────────────────────────────── */}
            <div
              className="relative shrink-0 border-b overflow-hidden"
              style={{ height: "38%", borderColor: `${accent}20` }}
            >
              <OrbitCanvas asteroid={asteroid} />

              {/* Holographic shimmer overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.008) 2px, rgba(0, 255, 65, 0.008) 4px)",
                }}
              />

              {/* Corner labels */}
              <div className="absolute top-2 left-3">
                <span className="font-display text-[9px] text-classified-grey tracking-[0.2em]">
                  ORBITAL MECHANICS // INNER SOLAR SYSTEM
                </span>
              </div>

              <div className="absolute top-2 right-3 flex gap-3">
                {[
                  { color: "#39FF7E", label: "EARTH" },
                  { color: accent, label: asteroid.nervCodename },
                  { color: "#FF8C1A", label: "SOL" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-body text-[8px] text-classified-grey">{label}</span>
                  </div>
                ))}
              </div>

              {/* Impact probability overlay */}
              <div className="absolute bottom-2 right-3">
                <span className="font-body text-[8px] text-classified-grey">P(IMPACT)</span>
                <div
                  className="terminal-text text-[18px] leading-none"
                  style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
                >
                  {formatProbability(asteroid.threat.impactProbability)}
                </div>
              </div>
            </div>

            {/* ── DATA PANELS ─────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-3 divide-x" style={{ borderColor: `${accent}15` }}>

                {/* ── THREAT ASSESSMENT ───────────────────────────────────────── */}
                <div className="p-4 space-y-3 border-b" style={{ borderColor: `${accent}15` }}>
                  <div
                    className="font-display text-[9px] tracking-[0.2em] pb-1.5 border-b"
                    style={{ color: accent, borderColor: `${accent}25` }}
                  >
                    THREAT ASSESSMENT
                  </div>

                  <DataCell
                    label="IMPACT PROBABILITY"
                    value={formatProbability(asteroid.threat.impactProbability)}
                    highlight
                  />
                  <DataCell
                    label="TORINO SCALE"
                    value={`LEVEL ${asteroid.threat.torinoScale}`}
                    highlight={asteroid.threat.torinoScale > 0}
                  />
                  <DataCell
                    label="KINETIC YIELD"
                    value={formatYield(asteroid.threat.kineticYieldMt)}
                    highlight={asteroid.threat.kineticYieldMt > 50}
                  />
                  <DataCell
                    label="YIELD CLASS"
                    value={asteroid.threat.yieldClassification}
                  />
                  <DataCell
                    label="THREAT SCORE"
                    value={`${asteroid.threat.score.toFixed(1)} / 100`}
                  />

                  <div className="pt-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: asteroid.threat.isPotentiallyHazardous ? "#CC0000" : "#006614",
                          boxShadow: asteroid.threat.isPotentiallyHazardous ? "0 0 6px #CC0000" : "none",
                        }}
                      />
                      <span className="font-body text-[8px] text-classified-grey">
                        {asteroid.threat.isPotentiallyHazardous ? "POTENTIALLY HAZARDOUS" : "NON-HAZARDOUS"}
                      </span>
                    </div>
                    {asteroid.threat.isSentryObject && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-bloodwarn animate-critical-blink" />
                        <span className="font-body text-[8px] text-bloodwarn-text">
                          SENTRY OBJECT — ACTIVE MONITORING
                        </span>
                      </div>
                    )}
                  </div>

                  {asteroid.atFieldProbability > 0 && (
                    <div
                      className="mt-2 p-2 border"
                      style={{ borderColor: "#0044FF50", backgroundColor: "#0044FF08" }}
                    >
                      <span className="font-body text-[8px] text-pattern-blue-bright tracking-[0.1em]">
                        A.T. FIELD DETECTED: {(asteroid.atFieldProbability * 100).toFixed(3)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* ── PHYSICAL PARAMETERS ─────────────────────────────────────── */}
                <div className="p-4 space-y-3 border-b" style={{ borderColor: `${accent}15` }}>
                  <div
                    className="font-display text-[9px] tracking-[0.2em] pb-1.5 border-b"
                    style={{ color: accent, borderColor: `${accent}25` }}
                  >
                    PHYSICAL PARAMETERS
                  </div>

                  <DataCell
                    label="DIAMETER (EST.)"
                    value={formatDiameter(
                      asteroid.physical.diameter.min,
                      asteroid.physical.diameter.max,
                      asteroid.physical.diameter.unit
                    )}
                    highlight
                  />
                  <DataCell
                    label="ESTIMATED MASS"
                    value={formatMass(asteroid.physical.estimatedMassKg)}
                  />
                  <DataCell
                    label="ABSOLUTE MAGNITUDE"
                    value={`H = ${asteroid.physical.absoluteMagnitude.toFixed(1)}`}
                  />
                  <DataCell
                    label="ORBITAL CLASS"
                    value={asteroid.physical.orbitalClass}
                  />

                  {asteroid.orbitalElements && (
                    <>
                      <div
                        className="font-display text-[8px] tracking-[0.15em] pt-1 border-t"
                        style={{ color: accent, borderColor: `${accent}20` }}
                      >
                        KEPLERIAN ELEMENTS
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <DataCell
                          label="SEMI-MAJOR AXIS"
                          value={`${asteroid.orbitalElements.semiMajorAxis.toFixed(3)} AU`}
                          small
                        />
                        <DataCell
                          label="ECCENTRICITY"
                          value={asteroid.orbitalElements.eccentricity.toFixed(4)}
                          small
                        />
                        <DataCell
                          label="INCLINATION"
                          value={`${asteroid.orbitalElements.inclination.toFixed(2)}°`}
                          small
                        />
                        <DataCell
                          label="ORBITAL PERIOD"
                          value={`${asteroid.orbitalElements.orbitalPeriod.toFixed(1)}d`}
                          small
                        />
                        <DataCell
                          label="PERIHELION DIST"
                          value={`${asteroid.orbitalElements.perihelionDist.toFixed(3)} AU`}
                          small
                        />
                        <DataCell
                          label="APHELION DIST"
                          value={`${asteroid.orbitalElements.aphelionDist.toFixed(3)} AU`}
                          small
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* ── CLOSEST APPROACH ────────────────────────────────────────── */}
                <div className="p-4 space-y-3 border-b" style={{ borderColor: `${accent}15` }}>
                  <div
                    className="font-display text-[9px] tracking-[0.2em] pb-1.5 border-b"
                    style={{ color: accent, borderColor: `${accent}25` }}
                  >
                    CLOSEST APPROACH VECTOR
                  </div>

                  {asteroid.closestApproach ? (
                    <>
                      <DataCell
                        label="APPROACH DATE"
                        value={formatNervDate(asteroid.closestApproach.date)}
                        highlight
                      />
                      <DataCell
                        label="T-MINUS"
                        value={formatCountdown(asteroid.closestApproach.epochMs)}
                        highlight={asteroid.threat.tier === "PRIORITY_RED" || asteroid.threat.tier === "PATTERN_BLUE"}
                      />
                      <DataCell
                        label="MISS DISTANCE"
                        value={formatDistanceLd(asteroid.closestApproach.distanceLd)}
                      />
                      <DataCell
                        label="MISS DIST (AU)"
                        value={formatDistanceAu(asteroid.closestApproach.distanceAu)}
                        small
                      />
                      <DataCell
                        label="APPROACH VELOCITY"
                        value={formatVelocity(asteroid.closestApproach.velocityKmS)}
                        highlight
                      />
                      <DataCell
                        label="VELOCITY (km/h)"
                        value={`${asteroid.closestApproach.velocityKmH.toFixed(0)} km/h`}
                        small
                      />
                      <DataCell
                        label="ORBITING BODY"
                        value={asteroid.closestApproach.orbitingBody}
                      />

                      {/* 7-day delta */}
                      {asteroid.threat.probabilityDelta7d !== undefined && (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-body text-[8px] text-classified-grey tracking-[0.12em]">
                            7-DAY P(IMPACT) TREND
                          </span>
                          <span
                            className={cn(
                              "terminal-text text-[13px]",
                              asteroid.threat.probabilityDelta7d > 0
                                ? "text-data-negative"
                                : "text-data-positive"
                            )}
                          >
                            {asteroid.threat.probabilityDelta7d > 0 ? "▲" : "▼"}{" "}
                            {Math.abs(asteroid.threat.probabilityDelta7d).toFixed(4)}%
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="terminal-text text-[11px] text-classified-grey">
                      NO APPROACH DATA AVAILABLE
                    </span>
                  )}
                </div>
              </div>

              {/* ── MAGI MINI ASSESSMENT ──────────────────────────────────────── */}
              <div
                className="p-4 border-t"
                style={{ borderColor: `${accent}15` }}
              >
                <div
                  className="font-display text-[9px] tracking-[0.2em] mb-3"
                  style={{ color: accent }}
                >
                  MAGI SUPERCOMPUTER ASSESSMENT
                </div>

                <div className="flex gap-6 items-center">
                  {[
                    { id: "MAGI-01", name: "CASPER", arch: "SCIENTIST", offset: 1.02 },
                    { id: "MAGI-02", name: "BALTHASAR", arch: "MOTHER", offset: 0.97 },
                    { id: "MAGI-03", name: "MELCHIOR", arch: "WOMAN", offset: 1.05 },
                  ].map(({ id, name, arch, offset }) => {
                    const prob = Math.min(0.999, asteroid.threat.impactProbability * offset);
                    return (
                      <div key={id} className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#00CC33", boxShadow: "0 0 8px rgba(0,204,51,0.6)" }}
                        >
                          <span className="font-display text-[7px] text-void-black">✓</span>
                        </div>
                        <div>
                          <div className="font-display text-[9px] text-phosphor tracking-[0.1em]">
                            {name}
                          </div>
                          <div className="font-body text-[7px] text-classified-grey">
                            [{arch}] {(prob * 100).toFixed(4)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="ml-auto">
                    <div className="font-body text-[8px] text-classified-grey">CONSENSUS</div>
                    <div className="terminal-text text-[14px] text-phosphor text-glow-phosphor">
                      APPROVED [3/3]
                    </div>
                  </div>
                </div>
              </div>

              {/* ── FOOTER STAMP ──────────────────────────────────────────────── */}
              <div
                className="px-4 py-3 border-t flex justify-between items-center"
                style={{ borderColor: `${accent}15` }}
              >
                <span className="font-body text-[8px] text-classified-grey/50 tracking-[0.08em]">
                  LAST UPDATED: {new Date(asteroid.lastUpdated).toUTCString()}
                </span>
                <span className="classification-stamp text-classified-grey/30 text-[7px]">
                  TOP SECRET // NERV SPECIAL AGENCY // LONGINUS WATCH
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
