// filepath: src/components/solar-system/Earth.tsx
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  Color,
  type Group,
  type Mesh,
  type ShaderMaterial,
} from "three";
import { positionAt, meanAnomalyAt, EARTH_ELEMENTS } from "@/lib/three/orbital-math";
import { earthPosition } from "./scene-registry";
import { NERV_PALETTE } from "@/lib/three/nerv-colors";

const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - abs(dot(vN, vV)), uPower);
    gl_FragColor = vec4(uColor * f * uIntensity, f);
  }
`;

export function Earth() {
  const group = useRef<Group>(null);
  const globe = useRef<Mesh>(null);
  const grid = useRef<Mesh>(null);
  const atmoMat = useRef<ShaderMaterial>(null);

  const atmoUniforms = useMemo(
    () => ({
      uColor: { value: new Color(NERV_PALETTE.earthAtmo) },
      uPower: { value: 3.0 },
      uIntensity: { value: 1.6 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const M = meanAnomalyAt(EARTH_ELEMENTS.meanAnomaly, EARTH_ELEMENTS.orbitalPeriod, t);
    positionAt(EARTH_ELEMENTS, M, earthPosition);
    if (group.current) group.current.position.copy(earthPosition);
    if (globe.current) globe.current.rotation.y += 0.04;
    if (grid.current) grid.current.rotation.y -= 0.012;
  });

  return (
    <group ref={group}>
      {/* Solid dark ocean globe */}
      <mesh ref={globe}>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshStandardMaterial
          color={NERV_PALETTE.earth}
          emissive={new Color("#0a3a6a")}
          emissiveIntensity={0.35}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Holographic lat/long grid shell */}
      <mesh ref={grid} scale={1.012}>
        <sphereGeometry args={[0.5, 24, 16]} />
        <meshBasicMaterial
          color={NERV_PALETTE.earthGrid}
          wireframe
          transparent
          opacity={0.22}
          toneMapped={false}
        />
      </mesh>

      {/* Fresnel atmosphere halo */}
      <mesh scale={1.22}>
        <sphereGeometry args={[0.5, 48, 48]} />
        <shaderMaterial
          ref={atmoMat}
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          uniforms={atmoUniforms}
          transparent
          blending={AdditiveBlending}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Identity label */}
      <Html position={[0, 0.95, 0]} center distanceFactor={26} zIndexRange={[20, 0]}>
        <div className="select-none whitespace-nowrap font-display text-[10px] tracking-[0.25em] text-[#7fb8ff]"
             style={{ textShadow: "0 0 8px rgba(47,143,255,0.8)" }}>
          ◇ EARTH // SOL-III
        </div>
      </Html>
    </group>
  );
}
