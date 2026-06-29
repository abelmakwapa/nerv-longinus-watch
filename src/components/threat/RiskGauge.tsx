// filepath: src/components/threat/RiskGauge.tsx
/**
 * NERV Risk Assessment Gauge
 *
 * Analog-style circular gauge displaying impact probability.
 * Built with SVG arcs for crisp rendering at all sizes.
 * The needle uses CSS transforms for smooth animation.
 *
 * Design intent: Should feel like a physical instrument —
 * the needle has weight and settles with slight overshoot.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { ThreatTier } from "@/types/asteroid.types";

interface RiskGaugeProps {
  /** Value to display (0.0 – 1.0 for probability gauges) */
  value: number;
  /** Maximum value for the gauge scale */
  maxValue?: number;
  /** Gauge label */
  label: string;
  /** Sub-label / unit */
  unit?: string;
  /** Display value override (e.g. formatted string) */
  displayValue?: string;
  /** Where the danger zone begins (0.0 – 1.0 fraction of max) */
  dangerThreshold?: number;
  /** Current threat tier for color mapping */
  tier?: ThreatTier;
  /** Size in pixels */
  size?: number;
  className?: string;
}

// Maps threat tier to gauge needle color
const TIER_NEEDLE_COLOR: Record<ThreatTier, string> = {
  MINIMAL: "#006614",
  MONITOR: "#00CC33",
  ELEVATED: "#FFCC33",
  PRIORITY_AMBER: "#FF6600",
  PRIORITY_RED: "#FF4444",
  PATTERN_BLUE: "#FF1111",
};

// Gauge arc parameters
const GAUGE_START_DEG = -225; // 225° sweep total (common for analog gauges)
const GAUGE_END_DEG = 45;
const GAUGE_SWEEP_DEG = GAUGE_END_DEG - GAUGE_START_DEG; // 270°

/**
 * Converts degrees to SVG arc endpoint coordinates.
 * Center is at (cx, cy) with given radius.
 */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

