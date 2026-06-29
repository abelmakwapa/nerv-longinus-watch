// filepath: src/types/asteroid.types.ts

// ── THREAT TIER CLASSIFICATION ────────────────────────────────────────────────────

export type ThreatTier =
  | "MINIMAL"
  | "MONITOR"
  | "ELEVATED"
  | "PRIORITY_AMBER"
  | "PRIORITY_RED"
  | "PATTERN_BLUE";

export type ThreatScore = number;

// ── ORBITAL DATA ─────────────────────────────────────────────────────────────────

export interface CloseApproach {
  date: string;
  dateTime: string;
  epochMs: number;
  distanceAu: number;
  distanceKm: number;
  distanceLd: number;
  velocityKmS: number;
  velocityKmH: number;
  orbitingBody: string;
}

export interface OrbitalElements {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longAscendingNode: number;
  argPerihelion: number;
  meanAnomaly: number;
  orbitalPeriod: number;
  perihelionDist: number;
  aphelionDist: number;
}

// ── PHYSICAL CHARACTERISTICS ──────────────────────────────────────────────────────

export interface DiameterEstimate {
  min: number;
  max: number;
  unit: "km" | "m";
}

export interface PhysicalCharacteristics {
  diameter: DiameterEstimate;
  absoluteMagnitude: number;
  estimatedMassKg: number | null;
  orbitalClass: string;
}

// ── THREAT ASSESSMENT ─────────────────────────────────────────────────────────────

export interface ThreatAssessment {
  tier: ThreatTier;
  score: ThreatScore;
  impactProbability: number;
  torinoScale: number;
  kineticYieldMt: number | null;
  yieldClassification: string;
  isPotentiallyHazardous: boolean;
  isSentryObject: boolean;
  probabilityDelta7d: number;
}

// ── PRIMARY ASTEROID TYPE ─────────────────────────────────────────────────────────

export interface NervAsteroid {
  id: string;
  neoReferenceId: string;
  designation: string;
  nervCodename: string;
  nasaJplUrl: string;

  physical: PhysicalCharacteristics;
  threat: ThreatAssessment;

  closestApproach: CloseApproach | null;
  allApproaches: CloseApproach[];

  orbitalElements: OrbitalElements | null;

  classificationLevel: "UNCLASSIFIED" | "CONFIDENTIAL" | "SECRET" | "TOP_SECRET";

  atFieldProbability: number;

  lastUpdated: string;
}

// ── API RESPONSE SHAPES ───────────────────────────────────────────────────────────

export interface AsteroidListResponse {
  data: NervAsteroid[];
  meta: {
    total: number;
    timestamp: string;
    nextRefresh: string;
    source: "live" | "mock" | "cached";
  };
}

// ── FILTER / SORT ─────────────────────────────────────────────────────────────────

export type SortField =
  | "threat"
  | "approach_date"
  | "designation"
  | "probability"
  | "diameter";

export type SortDirection = "asc" | "desc";

export interface FilterState {
  tier: ThreatTier | "ALL";
  search: string;
  sortField: SortField;
  sortDirection: SortDirection;
  showHazardousOnly: boolean;
}
