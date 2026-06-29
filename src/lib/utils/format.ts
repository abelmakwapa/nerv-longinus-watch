// filepath: src/lib/utils/format.ts
/**
 * NERV LONGINUS WATCH — Data Formatting Utilities
 *
 * All display formatting for asteroid data.
 * Every format function produces NERV-voice output —
 * clinical, precise, slightly menacing.
 */

import { formatDistanceToNow, format, isPast } from "date-fns";
import type { ThreatTier } from "@/types/asteroid.types";

// ── COUNTDOWN / TIME ──────────────────────────────────────────────────────────────

/**
 * Formats milliseconds into DD:HH:MM:SS countdown string.
 * The interface shows time remaining, not elapsed.
 */
export function formatCountdown(epochMs: number): string {
  const remaining = epochMs - Date.now();

  if (remaining <= 0) return "APPROACH COMPLETE";

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${String(days).padStart(3, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Human-readable relative time for approach dates.
 * Example: "in 2 days", "in 14 hours"
 */
export function formatApproachDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isPast(date)) return "APPROACH COMPLETE";
    return formatDistanceToNow(date, { addSuffix: true }).toUpperCase();
  } catch {
    return "DATE UNKNOWN";
  }
}

/**
 * Formats a date string into NERV display format: "2029-APR-13 // 21:46 UTC"
 */
export function formatNervDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, "yyyy-MMM-dd // HH:mm 'UTC'").toUpperCase();
  } catch {
    return "DATE CLASSIFIED";
  }
}

// ── DISTANCE ──────────────────────────────────────────────────────────────────────

/**
 * Formats AU distance with appropriate precision.
 * AU values are precise to 5 decimal places — every decimal matters.
 */
export function formatDistanceAu(au: number): string {
  if (au < 0.001) return `${(au * 149_597_870).toFixed(0)} km`;
  if (au < 0.01) return `${au.toFixed(5)} AU`;
  return `${au.toFixed(4)} AU`;
}

/**
 * Formats distance in Lunar Distances (more intuitive for near-Earth context).
 * 1 LD = 384,400 km (Earth-Moon distance)
 */
export function formatDistanceLd(ld: number): string {
  if (ld < 1) return `${ld.toFixed(3)} LD`;
  if (ld < 10) return `${ld.toFixed(2)} LD`;
  return `${ld.toFixed(1)} LD`;
}

/**
 * Formats kilometers with appropriate SI prefix.
 */
export function formatDistanceKm(km: number): string {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(2)} M km`;
  if (km >= 1_000) return `${(km / 1_000).toFixed(1)} k km`;
  return `${km.toFixed(0)} km`;
}

// ── VELOCITY ──────────────────────────────────────────────────────────────────────

export function formatVelocity(kmS: number): string {
  return `${kmS.toFixed(2)} km/s`;
}

// ── PROBABILITY ───────────────────────────────────────────────────────────────────

/**
 * Formats impact probability in NERV style.
 * Very small probabilities are displayed in scientific notation.
 * The trailing zeros are kept — precision implies seriousness.
 */
export function formatProbability(probability: number): string {
  if (probability === 0) return "0.000000%";
  if (probability < 0.000001) return `${(probability * 100).toExponential(3)}%`;
  if (probability < 0.0001) return `${(probability * 100).toFixed(6)}%`;
  if (probability < 0.01) return `${(probability * 100).toFixed(4)}%`;
  return `${(probability * 100).toFixed(2)}%`;
}

// ── DIAMETER ─────────────────────────────────────────────────────────────────────

export function formatDiameter(min: number, max: number, unit: string): string {
  const avg = (min + max) / 2;
  if (avg < 0.01) return `${(avg * 1000).toFixed(0)}–${(max * 1000).toFixed(0)} m`;
  return `${min.toFixed(3)}–${max.toFixed(3)} ${unit}`;
}

// ── MASS ─────────────────────────────────────────────────────────────────────────

export function formatMass(kg: number | null): string {
  if (kg === null) return "INSUFFICIENT DATA";
  if (kg >= 1e18) return `${(kg / 1e18).toFixed(2)} × 10¹⁸ kg`;
  if (kg >= 1e15) return `${(kg / 1e15).toFixed(2)} × 10¹⁵ kg`;
  if (kg >= 1e12) return `${(kg / 1e12).toFixed(2)} × 10¹² kg`;
  if (kg >= 1e9) return `${(kg / 1e9).toFixed(2)} × 10⁹ kg`;
  return `${kg.toExponential(2)} kg`;
}

// ── YIELD ────────────────────────────────────────────────────────────────────────

export function formatYield(megatons: number | null): string {
  if (megatons === null) return "INSUFFICIENT DATA";
  if (megatons >= 1_000_000) return `${(megatons / 1_000_000).toFixed(1)} T MT`;
  if (megatons >= 1_000) return `${(megatons / 1_000).toFixed(1)} k MT`;
  if (megatons < 0.001) return `${(megatons * 1_000_000).toFixed(1)} T`;
  return `${megatons.toFixed(1)} MT`;
}

// ── THREAT TIER ───────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<ThreatTier, string> = {
  MINIMAL: "MINIMAL",
  MONITOR: "MONITOR",
  ELEVATED: "ELEVATED",
  PRIORITY_AMBER: "PRIORITY AMBER",
  PRIORITY_RED: "PRIORITY RED",
  PATTERN_BLUE: "PATTERN BLUE",
};

export function formatThreatTier(tier: ThreatTier): string {
  return TIER_LABELS[tier];
}

/**
 * Returns the CSS color variable name for a given threat tier.
 * Used for dynamic Tailwind color classes.
 */
export function getTierColorClass(tier: ThreatTier): string {
  const colorMap: Record<ThreatTier, string> = {
    MINIMAL: "text-phosphor-dim",
    MONITOR: "text-phosphor-mid",
    ELEVATED: "text-amber-bright",
    PRIORITY_AMBER: "text-nerv-orange",
    PRIORITY_RED: "text-bloodwarn-text",
    PATTERN_BLUE: "text-bloodwarn-bright",
  };
  return colorMap[tier];
}

export function getTierBorderClass(tier: ThreatTier): string {
  const colorMap: Record<ThreatTier, string> = {
    MINIMAL: "border-phosphor-dim/40",
    MONITOR: "border-phosphor-mid/50",
    ELEVATED: "border-amber-bright/60",
    PRIORITY_AMBER: "border-nerv-orange",
    PRIORITY_RED: "border-bloodwarn-text",
    PATTERN_BLUE: "border-bloodwarn-bright",
  };
  return colorMap[tier];
}

export function getTierBgClass(tier: ThreatTier): string {
  const colorMap: Record<ThreatTier, string> = {
    MINIMAL: "bg-phosphor-dim/5",
    MONITOR: "bg-phosphor-dim/8",
    ELEVATED: "bg-amber-core/5",
    PRIORITY_AMBER: "bg-nerv-orange/5",
    PRIORITY_RED: "bg-bloodwarn/8",
    PATTERN_BLUE: "bg-bloodwarn-bright/10",
  };
  return colorMap[tier];
}

export function getTierGlowClass(tier: ThreatTier): string {
  const glowMap: Record<ThreatTier, string> = {
    MINIMAL: "",
    MONITOR: "",
    ELEVATED: "shadow-amber",
    PRIORITY_AMBER: "shadow-nerv-orange",
    PRIORITY_RED: "shadow-bloodwarn",
    PATTERN_BLUE: "shadow-bloodwarn",
  };
  return glowMap[tier];
}
