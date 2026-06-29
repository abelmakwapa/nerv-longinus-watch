// filepath: src/components/solar-system/ApproachVector.tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { AdditiveBlending, Vector3, type Sprite } from "three";
import { makeRadialGlow } from "@/lib/three/glow-texture";
import { livePositions, earthPosition } from "./scene-registry";

interface ApproachVectorProps {
  asteroidId: string;
  color: string;
  active: boolean;
}

const _a = new Vector3();
const _b = new Vector3();

/**
 * Glowing dashed trajectory from a hostile asteroid to Earth, with a tracer
 * pulse that travels along the vector toward home — the "incoming" indicator.
 */
export function ApproachVector({ asteroidId, color, active }: ApproachVectorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);
  const pulse = useRef<Sprite>(null);

  const glow = makeRadialGlow("approach-pulse", [
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,90,40,0.7)"],
    [1, "rgba(255,90,40,0)"],
  ]);

  // Stable initial points — drei <Line> resets geometry when this identity
  // changes, so we memoize it once and drive updates via the ref each frame.
  const initialPoints = useMemo<[number, number, number][]>(
    () => [
      [0, 0, 0],
      [0, 0, 1],
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!active) return;
    const ast = livePositions.get(asteroidId);
    if (!ast) return;

    _a.copy(ast);
    _b.copy(earthPosition);

    // Update the line endpoints in place.
    const geo = lineRef.current?.geometry;
    if (geo?.setPositions) {
      geo.setPositions([_a.x, _a.y, _a.z, _b.x, _b.y, _b.z]);
      lineRef.current.computeLineDistances?.();
    }
    // Scroll the dashes + drive the tracer pulse toward Earth.
    const mat = lineRef.current?.material;
    if (mat && "dashOffset" in mat) mat.dashOffset -= 0.03;

    if (pulse.current) {
      const t = (clock.getElapsedTime() * 0.4) % 1;
      pulse.current.position.lerpVectors(_a, _b, t);
      const fade = Math.sin(t * Math.PI);
      pulse.current.scale.setScalar(0.4 + fade * 0.5);
      (pulse.current.material as { opacity: number }).opacity = fade;
    }
  });

  if (!active) return null;

  return (
    <group>
      <Line
        ref={lineRef}
        points={initialPoints}
        color={color}
        lineWidth={1.4}
        dashed
        dashScale={4}
        dashSize={0.5}
        gapSize={0.45}
        transparent
        opacity={0.85}
        toneMapped={false}
      />
      <sprite ref={pulse} scale={0.6}>
        <spriteMaterial map={glow} blending={AdditiveBlending} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}
