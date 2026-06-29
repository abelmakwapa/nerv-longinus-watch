// filepath: src/components/ui/CornerBrackets.tsx
"use client";

import { cn } from "@/lib/utils/cn";

interface CornerBracketsProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  thickness?: number;
  className?: string;
  glow?: boolean;
  animated?: boolean;
}

export function CornerBrackets({
  children,
  color = "rgba(255, 102, 0, 0.6)",
  size = 10,
  thickness = 1,
  className,
  glow = false,
  animated = false,
}: CornerBracketsProps) {
  const style = {
    "--cb-color": color,
    "--cb-size": `${size}px`,
    "--cb-thick": `${thickness}px`,
  } as React.CSSProperties;

  const cornerStyle = (pos: "tl" | "tr" | "bl" | "br") => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: size,
      height: size,
      pointerEvents: "none",
    };
    const borders = {
      tl: { top: 0, left: 0, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` },
      tr: { top: 0, right: 0, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` },
      bl: { bottom: 0, left: 0, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` },
      br: { bottom: 0, right: 0, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` },
    };
    return { ...base, ...borders[pos] };
  };

  const glowFilter = glow
    ? { filter: `drop-shadow(0 0 4px ${color})` }
    : undefined;

  return (
    <div
      className={cn("relative", animated && "group", className)}
      style={style}
    >
      {/* Top-left */}
      <div
        style={{
          ...cornerStyle("tl"),
          ...glowFilter,
          transition: animated ? "width 0.3s, height 0.3s" : undefined,
        }}
      />
      {/* Top-right */}
      <div style={{ ...cornerStyle("tr"), ...glowFilter }} />
      {/* Bottom-left */}
      <div style={{ ...cornerStyle("bl"), ...glowFilter }} />
      {/* Bottom-right */}
      <div style={{ ...cornerStyle("br"), ...glowFilter }} />

      {children}
    </div>
  );
}
