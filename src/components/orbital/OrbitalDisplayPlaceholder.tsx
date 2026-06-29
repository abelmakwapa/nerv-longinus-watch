// filepath: src/components/orbital/OrbitalDisplayPlaceholder.tsx
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useAlertTier, usePriorityObject } from "@/store";
import type { ThreatTier } from "@/types/asteroid.types";

const TIER_ORBIT_COLOR: Record<ThreatTier, string> = {
  MINIMAL: "#006614",
  MONITOR: "#00CC33",
  ELEVATED: "#FFB000",
  PRIORITY_AMBER: "#FF6600",
  PRIORITY_RED: "#CC0000",
  PATTERN_BLUE: "#0044FF",
};

export function OrbitalDisplayPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const priorityObject = usePriorityObject();
  const alertTier = useAlertTier();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let sweepAngle = 0;
    let objectAngle = 0;
    let pingRadius = 0;
    let pingOpacity = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const orbitColor = TIER_ORBIT_COLOR[alertTier] || "#CC0000";

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.40;

      ctx.clearRect(0, 0, w, h);

      // ── BACKGROUND ─────────────────────────────────────────────────────────────
      ctx.fillStyle = "#020304";
      ctx.fillRect(0, 0, w, h);

      // Subtle radial nebula background
      const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.4);
      nebula.addColorStop(0, "rgba(6, 10, 15, 0.8)");
      nebula.addColorStop(0.5, "rgba(4, 6, 10, 0.9)");
      nebula.addColorStop(1, "rgba(2, 3, 4, 0.98)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      // ── GRID ──────────────────────────────────────────────────────────────────
      ctx.strokeStyle = "rgba(15, 21, 32, 0.85)";
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = cx % gridSize; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = cy % gridSize; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // ── RANGE RINGS ───────────────────────────────────────────────────────────
      [0.45, 0.75, 1.05].forEach((factor, i) => {
        const r = scale * factor;
        ctx.strokeStyle = `rgba(0, 102, 20, ${0.15 - i * 0.04})`;
        ctx.lineWidth = 0.75;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Range label
        ctx.font = "8px 'Share Tech Mono', monospace";
        ctx.fillStyle = "rgba(74, 85, 102, 0.35)";
        ctx.fillText(`${(factor * 2.5).toFixed(1)} AU`, cx + r + 4, cy - 3);
      });

      // ── RADAR SWEEP ────────────────────────────────────────────────────────────
      const sweepRadius = scale * 1.0;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweepAngle);

      // Sweep trail (3 segments of decreasing opacity)
      for (let i = 0; i < 3; i++) {
        const alpha = (0.08 - i * 0.025);
        const angleSpan = Math.PI / 8;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sweepRadius);
        gradient.addColorStop(0, `rgba(0, 255, 65, 0)`);
        gradient.addColorStop(0.3, `rgba(0, 255, 65, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 255, 65, ${alpha * 0.3})`);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, sweepRadius, -(angleSpan * (i + 1)), -(angleSpan * i));
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Sweep line
      ctx.strokeStyle = "rgba(0, 255, 65, 0.4)";
      ctx.lineWidth = 1;
      ctx.shadowColor = "#00FF41";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sweepRadius, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── PLANETS ───────────────────────────────────────────────────────────────
      const planets = [
        { r: scale * 0.22, color: "#E89020", label: "VENUS", size: 2.5, speed: 0.7 },
        { r: scale * 0.35, color: "#39FF7E", label: "EARTH", size: 4.5, speed: 0.5 },
        { r: scale * 0.55, color: "#CC4400", label: "MARS", size: 2.5, speed: 0.35 },
      ];

      planets.forEach(({ r, color, label, size, speed }, idx) => {
        // Orbit ring
        ctx.strokeStyle = `${color}18`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Planet position
        const baseAngle = idx * 2.1;
        const pAngle = objectAngle * speed + baseAngle;
        const px = cx + r * Math.cos(pAngle);
        const py = cy + r * Math.sin(pAngle);

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, size * 3.5);
        glow.addColorStop(0, `${color}AA`);
        glow.addColorStop(1, `${color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Planet dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (label === "EARTH") {
          ctx.font = "8px 'Share Tech Mono', monospace";
          ctx.fillStyle = `${color}60`;
          ctx.fillText(label, px + 7, py - 3);
        }
      });

      // ── ASTEROID ORBIT ─────────────────────────────────────────────────────────
      if (priorityObject?.orbitalElements) {
        const { semiMajorAxis: a, eccentricity: e } = priorityObject.orbitalElements;
        const earthR = scale * 0.35;
        const scaledA = (a / 1.0) * earthR;
        const scaledB = scaledA * Math.sqrt(Math.max(0, 1 - e * e));
        const focusOffset = scaledA * e;

        // Orbit path
        ctx.strokeStyle = orbitColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = orbitColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(cx - focusOffset, cy, scaledA, scaledB, -0.25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Asteroid position
        const astAngle = objectAngle * 1.4;
        const r = (scaledA * (1 - e * e)) / (1 + e * Math.cos(astAngle));
        const ax = cx - focusOffset + r * Math.cos(astAngle);
        const ay = cy + r * Math.sin(astAngle);

        // Earth position (for approach vector)
        const earthAngle = objectAngle * 0.5 + 2.1;
        const ex = cx + scale * 0.35 * Math.cos(earthAngle);
        const ey = cy + scale * 0.35 * Math.sin(earthAngle);

        // Approach vector
        ctx.strokeStyle = `${orbitColor}55`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);

        // Asteroid glow
        const astGlow = ctx.createRadialGradient(ax, ay, 0, ax, ay, 14);
        astGlow.addColorStop(0, `${orbitColor}CC`);
        astGlow.addColorStop(1, `${orbitColor}00`);
        ctx.fillStyle = astGlow;
        ctx.beginPath();
        ctx.arc(ax, ay, 14, 0, Math.PI * 2);
        ctx.fill();

        // Asteroid dot
        ctx.fillStyle = orbitColor;
        ctx.shadowColor = orbitColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ax, ay, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Targeting reticle
        const rs = 9;
        ctx.strokeStyle = orbitColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = orbitColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(ax - rs - 4, ay - rs); ctx.lineTo(ax - 4, ay - rs);
        ctx.moveTo(ax - rs - 4, ay - rs); ctx.lineTo(ax - rs - 4, ay - 4);
        ctx.moveTo(ax + 4, ay - rs); ctx.lineTo(ax + rs + 4, ay - rs);
        ctx.moveTo(ax + rs + 4, ay - rs); ctx.lineTo(ax + rs + 4, ay - 4);
        ctx.moveTo(ax - rs - 4, ay + rs); ctx.lineTo(ax - 4, ay + rs);
        ctx.moveTo(ax - rs - 4, ay + rs); ctx.lineTo(ax - rs - 4, ay + 4);
        ctx.moveTo(ax + 4, ay + rs); ctx.lineTo(ax + rs + 4, ay + rs);
        ctx.moveTo(ax + rs + 4, ay + rs); ctx.lineTo(ax + rs + 4, ay + 4);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Crosshair lines
        ctx.strokeStyle = `${orbitColor}30`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.moveTo(ax - 22, ay); ctx.lineTo(ax + 22, ay);
        ctx.moveTo(ax, ay - 22); ctx.lineTo(ax, ay + 22);
        ctx.stroke();
        ctx.setLineDash([]);

        // ── IMPACT PING ANIMATION ───────────────────────────────────────────────
        if (alertTier === "PRIORITY_RED" || alertTier === "PATTERN_BLUE") {
          pingOpacity = Math.max(0, 1 - pingRadius / (scale * 0.6));
          ctx.strokeStyle = `${orbitColor}${Math.floor(pingOpacity * 255).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ax, ay, pingRadius + 14, 0, Math.PI * 2);
          ctx.stroke();
          pingRadius += 1.2;
          if (pingRadius > scale * 0.6) pingRadius = 0;
        }
      }

      // ── SUN ────────────────────────────────────────────────────────────────────
      const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      sunGlow.addColorStop(0, "rgba(255, 220, 120, 1)");
      sunGlow.addColorStop(0.3, "rgba(255, 140, 26, 0.7)");
      sunGlow.addColorStop(0.7, "rgba(255, 80, 0, 0.3)");
      sunGlow.addColorStop(1, "rgba(255, 60, 0, 0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFCC66";
      ctx.shadowColor = "#FF8C1A";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Solar corona ring
      ctx.strokeStyle = "rgba(255, 140, 26, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();

      // ── PANEL LABELS ───────────────────────────────────────────────────────────
      ctx.font = "8px 'Share Tech Mono', monospace";
      ctx.fillStyle = "rgba(74, 85, 102, 0.5)";
      ctx.fillText("ORBITAL MECHANICS PROJECTION // INNER SOLAR SYSTEM", 8, h - 8);
      ctx.fillStyle = "rgba(74, 85, 102, 0.3)";
      ctx.fillText("SOL", cx + 7, cy + 4);

      if (priorityObject) {
        ctx.fillStyle = `${orbitColor}AA`;
        ctx.fillText(priorityObject.designation, 8, 20);
        ctx.fillStyle = `${orbitColor}60`;
        ctx.fillText(`P(IMPACT): ${(priorityObject.threat.impactProbability * 100).toFixed(4)}%`, 8, 32);
      }

      sweepAngle += 0.008;
      objectAngle += 0.003;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [priorityObject, alertTier]);

  return (
    <div className="relative w-full h-full bg-void-black overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Holographic scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57, 255, 126, 0.007) 2px, rgba(57, 255, 126, 0.007) 4px)",
        }}
      />

      {/* Corner bracket decoration */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
        <div>
          <span className="font-display text-[9px] text-classified-grey tracking-[0.2em]">
            ANGEL APPROACH VECTOR // HELIOCENTRIC VIEW
          </span>
        </div>

        {/* Legend */}
        {priorityObject && (
          <div className="flex items-center gap-3">
            <LegendItem color="#39FF7E" label="EARTH" />
            <LegendItem
              color={TIER_ORBIT_COLOR[priorityObject.threat.tier]}
              label={priorityObject.nervCodename}
            />
          </div>
        )}
      </div>

      {/* Bottom data strip */}
      {priorityObject && (
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 pb-2 pointer-events-none">
          <div className="flex gap-4">
            <div>
              <div className="font-body text-[8px] text-classified-grey">PRIORITY OBJECT</div>
              <div className="font-display text-[12px] text-amber-bright tracking-[0.05em]">
                {priorityObject.designation}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-body text-[8px] text-classified-grey">P(IMPACT)</div>
            <div
              className={cn(
                "terminal-text text-[16px] leading-none",
                priorityObject.threat.tier === "PATTERN_BLUE"
                  ? "text-pattern-blue-bright"
                  : "text-bloodwarn-text text-glow-red"
              )}
            >
              {(priorityObject.threat.impactProbability * 100).toFixed(4)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-body text-[8px] text-classified-grey">{label}</span>
    </div>
  );
}
