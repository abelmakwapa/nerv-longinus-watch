// filepath: src/components/solar-system/TargetingReticle.tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Line } from "@react-three/drei";
import { Vector3, type Group } from "three";

interface TargetingReticleProps {
  radius: number;
  color: string;
  /** Locked reticles (selected) pulse faster and brighter. */
  locked?: boolean;
}

function circlePoints(r: number, seg = 64): Vector3[] {
  const pts: Vector3[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push(new Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  return pts;
}

/** Billboarded tactical reticle: rotating ring, dashed ring, and corner brackets. */
export function TargetingReticle({ radius, color, locked = false }: TargetingReticleProps) {
  const spin = useRef<Group>(null);
  const pulse = useRef<Group>(null);

  const R = radius * 2.4;
  const ring = useMemo(() => circlePoints(R), [R]);
  const innerRing = useMemo(() => circlePoints(R * 0.7), [R]);

  // Four L-shaped corner brackets at ±R.
  const brackets = useMemo(() => {
    const c = R * 1.35;
    const len = R * 0.4;
    const corners: [number, number][] = [
      [-c, c], [c, c], [c, -c], [-c, -c],
    ];
    return corners.map(([x, y]) => {
      const sx = Math.sign(x), sy = Math.sign(y);
      return [
        new Vector3(x - sx * len, y, 0),
        new Vector3(x, y, 0),
        new Vector3(x, y - sy * len, 0),
      ];
    });
  }, [R]);

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z += dt * (locked ? 0.9 : 0.4);
    if (pulse.current) {
      const s = 1 + Math.sin(performance.now() * (locked ? 0.006 : 0.003)) * 0.06;
      pulse.current.scale.setScalar(s);
    }
  });

  return (
    <Billboard>
      <group ref={pulse}>
        {/* Static dashed outer ring */}
        <Line points={ring} color={color} lineWidth={locked ? 1.6 : 1} transparent opacity={0.9} toneMapped={false} />
        {/* Rotating inner ring + brackets */}
        <group ref={spin}>
          <Line points={innerRing} color={color} lineWidth={1} dashed dashSize={0.18} gapSize={0.12} transparent opacity={0.6} toneMapped={false} />
          {brackets.map((pts, i) => (
            <Line key={i} points={pts} color={color} lineWidth={locked ? 1.8 : 1.2} transparent opacity={0.95} toneMapped={false} />
          ))}
        </group>
      </group>
    </Billboard>
  );
}
