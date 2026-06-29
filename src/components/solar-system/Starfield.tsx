// filepath: src/components/solar-system/Starfield.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { AdditiveBlending, type Points } from "three";
import { makeRadialGlow } from "@/lib/three/glow-texture";

/**
 * Deep-space backdrop: a slowly drifting starfield plus a faint galactic-core
 * haze far behind the system for depth. Bloom turns the brighter stars into
 * soft points of light.
 */
export function Starfield() {
  const ref = useRef<Points>(null);
  const haze = makeRadialGlow("galactic-haze", [
    [0, "rgba(80,110,170,0.5)"],
    [0.4, "rgba(40,60,110,0.18)"],
    [1, "rgba(10,16,30,0)"],
  ]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.005;
  });

  return (
    <group>
      <Stars
        ref={ref as never}
        radius={260}
        depth={120}
        count={6000}
        factor={4}
        saturation={0}
        fade
        speed={0.4}
      />
      {/* Distant galactic haze for atmospheric depth */}
      <sprite position={[-120, 30, -200]} scale={[320, 320, 1]}>
        <spriteMaterial
          map={haze}
          blending={AdditiveBlending}
          transparent
          depthWrite={false}
          opacity={0.6}
        />
      </sprite>
    </group>
  );
}