/**
 * Generates an SVG arc path string.
 */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function RiskGauge({
  value,
  maxValue = 1,
  label,
  unit,
  displayValue,
  dangerThreshold = 0.7,
  tier = "MINIMAL",
  size = 180,
  className,
}: RiskGaugeProps) {
  // Clamp value to [0, maxValue]
  const clampedValue = Math.max(0, Math.min(maxValue, value));
  const normalizedValue = clampedValue / maxValue; // 0.0 – 1.0

  // Needle rotation: maps 0→GAUGE_START_DEG and 1→GAUGE_END_DEG
  const targetRotation = GAUGE_START_DEG + normalizedValue * GAUGE_SWEEP_DEG;

  // Animated needle position with spring physics
  const [currentRotation, setCurrentRotation] = useState(GAUGE_START_DEG);
  const animFrameRef = useRef<number>(0);
  const currentRotationRef = useRef(GAUGE_START_DEG);
  const velocityRef = useRef(0);

  useEffect(() => {
    const SPRING = 0.08; // Spring stiffness
    const DAMPING = 0.75; // Damping ratio

    const animate = () => {
      const current = currentRotationRef.current;
      const delta = targetRotation - current;

      // Spring physics: acceleration toward target
      velocityRef.current = velocityRef.current * DAMPING + delta * SPRING;
      currentRotationRef.current += velocityRef.current;

      setCurrentRotation(currentRotationRef.current);

      // Continue animation if not settled (threshold: 0.01°)
      if (Math.abs(delta) > 0.01 || Math.abs(velocityRef.current) > 0.001) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [targetRotation]);

  // SVG geometry
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.36;
  const trackR = size * 0.40;
  const tickOuterR = size * 0.43;
  const tickInnerR = size * 0.38;
  const minorTickInnerR = size * 0.40;

  // Danger zone arc start
  const dangerStartDeg = GAUGE_START_DEG + dangerThreshold * GAUGE_SWEEP_DEG;

  // Active fill arc
  const fillEndDeg = GAUGE_START_DEG + normalizedValue * GAUGE_SWEEP_DEG;

  // Needle line endpoints
  const needleLength = size * 0.35;
  const needleTailLength = size * 0.08;
  const needleEndX =
    cx + needleLength * Math.cos(((currentRotation - 90) * Math.PI) / 180);
  const needleEndY =
    cy + needleLength * Math.sin(((currentRotation - 90) * Math.PI) / 180);
  const needleTailX =
    cx - needleTailLength * Math.cos(((currentRotation - 90) * Math.PI) / 180);
  const needleTailY =
    cy - needleTailLength * Math.sin(((currentRotation - 90) * Math.PI) / 180);

  // Major tick marks (6 ticks = 0%, 20%, 40%, 60%, 80%, 100%)
  const majorTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const minorTicks = [0.1, 0.3, 0.5, 0.7, 0.9];

  const needleColor = TIER_NEEDLE_COLOR[tier];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1",
        className
      )}
    >
      {/* SVG Gauge Face */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          {/* Outer bezel ring */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke="#1A2535"
            strokeWidth="2"
          />

          {/* Track background arc (full sweep) */}
          <path
            d={arcPath(cx, cy, trackR, GAUGE_START_DEG, GAUGE_END_DEG)}
            fill="none"
            stroke="#0F1520"
            strokeWidth={size * 0.08}
            strokeLinecap="butt"
          />

          {/* Danger zone arc (red tint background) */}
          <path
            d={arcPath(cx, cy, trackR, dangerStartDeg, GAUGE_END_DEG)}
            fill="none"
            stroke="rgba(204, 0, 0, 0.15)"
            strokeWidth={size * 0.08}
            strokeLinecap="butt"
          />

          {/* Active fill arc */}
          {normalizedValue > 0 && (
            <path
              d={arcPath(cx, cy, trackR, GAUGE_START_DEG, fillEndDeg)}
              fill="none"
              stroke={needleColor}
              strokeWidth={size * 0.05}
              strokeLinecap="butt"
              opacity="0.8"
            />
          )}

          {/* Major tick marks */}
          {majorTicks.map((t) => {
            const tickDeg = GAUGE_START_DEG + t * GAUGE_SWEEP_DEG;
            const outer = polarToCartesian(cx, cy, tickOuterR, tickDeg);
            const inner = polarToCartesian(cx, cy, tickInnerR, tickDeg);
            const isDanger = t >= dangerThreshold;
            return (
              <line
                key={t}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke={isDanger ? "#CC0000" : "#FFB000"}
                strokeWidth="1.5"
                opacity={isDanger ? "0.8" : "0.6"}
              />
            );
          })}

          {/* Minor tick marks */}
          {minorTicks.map((t) => {
            const tickDeg = GAUGE_START_DEG + t * GAUGE_SWEEP_DEG;
            const outer = polarToCartesian(cx, cy, tickOuterR, tickDeg);
            const inner = polarToCartesian(cx, cy, minorTickInnerR, tickDeg);
            return (
              <line
                key={t}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="#997700"
                strokeWidth="1"
                opacity="0.4"
              />
            );
          })}

          {/* Danger zone marker label */}
          {(() => {
            const dangerLabelPos = polarToCartesian(
              cx,
              cy,
              outerR * 0.72,
              dangerStartDeg + (GAUGE_END_DEG - dangerStartDeg) / 2
            );
            return (
              <text
                x={dangerLabelPos.x}
                y={dangerLabelPos.y}
                fill="#990000"
                fontSize={size * 0.055}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Share Tech Mono, monospace"
                opacity="0.7"
              >
                ⚠
              </text>
            );
          })()}

          {/* Needle — rendered as a line with glow */}
          {/* Glow layer (wider, blurred) */}
          <line
            x1={needleTailX}
            y1={needleTailY}
            x2={needleEndX}
            y2={needleEndY}
            stroke={needleColor}
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.25"
            style={{ filter: `blur(3px)` }}
          />
          {/* Needle line */}
          <line
            x1={needleTailX}
            y1={needleTailY}
            x2={needleEndX}
            y2={needleEndY}
            stroke={needleColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Needle tip triangle */}
          <polygon
            points={`${needleEndX - 2},${needleEndY} ${needleEndX + 2},${needleEndY} ${needleEndX},${needleEndY - 4}`}
            fill={needleColor}
            transform={`rotate(${currentRotation}, ${needleEndX}, ${needleEndY})`}
          />

          {/* Center pin */}
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.04}
            fill="#FFB000"
          />
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.025}
            fill="#060A0F"
          />

          {/* Inner dark face */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="#020304"
            opacity="0.8"
          />

          {/* Display value text in center */}
          <text
            x={cx}
            y={cy + size * 0.06}
            fill="#FFCC33"
            fontSize={size * 0.13}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="VT323, monospace"
          >
            {displayValue ?? clampedValue.toFixed(2)}
          </text>

          {/* Outer ring highlight */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke={needleColor}
            strokeWidth="1"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Digital sub-readout */}
      <div
        className={cn(
          "px-3 py-1 border border-ui-border text-center w-full",
          "bg-deep-station"
        )}
      >
        <div className="terminal-text text-amber-bright text-[14px] leading-none">
          {displayValue ?? clampedValue.toFixed(4)}
        </div>
        {unit && (
          <div className="font-body text-[8px] text-classified-grey tracking-[0.1em] mt-0.5">
            {unit}
          </div>
        )}
      </div>

      {/* Label */}
      <span className="font-display text-[10px] text-classified-grey tracking-[0.15em] text-center">
        {label}
      </span>
    </div>
  );
}
