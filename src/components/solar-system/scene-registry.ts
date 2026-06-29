// filepath: src/components/solar-system/scene-registry.ts
/**
 * Mutable registry of live 3D positions, shared across scene components without
 * triggering React re-renders. The single Canvas instance writes positions each
 * frame; the camera rig and approach-vector lines read them.
 */

import { Vector3 } from "three";
import { AU } from "@/lib/three/orbital-math";

export const livePositions = new Map<string, Vector3>();
export const earthPosition = new Vector3(AU, 0, 0);

/** Get (or lazily create) the shared Vector3 for an asteroid id. */
export function registerPosition(id: string): Vector3 {
  let v = livePositions.get(id);
  if (!v) {
    v = new Vector3();
    livePositions.set(id, v);
  }
  return v;
}

export function clearPositions(): void {
  livePositions.clear();
}
