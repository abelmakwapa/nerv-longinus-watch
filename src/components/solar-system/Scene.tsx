// filepath: src/components/solar-system/Scene.tsx
"use client";

import { useEffect } from "react";
import { Starfield } from "./Starfield";
import { Sun } from "./Sun";
import { Earth } from "./Earth";
import { OrbitPath } from "./OrbitPath";
import { AsteroidObject } from "./AsteroidObject";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";
import { livePositions } from "./scene-registry";
import { EARTH_ELEMENTS } from "@/lib/three/orbital-math";
import { NERV_PALETTE } from "@/lib/three/nerv-colors";
import type { NervAsteroid } from "@/types/asteroid.types";

interface SceneProps {
  asteroids: NervAsteroid[];
}

/** Contents of the 3D canvas — the heliocentric NERV projection. */
export function Scene({ asteroids }: SceneProps) {
  // Prune position registry entries for objects no longer tracked.
  useEffect(() => {
    const ids = new Set(asteroids.map((a) => a.id));
    for (const key of Array.from(livePositions.keys())) {
      if (!ids.has(key)) livePositions.delete(key);
    }
  }, [asteroids]);

  return (
    <>
      <color attach="background" args={[NERV_PALETTE.void]} />

      <Starfield />
      <Sun />
      <Earth />

      {/* Earth's reference orbit */}
      <OrbitPath elements={EARTH_ELEMENTS} color={NERV_PALETTE.orbitEarth} opacity={0.5} lineWidth={1.4} />

      {/* Tracked near-Earth objects */}
      {asteroids.map((a) => (
        <AsteroidObject key={a.id} asteroid={a} />
      ))}

      <CameraRig />
      <PostFX />
    </>
  );
}
