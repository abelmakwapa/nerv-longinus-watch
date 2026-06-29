// filepath: src/components/solar-system/SolarSystem.tsx
"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useQuery } from "@tanstack/react-query";
import { ACESFilmicToneMapping } from "three";
import { Scene } from "./Scene";
import { SceneHud } from "./SceneHud";
import type { AsteroidListResponse } from "@/types/asteroid.types";

/**
 * The hero: a full-bleed interactive 3D solar system with NERV CRT overlays.
 *
 * Data is read from the shared TanStack Query cache OUTSIDE the R3F Canvas
 * (React Query context does not cross the Canvas reconciler boundary) and passed
 * into the scene as props. Zustand state is safe inside the Canvas — it's a
 * singleton store, not React context.
 */
export function SolarSystem() {
  // Passive cache subscriber — AsteroidFeed owns the fetch (queryFn + polling).
  const { data } = useQuery<AsteroidListResponse>({
    queryKey: ["asteroids"],
    enabled: false,
    staleTime: 14 * 60 * 1000,
  });

  const asteroids = data?.data ?? [];

  return (
    <div className="absolute inset-0 overflow-hidden bg-void-black">
      <Canvas
        camera={{ position: [0, 42, 92], fov: 46, near: 0.1, far: 4000 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <Suspense fallback={null}>
          <Scene asteroids={asteroids} />
        </Suspense>
      </Canvas>

      {/* ── CRT / ANALOG OVERLAYS (over the canvas, non-interactive) ───────────── */}
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(2,3,4,0.72) 100%)" }}
      />
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* Subtle phosphor flicker */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-phosphor/[0.015] animate-flicker" />

      {/* Holographic HUD frame */}
      <SceneHud objectCount={asteroids.length} />
    </div>
  );
}
