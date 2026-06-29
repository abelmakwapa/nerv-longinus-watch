// filepath: src/components/ui/ClassificationBadge.tsx
/**
 * Classification security badge component.
 * Displays NERV security classification level.
 * Hard corners — no border-radius. Institutional, not friendly.
 */

import { cn } from "@/lib/utils/cn";

type ClassificationLevel = "UNCLASSIFIED" | "CONFIDENTIAL" | "SECRET" | "TOP_SECRET";

interface ClassificationBadgeProps {
  level: ClassificationLevel;
  className?: string;
}

const BADGE_STYLES: Record<ClassificationLevel, string> = {
  UNCLASSIFIED: "bg-shadow-grid text-classified-grey border-classified-grey/40",
  CONFIDENTIAL: "bg-[#003366]/60 text-[#6699CC] border-[#336699]/50",
  SECRET: "bg-nerv-orange-dim/20 text-nerv-orange-dim border-nerv-orange-dim/50",
  TOP_SECRET: "bg-bloodwarn-mid/20 text-bloodwarn-text border-bloodwarn-mid/60",
};

const BADGE_LABELS: Record<ClassificationLevel, string> = {
  UNCLASSIFIED: "UNCLASSIFIED",
  CONFIDENTIAL: "CONFIDENTIAL",
  SECRET: "SECRET",
  TOP_SECRET: "TOP SECRET",
};

export function ClassificationBadge({
  level,
  className,
}: ClassificationBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-[0.2em]",
        "border font-body",
        BADGE_STYLES[level],
        className
      )}
    >
      {BADGE_LABELS[level]}
    </span>
  );
}
