// filepath: src/lib/transformers/neows-transformer.ts
/**
 * NeoWs API Response → NERV Data Model Transformer
 *
 * Converts raw NASA API data into the application's internal data model.
 * All business logic for threat classification lives here.
 * This is the only place that should know about both the NASA API shape
 * and the NervAsteroid shape simultaneously.
 */

import type { NeoWsAsteroid, NeoWsFeedResponse } from "@/schemas/neows.schema";
import type { NervAsteroid, CloseApproach, ThreatTier } from "@/types/asteroid.types";

// ── THREAT CLASSIFICATION LOGIC ───────────────────────────────────────────────────

/**
 * NERV codenames for asteroids — assigned deterministically by ID hash.
 * These are the names of Angels from Neon Genesis Evangelion.
 */
const NERV_CODENAMES = [
  "SACHIEL", "SHAMSHEL", "RAMIEL", "GAGHIEL", "ISRAFEL",
  "SANDALPHON", "MATARAEL", "SAHAQUIEL", "IRUEL", "LELIEL",
  "BARDIEL", "ZERUEL", "ARAEL", "ARMISAEL", "TABRIS",
  "KAWORU", "UNIT-00", "UNIT-01", "UNIT-02", "UNIT-03",
];

function getNervCodename(id: string): string {
  // Deterministic assignment based on ID — same object always gets same codename
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return NERV_CODENAMES[Math.abs(hash) % NERV_CODENAMES.length];
}

/**
 * Classifies threat tier based on computed impact probability and approach distance.
 * The thresholds here are NERV-specific — more aggressive than public NASA classifications
 * to reflect the "always 14 minutes away" design philosophy.
 */
function classifyThreatTier(
  impactProbability: number,
  closestApproachAu: number | null,
  isPotentiallyHazardous: boolean,
  isSentryObject: boolean
): ThreatTier {
  // Sentry objects (actively tracked for impact risk) are always at least ELEVATED
  const baseElevation = isSentryObject ? "ELEVATED" : "MINIMAL";

  if (impactProbability >= 0.01) return "PATTERN_BLUE"; // ≥1% — extinction-level concern
  if (impactProbability >= 0.001) return "PRIORITY_RED"; // ≥0.1%
  if (impactProbability >= 0.0001) return "PRIORITY_AMBER"; // ≥0.01%
  if (impactProbability >= 0.00001 || isPotentiallyHazardous) return "ELEVATED";
  if (closestApproachAu !== null && closestApproachAu < 0.05) return "MONITOR";

  return baseElevation;
}

/**
 * Calculates a normalized threat score (0–100) for sorting.
 * Combines probability, distance, and size into a single comparable value.
 */
function calculateThreatScore(
  impactProbability: number,
  closestApproachAu: number | null,
  absoluteMagnitude: number
): number {
  // Log-scale probability component (0–50 points)
  const probScore = impactProbability > 0
    ? Math.min(50, Math.log10(impactProbability * 1_000_000) * 8.3)
    : 0;

  // Proximity component — closer = higher score (0–30 points)
  const proximityScore = closestApproachAu !== null
    ? Math.max(0, 30 * (1 - closestApproachAu / 0.2))
    : 0;

  // Size component — H magnitude inverted (smaller H = larger object = higher score) (0–20 points)
  // H < 18 = 20 points, H > 28 = 0 points
  const sizeScore = Math.max(0, Math.min(20, (28 - absoluteMagnitude) * 2));

  return Math.round(Math.max(0, Math.min(100, probScore + proximityScore + sizeScore)));
}

/**
 * Simplified kinetic energy yield calculator.
 * Uses KE = 0.5 * m * v² with reasonable density assumptions.
 *
 * Returns yield in megatons TNT equivalent, or null if data insufficient.
 */
function calculateKineticYield(
  diameterKm: number,
  velocityKmS: number | null
): { megatons: number; classification: string } | null {
  if (!velocityKmS) return null;

  // Assume mean stony density of 2,600 kg/m³
  const radiusM = (diameterKm * 1000) / 2;
  const massKg = (4 / 3) * Math.PI * Math.pow(radiusM, 3) * 2600;

  // Kinetic energy in Joules: KE = 0.5 * m * v²
  const velocityMs = velocityKmS * 1000;
  const ke = 0.5 * massKg * Math.pow(velocityMs, 2);

  // Convert to megatons: 1 MT TNT = 4.184e15 Joules
  const megatons = ke / 4.184e15;

  // Classify by yield
  let classification: string;
  if (megatons < 0.01) classification = "LOCAL IMPACT";
  else if (megatons < 100) classification = "LOCAL DEVASTATION";
  else if (megatons < 10_000) classification = "REGIONAL DEVASTATION";
  else if (megatons < 1_000_000) classification = "CONTINENTAL SCALE";
  else classification = "MASS EXTINCTION EVENT";

  return { megatons, classification };
}

/**
 * Maps impact probability and Torino scale to a simple numeric Torino value.
 * Simplified — production would use the full Torino scale algorithm.
 */
function mapTorinoScale(impactProbability: number, distanceAu: number | null): number {
  if (impactProbability >= 0.01 && distanceAu !== null && distanceAu < 0.01)
    return 8;
  if (impactProbability >= 0.001) return 4;
  if (impactProbability >= 0.0001) return 2;
  if (impactProbability >= 0.000001) return 1;
  return 0;
}

/**
 * Derives impact probability from NeoWs data.
 * Note: NeoWs doesn't directly provide impact probability — we derive
 * a conservative estimate from miss distance and object characteristics.
 * Production systems would supplement this with Sentry API data.
 */
