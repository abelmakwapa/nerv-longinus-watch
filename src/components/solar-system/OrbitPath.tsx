// filepath: src/components/solar-system/OrbitPath.tsx
"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { orbitPathPoints } from "@/lib/three/orbital-math";
import type { OrbitalElements } from "@/types/asteroid.types";

interface OrbitPathProps {
  elements: OrbitalElements;
  color: string;
  opacity?: number;
  lineWidth?: number;
  dashed?: boolean;
}

/** A single neon orbit ellipse traced from Keplerian elements. */
export function OrbitPath({
  elements,
  color,
  opacity = 0.4,
  lineWidth = 1,
  dashed = false,
}: OrbitPathProps) {
  const points = useMemo(() => orbitPathPoints(elements, 256), [elements]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      dashed={dashed}
      dashScale={3}
      dashSize={0.6}
      gapSize={0.3}
      toneMapped={false}
    />
  );
}
