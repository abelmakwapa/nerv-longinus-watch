// filepath: src/components/solar-system/PostFX.tsx
"use client";

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Scanline,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

/**
 * Cinematic post stack that defines the NERV look:
 *  - Bloom        → neon glow on every emissive body / orbit / reticle
 *  - Chromatic    → subtle lens fringing (analog optics)
 *  - Scanline     → CRT horizontal raster
 *  - Vignette     → focuses attention, darkens edges
 *  - Noise        → faint VHS grain
 */
export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={1.15}
        luminanceThreshold={0.12}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.72}
      />
      <ChromaticAberration offset={new Vector2(0.0006, 0.0009)} radialModulation={false} />
      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.25} opacity={0.06} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.16} />
      <Vignette eskil={false} offset={0.28} darkness={0.82} />
    </EffectComposer>
  );
}
