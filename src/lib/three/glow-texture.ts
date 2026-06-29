// filepath: src/lib/three/glow-texture.ts
/**
 * Procedural radial-gradient glow sprites. No external image assets — every
 * glow halo (sun corona, asteroid bloom dot) is drawn to a canvas at runtime.
 * Keeps the app fully offline-capable and on-theme (holographic, synthetic).
 */

import { CanvasTexture, SRGBColorSpace, type Texture } from "three";

const _cache = new Map<string, Texture>();

/**
 * Radial glow with arbitrary color stops, e.g.
 *   makeRadialGlow("sun", [[0,"#fff"],[0.3,"#ff8a2a"],[1,"rgba(255,138,42,0)"]])
 */
export function makeRadialGlow(
  key: string,
  stops: [number, string][],
  size = 256
): Texture {
  const cached = _cache.get(key);
  if (cached) return cached;

  // Guard against SSR — only called from client-side scene code.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  for (const [offset, color] of stops) g.addColorStop(offset, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  _cache.set(key, tex);
  return tex;
}
