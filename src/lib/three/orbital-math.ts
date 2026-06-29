// filepath: src/lib/three/orbital-math.ts
/**
 * Keplerian orbital mechanics → 3D scene coordinates.
 *
 * Converts NASA orbital elements (semi-major axis, eccentricity, inclination,
 * longitude of ascending node, argument of perihelion, mean anomaly) into
 * heliocentric Cartesian positions for the Three.js scene.
 *
 * Frame mapping: ecliptic (x,y,z) → three.js (x, z_out, -y) so the orbital
 * plane lies roughly horizontal (X/Z) with inclination lifting bodies into Y.
 */

import { Vector3 } from "three";
import type { OrbitalElements } from "@/types/asteroid.types";

const DEG2RAD = Math.PI / 180;

/** Scene units per Astronomical Unit. Earth orbit radius = AU. */
export const AU = 16;

/** One Earth year compressed into this many real seconds (time-lapse feel). */
export const EARTH_YEAR_SECONDS = 90;
export const SECONDS_PER_DAY = EARTH_YEAR_SECONDS / 365.25;

/** Earth's own orbital elements (used for its orbit ring + live position). */
export const EARTH_ELEMENTS: OrbitalElements = {
  semiMajorAxis: 1,
  eccentricity: 0.0167,
  inclination: 0,
  longAscendingNode: 0,
  argPerihelion: 102.9,
  meanAnomaly: 100,
  orbitalPeriod: 365.25,
  perihelionDist: 0.983,
  aphelionDist: 1.017,
};

/**
 * Solve Kepler's equation  M = E - e·sin(E)  for eccentric anomaly E.
 * Newton–Raphson; converges in a handful of iterations for e < 0.95.
 */
export function solveKepler(meanAnomalyRad: number, e: number): number {
  let E = e < 0.8 ? meanAnomalyRad : Math.PI;
  for (let i = 0; i < 8; i++) {
    const dE = (E - e * Math.sin(E) - meanAnomalyRad) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-6) break;
  }
  return E;
}

/** Mean anomaly (degrees) at a given scene time, given M0 and orbital period (days). */
export function meanAnomalyAt(
  m0Deg: number,
  periodDays: number,
  elapsedSeconds: number
): number {
  const period = Math.max(periodDays, 1) * SECONDS_PER_DAY;
  return m0Deg + 360 * (elapsedSeconds / period);
}

/**
 * Rotate orbital-plane coordinates into the heliocentric ecliptic frame,
 * then map into three.js scene space (scaled by AU).
 */
function eclipticToScene(
  xOrb: number,
  yOrb: number,
  el: OrbitalElements,
  out: Vector3
): Vector3 {
  const O = el.longAscendingNode * DEG2RAD;
  const w = el.argPerihelion * DEG2RAD;
  const i = el.inclination * DEG2RAD;

  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosw = Math.cos(w), sinw = Math.sin(w);
  const cosi = Math.cos(i), sini = Math.sin(i);

  // Standard perifocal → heliocentric ecliptic rotation.
  const x =
    (cosO * cosw - sinO * sinw * cosi) * xOrb +
    (-cosO * sinw - sinO * cosw * cosi) * yOrb;
  const y =
    (sinO * cosw + cosO * sinw * cosi) * xOrb +
    (-sinO * sinw + cosO * cosw * cosi) * yOrb;
  const z = sinw * sini * xOrb + cosw * sini * yOrb;

  // Ecliptic (x,y,z) → scene (x, z, -y): out-of-plane component becomes vertical.
  return out.set(x * AU, z * AU, -y * AU);
}

/**
 * Live position of a body on its orbit at the given mean anomaly (degrees).
 */
export function positionAt(
  el: OrbitalElements,
  meanAnomalyDeg: number,
  out: Vector3 = new Vector3()
): Vector3 {
  const e = el.eccentricity;
  const M = (((meanAnomalyDeg % 360) + 360) % 360) * DEG2RAD;
  const E = solveKepler(M, e);

  const a = el.semiMajorAxis;
  // Perifocal coordinates.
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  return eclipticToScene(xOrb, yOrb, el, out);
}

/**
 * Generate a closed loop of points describing the full orbit ellipse,
 * for rendering the neon orbit path.
 */
export function orbitPathPoints(
  el: OrbitalElements,
  segments = 256
): Vector3[] {
  const pts: Vector3[] = [];
  const a = el.semiMajorAxis;
  const e = el.eccentricity;
  for (let s = 0; s <= segments; s++) {
    const E = (s / segments) * Math.PI * 2;
    const xOrb = a * (Math.cos(E) - e);
    const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);
    pts.push(eclipticToScene(xOrb, yOrb, el, new Vector3()));
  }
  return pts;
}

/**
 * Map asteroid diameter (km) to a visible scene radius, log-scaled and clamped
 * so a 4-meter rock is still selectable and a 2-km giant doesn't dominate.
 */
export function asteroidSceneRadius(diameterKm: number): number {
  const d = Math.max(diameterKm, 0.001);
  const r = 0.12 + Math.log10(d + 1) * 0.55;
  return Math.min(Math.max(r, 0.12), 0.66);
}
