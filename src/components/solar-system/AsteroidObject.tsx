// filepath: src/components/solar-system/AsteroidObject.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  AdditiveBlending,
  Color,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type Sprite,
} from "three";
import {
  positionAt,
  meanAnomalyAt,
  asteroidSceneRadius,
} from "@/lib/three/orbital-math";
import { TIER_HEX, TIER_EMISSIVE, TIER_INTENSITY, isHostile } from "@/lib/three/nerv-colors";
import { makeRadialGlow } from "@/lib/three/glow-texture";
import { registerPosition } from "./scene-registry";
import { OrbitPath } from "./OrbitPath";
import { ApproachVector } from "./ApproachVector";
import { TargetingReticle } from "./TargetingReticle";
import { useStore } from "@/store";
import { soundEngine } from "@/lib/sound/SoundEngine";
import {
  formatVelocity,
  formatDistanceLd,
  formatProbability,
  formatThreatTier,
} from "@/lib/utils/format";
import type { NervAsteroid } from "@/types/asteroid.types";

interface AsteroidObjectProps {
  asteroid: NervAsteroid;
}

export function AsteroidObject({ asteroid }: AsteroidObjectProps) {
  const group = useRef<Group>(null);
  const rock = useRef<Mesh>(null);
  const rockMat = useRef<MeshStandardMaterial>(null);
  const glowSprite = useRef<Sprite>(null);
  const [hovered, setHovered] = useState(false);

  const selectedId = useStore((s) => s.selection.selectedAsteroidId);
  const selectAsteroid = useStore((s) => s.selectAsteroid);
  const hoverAsteroid = useStore((s) => s.hoverAsteroid);

  const isSelected = selectedId === asteroid.id;
  const tier = asteroid.threat.tier;
  const hostile = isHostile(tier);
  const active = hovered || isSelected;

  // Diameter (km) → visible scene radius.
  const radius = useMemo(() => {
    const d = asteroid.physical.diameter;
    const avg = (d.min + d.max) / 2;
    const km = d.unit === "m" ? avg / 1000 : avg;
    return asteroidSceneRadius(km);
  }, [asteroid.physical.diameter]);

  const livePos = useMemo(() => registerPosition(asteroid.id), [asteroid.id]);

  const glow = useMemo(
    () =>
      makeRadialGlow(`ast-glow-${tier}`, [
        [0, "rgba(255,255,255,0.9)"],
        [0.25, hexToRgba(TIER_EMISSIVE[tier], 0.7)],
        [1, hexToRgba(TIER_EMISSIVE[tier], 0)],
      ]),
    [tier]
  );

  useFrame(({ clock }) => {
    if (!asteroid.orbitalElements) return;
    const t = clock.getElapsedTime();
    const M = meanAnomalyAt(
      asteroid.orbitalElements.meanAnomaly,
      asteroid.orbitalElements.orbitalPeriod,
      t
    );
    positionAt(asteroid.orbitalElements, M, livePos);
    if (group.current) group.current.position.copy(livePos);
    if (rock.current) {
      rock.current.rotation.x += 0.01;
      rock.current.rotation.y += 0.013;
    }
    // Pulsing emissive for hostile / active bodies.
    if (rockMat.current) {
      const base = TIER_INTENSITY[tier];
      const pulse = hostile ? Math.sin(t * 3) * 0.6 + 0.6 : 0;
      rockMat.current.emissiveIntensity = base + pulse + (active ? 1.2 : 0);
    }
    if (glowSprite.current) {
      const s = radius * (active ? 7 : 5) + (hostile ? Math.sin(t * 3) * 0.3 : 0);
      glowSprite.current.scale.setScalar(s);
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    hoverAsteroid(asteroid.id);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    setHovered(false);
    hoverAsteroid(null);
    document.body.style.cursor = "auto";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    soundEngine?.play("ui_select");
    selectAsteroid(asteroid.id);
  };

  if (!asteroid.orbitalElements) return null;

  return (
    <>
      {/* Orbit path — brightens when active */}
      <OrbitPath
        elements={asteroid.orbitalElements}
        color={TIER_HEX[tier]}
        opacity={active ? 0.85 : hostile ? 0.42 : 0.2}
        lineWidth={active ? 1.8 : 1}
      />

      {/* Approach vector to Earth for hostile objects */}
      {hostile && (
        <ApproachVector asteroidId={asteroid.id} color={TIER_HEX[tier]} active />
      )}

      <group ref={group}>
        {/* Glow halo */}
        <sprite ref={glowSprite} scale={radius * 5}>
          <spriteMaterial map={glow} blending={AdditiveBlending} transparent depthWrite={false} />
        </sprite>

        {/* The rock — irregular icosahedron */}
        <mesh ref={rock} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
          <icosahedronGeometry args={[radius, 1]} />
          <meshStandardMaterial
            ref={rockMat}
            color={new Color(TIER_HEX[tier])}
            emissive={new Color(TIER_EMISSIVE[tier])}
            emissiveIntensity={TIER_INTENSITY[tier]}
            roughness={0.6}
            metalness={0.3}
            flatShading
            toneMapped={false}
          />
        </mesh>

        {/* Targeting reticle for hostile or active bodies */}
        {(hostile || active) && (
          <TargetingReticle radius={radius} color={TIER_HEX[tier]} locked={isSelected} />
        )}

        {/* Holographic hover label */}
        {active && (
          <Html
            position={[radius * 3, radius * 3, 0]}
            distanceFactor={16}
            zIndexRange={[30, 0]}
            style={{ pointerEvents: "none" }}
          >
            <HoloLabel asteroid={asteroid} />
          </Html>
        )}
      </group>
    </>
  );
}

// ── HOLOGRAPHIC HOVER LABEL ─────────────────────────────────────────────────────────

function HoloLabel({ asteroid }: { asteroid: NervAsteroid }) {
  const tier = asteroid.threat.tier;
  const accent = TIER_HEX[tier];
  const d = asteroid.physical.diameter;

  return (
    <div
      className="w-44 select-none border bg-[#040608]/85 backdrop-blur-sm"
      style={{ borderColor: `${accent}66`, boxShadow: `0 0 22px ${accent}40` }}
    >
      <div
        className="flex items-center justify-between px-2 py-1 border-b"
        style={{ borderColor: `${accent}33`, background: `${accent}14` }}
      >
        <span className="font-display text-[8px] tracking-[0.18em]" style={{ color: accent }}>
          {asteroid.nervCodename}
        </span>
        <span className="font-body text-[7px] tracking-[0.12em] text-[#7d8a9c]">
          {formatThreatTier(tier)}
        </span>
      </div>
      <div className="px-2 py-1.5 space-y-1">
        <div className="font-display text-[9px] tracking-[0.05em] text-[#e8c47a] truncate">
          {asteroid.designation}
        </div>
        <LabelRow label="Ø" value={`${d.min.toFixed(2)}–${d.max.toFixed(2)} ${d.unit}`} />
        {asteroid.closestApproach && (
          <>
            <LabelRow label="VEL" value={formatVelocity(asteroid.closestApproach.velocityKmS)} />
            <LabelRow label="MISS" value={formatDistanceLd(asteroid.closestApproach.distanceLd)} />
          </>
        )}
        <LabelRow label="P(I)" value={formatProbability(asteroid.threat.impactProbability)} accent={accent} />
      </div>
      <div className="px-2 pb-1 font-body text-[6px] tracking-[0.1em] text-[#4a5566]">
        ▸ CLICK TO OPEN DOSSIER
      </div>
    </div>
  );
}

function LabelRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-body text-[7px] tracking-[0.12em] text-[#5a6678]">{label}</span>
      <span className="terminal-text text-[9px]" style={{ color: accent ?? "#9fb4c8" }}>
        {value}
      </span>
    </div>
  );
}

// ── UTIL ────────────────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
