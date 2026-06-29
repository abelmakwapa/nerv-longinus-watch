// filepath: tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── NERV FOUNDATION ─────────────────────────────────────────
        "void-black": "#020304",
        "terminal-black": "#060A0F",
        "deep-station": "#0A0E14",
        "shadow-grid": "#0F1520",
        "nerv-black": "#111820",
        "panel-bg": "#080C12",

        // ── NERV ORANGE FAMILY ───────────────────────────────────────
        "nerv-orange": "#FF6600",
        "nerv-orange-bright": "#FF8C1A",
        "nerv-orange-dim": "#CC5200",
        "nerv-orange-text": "#FFB347",

        // ── BLOODWARN RED ────────────────────────────────────────────
        "bloodwarn": "#CC0000",
        "bloodwarn-bright": "#FF1111",
        "bloodwarn-mid": "#990000",
        "bloodwarn-text": "#FF4444",
        "bloodwarn-deep": "#440000",

        // ── AMBER DATA ───────────────────────────────────────────────
        "amber-core": "#FFB000",
        "amber-bright": "#FFCC33",
        "amber-warm": "#E89020",
        "amber-dim": "#997700",
        "amber-deep": "#331F00",

        // ── PHOSPHOR GREEN ───────────────────────────────────────────
        "phosphor": "#00FF41",
        "phosphor-bright": "#33FF66",
        "phosphor-mid": "#00CC33",
        "phosphor-dim": "#006614",
        "phosphor-deep": "#002208",
        "p31": "#39FF7E",

        // ── PATTERN BLUE (Angel-class threat) ───────────────────────
        "pattern-blue": "#0044FF",
        "pattern-blue-bright": "#3366FF",
        "pattern-blue-mid": "#0033CC",
        "pattern-blue-dim": "#001166",
        "pattern-blue-glow": "#4488FF",

        // ── HOLOGRAPHIC ──────────────────────────────────────────────
        "holo-cyan": "#00FFFF",
        "holo-cyan-dim": "#006666",
        "holo-blue": "#0088CC",

        // ── SPECIAL ──────────────────────────────────────────────────
        "threat-unknown": "#9933CC",
        "magi-white": "#E8F0F8",
        "classified-grey": "#4A5566",
        "inactive-state": "#2A3040",
        "ui-border": "#1A2535",
        "ui-border-active": "#2A3F5A",
        "data-positive": "#00CC33",
        "data-negative": "#FF2200",
        "static-white": "#CCDDEE",
      },

      fontFamily: {
        display: ["var(--font-share-tech)", "system-ui", "sans-serif"],
        mono: ["var(--font-vt323)", "Courier New", "monospace"],
        body: ["var(--font-share-tech-mono)", "Courier New", "monospace"],
      },

      keyframes: {
        // ── EXISTING ────────────────────────────────────────────────
        "critical-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.1" },
        },
        "pattern-blue-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "scanline-drift": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 4px" },
        },
        "data-flash": {
          "0%": { color: "#FFCC33", textShadow: "0 0 12px #FFCC33" },
          "100%": { color: "inherit", textShadow: "none" },
        },
        "neon-pulse": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        "type-in": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "slide-down": {
          from: { transform: "translateY(-100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "border-pulse": {
          "0%, 100%": { borderColor: "rgba(204, 0, 0, 0.5)" },
          "50%": { borderColor: "rgba(255, 17, 17, 1)" },
        },
        "gauge-settle": {
          "0%": { transform: "rotate(var(--gauge-start))" },
          "70%": { transform: "rotate(calc(var(--gauge-end) + 3deg))" },
          "85%": { transform: "rotate(calc(var(--gauge-end) - 1deg))" },
          "100%": { transform: "rotate(var(--gauge-end))" },
        },

        // ── NEW ANIMATIONS ───────────────────────────────────────────
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "41%": { opacity: "1" },
          "42%": { opacity: "0.6" },
          "43%": { opacity: "1" },
          "60%": { opacity: "1" },
          "61%": { opacity: "0.4" },
          "62%": { opacity: "1" },
        },
        "screen-flicker": {
          "0%, 95%, 100%": { opacity: "1" },
          "96%": { opacity: "0.92" },
          "97%": { opacity: "1" },
          "98%": { opacity: "0.85" },
          "99%": { opacity: "1" },
        },
        "phosphor-decay": {
          "0%": { opacity: "1", filter: "brightness(1.4) blur(0px)" },
          "100%": { opacity: "0", filter: "brightness(0.6) blur(2px)" },
        },
        "grain-shift": {
          "0%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -3%)" },
          "20%": { transform: "translate(1%, 2%)" },
          "30%": { transform: "translate(3%, -1%)" },
          "40%": { transform: "translate(-1%, 3%)" },
          "50%": { transform: "translate(2%, -2%)" },
          "60%": { transform: "translate(-3%, 1%)" },
          "70%": { transform: "translate(1%, -3%)" },
          "80%": { transform: "translate(-2%, 2%)" },
          "90%": { transform: "translate(3%, 0%)" },
          "100%": { transform: "translate(0, 0)" },
        },
        "sweep-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "alert-flash": {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(204, 0, 0, 0.06)" },
        },
        "pattern-blue-flash": {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(0, 68, 255, 0.04)" },
        },
        "data-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "boot-type": {
          "0%": { opacity: "0", transform: "translateX(-4px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "corner-expand": {
          "0%": { width: "0", height: "0" },
          "100%": { width: "12px", height: "12px" },
        },
        "status-ping": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "75%, 100%": { transform: "scale(1.8)", opacity: "0" },
        },
        "threat-escalate": {
          "0%": { transform: "scaleX(0)", opacity: "0" },
          "100%": { transform: "scaleX(1)", opacity: "1" },
        },
        "holo-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "waveform": {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        "interference": {
          "0%, 100%": { backgroundPosition: "0 0", opacity: "0.3" },
          "50%": { backgroundPosition: "4px 2px", opacity: "0.15" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "targeting": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.95)" },
        },
        "text-glitch": {
          "0%, 100%": { textShadow: "none", transform: "none" },
          "33%": {
            textShadow: "-2px 0 #FF1111, 2px 0 #00FF41",
            transform: "skewX(-0.5deg)",
          },
          "66%": {
            textShadow: "2px 0 #FF1111, -2px 0 #00FF41",
            transform: "skewX(0.5deg)",
          },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width, 100%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
      },

      animation: {
        // existing
        "critical-blink": "critical-blink 1.6s steps(1, end) infinite",
        "pattern-blue-pulse": "pattern-blue-pulse 0.8s ease-in-out infinite",
        "cursor-blink": "cursor-blink 1s steps(1, end) infinite",
        "scanline-drift": "scanline-drift 8s linear infinite",
        "data-flash": "data-flash 0.4s ease-out forwards",
        "neon-pulse": "neon-pulse 3s ease-in-out infinite",
        "slide-down": "slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "border-pulse": "border-pulse 1.5s ease-in-out infinite",
        // new
        "flicker": "flicker 8s linear infinite",
        "screen-flicker": "screen-flicker 12s linear infinite",
        "grain-shift": "grain-shift 0.4s steps(1) infinite",
        "sweep-rotate": "sweep-rotate 4s linear infinite",
        "alert-flash": "alert-flash 1.2s ease-in-out infinite",
        "pattern-blue-flash": "pattern-blue-flash 0.8s ease-in-out infinite",
        "data-scroll": "data-scroll 20s linear infinite",
        "holo-shimmer": "holo-shimmer 3s linear infinite",
        "waveform": "waveform 0.8s ease-in-out infinite",
        "interference": "interference 4s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "targeting": "targeting 2s ease-in-out infinite",
        "text-glitch": "text-glitch 6s steps(1, end) infinite",
        "status-ping": "status-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "spin-reverse": "spin-reverse 6s linear infinite",
      },

      boxShadow: {
        "nerv-orange": "0 0 8px rgba(255, 102, 0, 0.5), 0 0 16px rgba(255, 102, 0, 0.2)",
        "nerv-orange-lg": "0 0 16px rgba(255, 102, 0, 0.6), 0 0 32px rgba(255, 102, 0, 0.3), 0 0 64px rgba(255, 102, 0, 0.1)",
        "bloodwarn": "0 0 12px rgba(204, 0, 0, 0.6), 0 0 24px rgba(204, 0, 0, 0.3)",
        "bloodwarn-lg": "0 0 20px rgba(204, 0, 0, 0.8), 0 0 40px rgba(204, 0, 0, 0.4), 0 0 80px rgba(204, 0, 0, 0.1)",
        "phosphor": "0 0 8px rgba(0, 255, 65, 0.5), 0 0 16px rgba(0, 255, 65, 0.2)",
        "phosphor-lg": "0 0 16px rgba(0, 255, 65, 0.6), 0 0 32px rgba(0, 255, 65, 0.2)",
        "amber": "0 0 8px rgba(255, 176, 0, 0.4), 0 0 16px rgba(255, 176, 0, 0.15)",
        "amber-lg": "0 0 16px rgba(255, 176, 0, 0.5), 0 0 32px rgba(255, 176, 0, 0.2)",
        "pattern-blue": "0 0 12px rgba(0, 68, 255, 0.6), 0 0 24px rgba(0, 68, 255, 0.3)",
        "pattern-blue-lg": "0 0 20px rgba(0, 68, 255, 0.8), 0 0 40px rgba(68, 136, 255, 0.4)",
        "holo": "0 0 20px rgba(0, 255, 255, 0.15), inset 0 0 20px rgba(0, 255, 255, 0.03)",
        "inset-phosphor": "inset 0 0 20px rgba(0, 255, 65, 0.03)",
        "inset-amber": "inset 0 0 20px rgba(255, 176, 0, 0.03)",
        "inset-red": "inset 0 0 30px rgba(204, 0, 0, 0.08)",
        "panel": "0 0 0 1px rgba(255, 102, 0, 0.1), 0 4px 24px rgba(0, 0, 0, 0.6)",
        "dossier": "−20px 0 60px rgba(0, 0, 0, 0.8), -1px 0 0 rgba(255, 102, 0, 0.3)",
      },

      backdropBlur: {
        xs: "2px",
      },

      backgroundImage: {
        "grid-nerv": "linear-gradient(rgba(15, 21, 32, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 21, 32, 0.8) 1px, transparent 1px)",
        "grid-fine": "linear-gradient(rgba(26, 37, 53, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 37, 53, 0.6) 1px, transparent 1px)",
        "holo-gradient": "linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.05), transparent)",
        "warning-stripe": "repeating-linear-gradient(45deg, rgba(255, 176, 0, 0.12) 0px, rgba(255, 176, 0, 0.12) 8px, transparent 8px, transparent 18px)",
        "danger-stripe": "repeating-linear-gradient(45deg, rgba(204, 0, 0, 0.15) 0px, rgba(204, 0, 0, 0.15) 8px, transparent 8px, transparent 18px)",
        "scan-overlay": "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 0, 0, 0.3) 1px, rgba(0, 0, 0, 0.3) 2px)",
      },

      backgroundSize: {
        "grid-40": "40px 40px",
        "grid-20": "20px 20px",
        "grid-10": "10px 10px",
      },
    },
  },
  plugins: [],
};

export default config;
