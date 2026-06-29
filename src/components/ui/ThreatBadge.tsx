// filepath: src/components/ui/ThreatBadge.tsx
/**
 * Threat tier badge — color-coded threat classification display.
 * Used inline in data tables and cards.
 */

import { cn } from "@/lib/utils/cn";
import { formatThreatTier, getTierColorClass, getTierBorderClass } from "@/lib/utils/format";
import type { ThreatTier } from "@/types/asteroid.types";

interface ThreatBadgeProps {
  tier: ThreatTier;
  className?: string;
  animate?: boolean;
}

export function ThreatBadge({ tier, className, animate = false }: ThreatBadgeProps) {
  const shouldAnimate = animate && (tier === "PRIORITY_RED" || tier === "PATTERN_BLUE");

  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-[10px] font-bold tracking-[0.15em]",
        "border font-display",
        getTierColorClass(tier),
        getTierBorderClass(tier),
        shouldAnimate && tier === "PRIORITY_RED" && "animate-critical-blink",
        shouldAnimate && tier === "PATTERN_BLUE" && "animate-pattern-blue-pulse",
        className
      )}
    >
      {formatThreatTier(tier)}
    </span>
  );
}
