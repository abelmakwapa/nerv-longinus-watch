// filepath: src/lib/three/nerv-colors.ts
/**
 * NERV Visual Color System — shared between the 3D scene and HUD overlays.
 *
 * Single source of truth for threat-tier color mapping so the holographic
 * 3D bodies, orbit vectors, reticles, and the 2D glass HUD all agree.
 */

import { Color } from "three";
import type { ThreatTier } from "@/types/asteroid.types";

/** Base hex for each tier — matches the dossier / badge palette. */
export const TIER_HEX: Record<ThreatTier, string> = {
  MINIMAL: "#1f8a3b",
  MONITOR: "#00cc33",
  ELEVATED: "#ffb000",
  PRIORITY_AMBER: "#ff6600",
  PRIORITY_RED: "#ff1e1e",
  PATTERN_BLUE: "#2f6bff",
};

/** Brighter emissive used for the glowing core of 3D bodies (bloom picks this up). */
export const TIER_EMISSIVE: Record<ThreatTier, string> = {
  MINIMAL: "#36d66a",
  MONITOR: "#39ff7a",
  ELEVATED: "#ffcb52",
  PRIORITY_AMBER: "#ff9a3d",
  PRIORITY_RED: "#ff4d4d",
  PATTERN_BLUE: "#5b8bff",
};

/** Relative emissive intensity — danger glows hotter. */
export const TIER_INTENSITY: Record<ThreatTier, number> = {
  MINIMAL: 1.1,
  MONITOR: 1.4,
  ELEVATED: 1.9,
  PRIORITY_AMBER: 2.6,
  PRIORITY_RED: 3.6,
  PATTERN_BLUE: 4.4,
};

/** Tiers that warrant a targeting reticle + active approach vector. */
export const HOSTILE_TIERS: ThreatTier[] = [
  "PRIORITY_AMBER",
  "PRIORITY_RED",
  "PATTERN_BLUE",
];

export function isHostile(tier: ThreatTier): boolean {
  return HOSTILE_TIERS.includes(tier);
}

/** Cached THREE.Color instances (avoids per-frame allocation). */
const _colorCache = new Map<string, Color>();
export function tierColor(tier: ThreatTier, emissive = false): Color {
  const hex = (emissive ? TIER_EMISSIVE : TIER_HEX)[tier];
  let c = _colorCache.get(hex);
  if (!c) {
    c = new Color(hex);
    _colorCache.set(hex, c);
  }
  return c;
}

// ── ENVIRONMENT PALETTE ────────────────────────────────────────────────────────────

export const NERV_PALETTE = {
  void: "#020304",
  sunCore: "#fff1c2",
  sunGlow: "#ff8a2a",
  earth: "#0a2a4a",
  earthAtmo: "#2f8fff",
  earthGrid: "#3aa0ff",
  orbitDim: "#3a4658",
  orbitEarth: "#2f8fff",
  reticle: "#ff6600",
  hudOrange: "#ff6600",
  hudPhosphor: "#39ff7a",
} as const;
