// filepath: src/components/solar-system/Sun.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Mesh } from "three";
import { makeRadialGlow } from "@/lib/three/glow-texture";

/**
 * The Sun — emissive core, layered corona sprites, and the scene's primary
 * point light. Sized small (≈1.6u) so the inner system reads clearly; bloom
 * does the heavy lifting on the glow.
 */
export function Sun() {
  const core = useRef<Mesh>(null);

  const corona = makeRadialGlow("sun-corona", [
    [0, "rgba(255,244,214,1)"],
    [0.18, "rgba(255,180,90,0.9)"],
    [0.45, "rgba(255,120,40,0.35)"],
    [1, "rgba(255,90,20,0)"],
  ]);
  const flare = makeRadialGlow("sun-flare", [
    [0, "rgba(255,230,180,0.9)"],
    [0.5, "rgba(255,140,50,0.12)"],
    [1, "rgba(255,120,40,0)"],
  ]);

  useFrame((_, dt) => {
    if (core.current) core.current.rotation.y += dt * 0.08;
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={420} distance={600} decay={1.4} color="#ffd9a0" />
      <ambientLight intensity={0.18} color="#3a4a66" />

      {/* Emissive core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[1.6, 6]} />
        <meshBasicMaterial color="#fff3cf" toneMapped={false} />
      </mesh>

      {/* Inner corona */}
      <sprite scale={[11, 11, 1]}>
        <spriteMaterial map={corona} blending={AdditiveBlending} transparent depthWrite={false} />
      </sprite>
      {/* Wide flare halo */}
      <sprite scale={[26, 26, 1]}>
        <spriteMaterial map={flare} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.8} />
      </sprite>
    </group>
  );
}