function deriveImpactProbability(
  asteroid: NeoWsAsteroid,
  closestApproach: NeoWsAsteroid["close_approach_data"][0] | null
): number {
  if (!closestApproach) return 0;

  const distanceAu = parseFloat(closestApproach.miss_distance.astronomical);
  const diameterKm = asteroid.estimated_diameter.kilometers.estimated_diameter_max;

  // Earth's gravitational cross-section radius (Hill sphere consideration)
  const EARTH_RADIUS_AU = 4.26e-5; // ~6,371 km in AU

  // Very simplified probability model:
  // P ≈ (Earth cross-section / approach distance)² × orbital uncertainty factor
  // This is intentionally conservative — errs toward higher threat classification
  const crossSectionRatio = EARTH_RADIUS_AU / Math.max(distanceAu, EARTH_RADIUS_AU);
  const rawProbability = Math.pow(crossSectionRatio, 2) * 0.1;

  // Larger objects have slightly higher effective cross-section due to gravitational focusing
  const sizeFactor = Math.min(2.0, 1 + diameterKm * 0.1);

  return Math.min(0.999, rawProbability * sizeFactor);
}

// ── APPROACH TRANSFORMER ──────────────────────────────────────────────────────────

function transformApproach(
  raw: NeoWsAsteroid["close_approach_data"][0]
): CloseApproach {
  return {
    date: raw.close_approach_date,
    dateTime: raw.close_approach_date_full,
    epochMs: raw.epoch_date_close_approach,
    distanceAu: parseFloat(raw.miss_distance.astronomical),
    distanceKm: parseFloat(raw.miss_distance.kilometers),
    distanceLd: parseFloat(raw.miss_distance.lunar),
    velocityKmS: parseFloat(raw.relative_velocity.kilometers_per_second),
    velocityKmH: parseFloat(raw.relative_velocity.kilometers_per_hour),
    orbitingBody: raw.orbiting_body,
  };
}

// ── PRIMARY TRANSFORMER ───────────────────────────────────────────────────────────

export function transformAsteroid(raw: NeoWsAsteroid): NervAsteroid {
  // Find closest Earth approach — minimum AU distance
  const earthApproaches = raw.close_approach_data.filter(
    (a) => a.orbiting_body === "Earth"
  );
  const sortedApproaches = [...earthApproaches].sort(
    (a, b) =>
      parseFloat(a.miss_distance.astronomical) -
      parseFloat(b.miss_distance.astronomical)
  );
  const closestRaw = sortedApproaches[0] ?? raw.close_approach_data[0] ?? null;

  const closestApproach = closestRaw ? transformApproach(closestRaw) : null;
  const impactProbability = deriveImpactProbability(raw, closestRaw ?? null);

  const threatTier = classifyThreatTier(
    impactProbability,
    closestApproach?.distanceAu ?? null,
    raw.is_potentially_hazardous_asteroid,
    raw.is_sentry_object
  );

  const diameterMid =
    (raw.estimated_diameter.kilometers.estimated_diameter_min +
      raw.estimated_diameter.kilometers.estimated_diameter_max) /
    2;

  const yieldData = calculateKineticYield(
    diameterMid,
    closestApproach?.velocityKmS ?? null
  );

  // Parse orbital elements from orbital_data if present
  const od = raw.orbital_data;
  const orbitalElements = od
    ? {
        semiMajorAxis: parseFloat(od.semi_major_axis),
        eccentricity: parseFloat(od.eccentricity),
        inclination: parseFloat(od.inclination),
        longAscendingNode: parseFloat(od.ascending_node_longitude),
        argPerihelion: parseFloat(od.perihelion_argument),
        meanAnomaly: parseFloat(od.mean_anomaly),
        orbitalPeriod: parseFloat(od.orbital_period),
        perihelionDist: parseFloat(od.perihelion_distance),
        aphelionDist: parseFloat(od.aphelion_distance),
      }
    : null;

  return {
    id: raw.id,
    neoReferenceId: raw.neo_reference_id,
    designation: raw.name,
    nervCodename: getNervCodename(raw.id),
    nasaJplUrl: raw.nasa_jpl_url,

    physical: {
      diameter: {
        min: raw.estimated_diameter.kilometers.estimated_diameter_min,
        max: raw.estimated_diameter.kilometers.estimated_diameter_max,
        unit: "km",
      },
      absoluteMagnitude: raw.absolute_magnitude_h,
      estimatedMassKg: null, // NeoWs doesn't provide mass directly
      orbitalClass: od?.orbit_class?.orbit_class_type ?? "UNKNOWN",
    },

    threat: {
      tier: threatTier,
      score: calculateThreatScore(
        impactProbability,
        closestApproach?.distanceAu ?? null,
        raw.absolute_magnitude_h
      ),
      impactProbability,
      torinoScale: mapTorinoScale(
        impactProbability,
        closestApproach?.distanceAu ?? null
      ),
      kineticYieldMt: yieldData?.megatons ?? null,
      yieldClassification: yieldData?.classification ?? "INSUFFICIENT DATA",
      isPotentiallyHazardous: raw.is_potentially_hazardous_asteroid,
      isSentryObject: raw.is_sentry_object,
      probabilityDelta7d: 0, // Would require historical comparison
    },

    closestApproach,
    allApproaches: raw.close_approach_data.map(transformApproach),
    orbitalElements,

    classificationLevel: raw.is_potentially_hazardous_asteroid
      ? "TOP_SECRET"
      : "SECRET",
    atFieldProbability: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Transforms the entire NeoWs feed response into an array of NervAsteroids,
 * sorted by threat score (highest first).
 */
export function transformNeoWsFeed(feed: NeoWsFeedResponse): NervAsteroid[] {
  const allAsteroids = Object.values(feed.near_earth_objects).flat();
  return allAsteroids
    .map(transformAsteroid)
    .sort((a, b) => b.threat.score - a.threat.score);
}
