// filepath: src/components/solar-system/SceneHud.tsx
"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { useAlertTier } from "@/store";
import { TIER_HEX } from "@/lib/three/nerv-colors";
import { formatThreatTier } from "@/lib/utils/format";

/**
 * DOM HUD framing the 3D projection — corner brackets, center crosshair,
 * scanning coordinate readout, and scale legend. Anime.js drives the
 * bracket draw-in and the live coordinate scan. Pointer-events disabled so
 * the 3D scene underneath stays fully interactive.
 */
export function SceneHud({ objectCount }: { objectCount: number }) {
  const tier = useAlertTier();
  const accent = TIER_HEX[tier];
  const cornersRef = useRef<HTMLDivElement>(null);
  const raRef = useRef<HTMLSpanElement>(null);
  const decRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (cornersRef.current) {
      anime({
        targets: cornersRef.current.querySelectorAll(".hud-corner"),
        opacity: [0, 1],
        scale: [0.6, 1],
        delay: anime.stagger(120, { start: 300 }),
        duration: 700,
        easing: "easeOutQuad",
      });
    }

    // Looping coordinate scan — purely atmospheric telemetry.
    const scan = { ra: 0, dec: -42 };
    const anim = anime({
      targets: scan,
      ra: 359.9,
      dec: 41.7,
      duration: 9000,
      easing: "linear",
      loop: true,
      direction: "alternate",
      update: () => {
        if (raRef.current) raRef.current.textContent = scan.ra.toFixed(1).padStart(5, "0");
        if (decRef.current) decRef.current.textContent = (scan.dec >= 0 ? "+" : "") + scan.dec.toFixed(1);
      },
    });
    return () => anim.pause();
  }, []);

  return (
    <div ref={cornersRef} className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* Corner brackets */}
      <Corner className="top-3 left-3" sides="tl" color={accent} />
      <Corner className="top-3 right-3" sides="tr" color={accent} />
      <Corner className="bottom-3 left-3" sides="bl" color={accent} />
      <Corner className="bottom-3 right-3" sides="br" color={accent} />

      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25">
        <div className="absolute h-px w-8 -translate-x-1/2 -translate-y-1/2" style={{ background: accent }} />
        <div className="absolute w-px h-8 -translate-x-1/2 -translate-y-1/2" style={{ background: accent }} />
        <div className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ borderColor: `${accent}80` }} />
      </div>

      {/* Top-left projection readout */}
      <div className="absolute top-6 left-8 space-y-0.5">
        <div className="font-display text-[9px] tracking-[0.3em]" style={{ color: accent }}>
          LIVE HELIOCENTRIC PROJECTION
        </div>
        <div className="font-body text-[8px] tracking-[0.15em] text-[#5a6678]">
          MAGI ORBITAL SOLVER // KEPLERIAN
        </div>
        <div className="terminal-text text-[9px] text-[#7d8a9c] pt-1">
          RA <span ref={raRef} className="text-[#9fb4c8]">000.0</span>°
          {"  "}DEC <span ref={decRef} className="text-[#9fb4c8]">-42.0</span>°
        </div>
      </div>

      {/* Bottom-left scale + alert tier */}
      <div className="absolute bottom-6 left-8 space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-px w-10" style={{ background: `${accent}aa` }} />
          <span className="font-body text-[8px] tracking-[0.15em] text-[#7d8a9c]">1 AU</span>
        </div>
        <div className="font-display text-[9px] tracking-[0.2em]" style={{ color: accent }}>
          THREAT POSTURE: {formatThreatTier(tier)}
        </div>
      </div>

      {/* Bottom-right object count */}
      <div className="absolute bottom-6 right-8 text-right space-y-0.5">
        <div className="terminal-text text-[10px] text-[#9fb4c8]">
          {objectCount} NEO{objectCount === 1 ? "" : "s"} TRACKED
        </div>
        <div className="font-body text-[8px] tracking-[0.15em] text-[#5a6678]">
          DRAG TO ORBIT · SCROLL TO ZOOM · CLICK TO LOCK
        </div>
      </div>
    </div>
  );
}

function Corner({ className, sides, color }: { className: string; sides: "tl" | "tr" | "bl" | "br"; color: string }) {
  const borders = {
    tl: "border-t border-l",
    tr: "border-t border-r",
    bl: "border-b border-l",
    br: "border-b border-r",
  }[sides];
  return <div className={`hud-corner absolute h-6 w-6 opacity-0 ${borders} ${className}`} style={{ borderColor: color }} />;
}
