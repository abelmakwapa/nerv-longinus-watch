// filepath: src/components/ui/TerminalLine.tsx
/**
 * Terminal line component — simulates VT100 terminal output.
 * Used throughout the interface for system messages and readouts.
 */

import { cn } from "@/lib/utils/cn";

type LinePrefix = "SYS" | "MAGI" | "ERR" | "OPR" | "???";

interface TerminalLineProps {
  prefix?: LinePrefix;
  text: string;
  className?: string;
  dim?: boolean;
}

const PREFIX_COLORS: Record<LinePrefix, string> = {
  SYS: "text-phosphor-mid",
  MAGI: "text-p31",
  ERR: "text-bloodwarn-text",
  OPR: "text-amber-bright",
  "???": "text-threat-unknown",
};

export function TerminalLine({
  prefix = "SYS",
  text,
  className,
  dim = false,
}: TerminalLineProps) {
  return (
    <div
      className={cn(
        "flex gap-2 terminal-text text-[13px] leading-relaxed",
        dim && "opacity-40",
        className
      )}
    >
      <span className={cn("shrink-0 font-bold", PREFIX_COLORS[prefix])}>
        {prefix} &gt;
      </span>
      <span className="text-phosphor-mid">{text}</span>
    </div>
  );
}
