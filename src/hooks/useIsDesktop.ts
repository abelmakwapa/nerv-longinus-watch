// filepath: src/hooks/useIsDesktop.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the viewport is at the `lg` breakpoint or wider.
 *
 * Defaults to `true` so SSR + first client render agree (desktop-first, no
 * hydration mismatch); the real value is applied after mount. Used to mount
 * EITHER the desktop hero OR the mobile shell — never both — so only a single
 * WebGL canvas is ever alive.
 */
export function useIsDesktop(query = "(min-width: 1024px)"): boolean {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return isDesktop;
}
