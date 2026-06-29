// filepath: src/components/solar-system/CameraRig.tsx
"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import gsap from "gsap";
import { useStore } from "@/store";
import { livePositions } from "./scene-registry";

const OVERVIEW_POS = new Vector3(0, 42, 92);
const OVERVIEW_TARGET = new Vector3(0, 0, 0);

/**
 * OrbitControls + GSAP-orchestrated cinematic camera.
 * Slowly auto-rotates in overview; on asteroid selection it sweeps in to frame
 * the target, then hands control back to the user. Deselect returns to overview.
 */
export function CameraRig() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const camera = useThree((s) => s.camera);
  const selectedId = useStore((s) => s.selection.selectedAsteroidId);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    const dest = new Vector3();
    const tgt = new Vector3();

    if (selectedId && livePositions.has(selectedId)) {
      const pos = livePositions.get(selectedId)!;
      tgt.copy(pos);
      // Camera pulls "outward" along the body's radial direction, slightly above.
      dest
        .copy(pos)
        .add(pos.clone().normalize().multiplyScalar(11))
        .add(new Vector3(0, 6, 4));
      controls.autoRotate = false;
    } else {
      dest.copy(OVERVIEW_POS);
      tgt.copy(OVERVIEW_TARGET);
    }

    controls.enabled = false;
    const tl = gsap.timeline({
      onComplete: () => {
        controls.enabled = true;
        controls.autoRotate = !selectedId;
      },
    });
    tl.to(camera.position, {
      x: dest.x, y: dest.y, z: dest.z,
      duration: 1.6, ease: "power3.inOut",
      onUpdate: () => controls.update(),
    }, 0);
    tl.to(controls.target, {
      x: tgt.x, y: tgt.y, z: tgt.z,
      duration: 1.6, ease: "power3.inOut",
      onUpdate: () => controls.update(),
    }, 0);

    return () => {
      tl.kill();
    };
  }, [selectedId, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.55}
      minDistance={6}
      maxDistance={220}
      autoRotate
      autoRotateSpeed={0.25}
      maxPolarAngle={Math.PI * 0.92}
      minPolarAngle={Math.PI * 0.08}
    />
  );
}
