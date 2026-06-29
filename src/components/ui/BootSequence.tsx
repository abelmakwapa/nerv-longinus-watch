// filepath: src/components/ui/BootSequence.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const BOOT_LINES = [
  { text: "NERV CENTRAL COMPUTER // MAGI SYSTEM ARRAY", delay: 0 },
  { text: "INITIALIZING SECURITY CLEARANCE — LEVEL: TOP SECRET", delay: 120 },
  { text: "LOADING ORBITAL MECHANICS DATABASE...", delay: 260 },
  { text: "NEOWS FEED: CONNECTING TO NASA JPL API...", delay: 400 },
  { text: "MAGI-01 CASPER [SCIENTIST] — ONLINE", delay: 600 },
  { text: "MAGI-02 BALTHASAR [MOTHER] — ONLINE", delay: 760 },
  { text: "MAGI-03 MELCHIOR [WOMAN] — ONLINE", delay: 920 },
  { text: "THREAT ASSESSMENT ENGINE — LOADED", delay: 1060 },
  { text: "ANGEL APPROACH SURVEILLANCE — ARMED", delay: 1180 },
  { text: "LONGINUS WATCH — SYSTEM READY", delay: 1340 },
  { text: "OPERATOR: LONGINUS-7 // CLEARANCE VERIFIED", delay: 1460 },
  { text: "COMMENCING DEEP SPACE SCAN...", delay: 1600 },
];

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "logo" | "dismiss">("logo");

  // Logo reveal → boot text → complete
  useEffect(() => {
    const logoTimer = setTimeout(() => setPhase("boot"), 600);
    return () => clearTimeout(logoTimer);
  }, []);

  // Add boot lines sequentially
  useEffect(() => {
    if (phase !== "boot") return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, i]);
          setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        }, line.delay)
      );
    });

    // Trigger dismiss after last line + short pause
    timers.push(
      setTimeout(() => {
        setPhase("dismiss");
        setTimeout(onComplete, 500);
      }, BOOT_LINES[BOOT_LINES.length - 1].delay + 700)
    );

    return () => timers.forEach(clearTimeout);
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== "dismiss" && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-void-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.35) 1px, rgba(0,0,0,0.35) 2px)",
            }}
          />

          {/* CRT vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)",
            }}
          />

          {/* NERV Logo + Title */}
          <motion.div
            className="flex flex-col items-center gap-6 mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Large NERV Logo SVG */}
            <motion.div
              className="relative"
              animate={{ filter: ["drop-shadow(0 0 8px #FF6600)", "drop-shadow(0 0 20px #FF6600)", "drop-shadow(0 0 8px #FF6600)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="38" fill="none" stroke="#FF6600" strokeWidth="2" opacity="0.7" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#FF6600" strokeWidth="1" opacity="0.3" />
                <path d="M 40,2 A 38,38 0 0,0 40,78 Z" fill="#FF6600" opacity="0.9" />
                <path d="M 40,2 A 38,38 0 0,1 40,78 Z" fill="#060A0F" />
                <line x1="40" y1="2" x2="40" y2="78" stroke="#FF6600" strokeWidth="1.5" />
                <ellipse cx="40" cy="40" rx="10" ry="22" fill="none" stroke="#FF6600" strokeWidth="1" opacity="0.5" />
                {/* Tick marks */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1={40 + 36 * Math.cos((deg * Math.PI) / 180)}
                    y1={40 + 36 * Math.sin((deg * Math.PI) / 180)}
                    x2={40 + 32 * Math.cos((deg * Math.PI) / 180)}
                    y2={40 + 32 * Math.sin((deg * Math.PI) / 180)}
                    stroke="#FF6600"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                ))}
              </svg>
            </motion.div>

            <div className="text-center">
              <motion.div
                className="font-display text-nerv-orange text-3xl tracking-[0.5em] mb-1"
                style={{ textShadow: "0 0 20px rgba(255, 102, 0, 0.6)" }}
                initial={{ opacity: 0, letterSpacing: "0.8em" }}
                animate={{ opacity: 1, letterSpacing: "0.5em" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                NERV
              </motion.div>
              <motion.div
                className="font-body text-amber-dim text-[10px] tracking-[0.3em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                GOD'S IN HIS HEAVEN, ALL'S RIGHT WITH THE WORLD
              </motion.div>
            </div>
          </motion.div>

          {/* Boot text terminal */}
          <AnimatePresence>
            {phase === "boot" && (
              <motion.div
                className="w-full max-w-xl px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Terminal window */}
                <div
                  className="border border-phosphor-dim/30 bg-void-black p-4"
                  style={{ boxShadow: "0 0 30px rgba(0, 255, 65, 0.05), inset 0 0 20px rgba(0, 255, 65, 0.02)" }}
                >
                  <div className="font-body text-[9px] text-classified-grey tracking-[0.15em] mb-3 pb-2 border-b border-shadow-grid">
                    SYSTEM INITIALIZATION // LONGINUS WATCH v1.0.0
                  </div>

                  <div className="space-y-0.5 min-h-[160px]">
                    {BOOT_LINES.map((line, i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          "terminal-text text-[11px] leading-relaxed",
                          visibleLines.includes(i)
                            ? i === BOOT_LINES.length - 1
                              ? "text-nerv-orange"
                              : i >= BOOT_LINES.length - 3
                              ? "text-phosphor"
                              : "text-phosphor-dim"
                            : "opacity-0"
                        )}
                        initial={{ opacity: 0, x: -6 }}
                        animate={
                          visibleLines.includes(i)
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: -6 }
                        }
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        <span className="text-phosphor-dim opacity-50 mr-2">&gt;</span>
                        {line.text}
                        {i === visibleLines[visibleLines.length - 1] && (
                          <span className="inline-block w-2 h-3 bg-phosphor ml-1 animate-cursor-blink align-middle" />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 pt-3 border-t border-shadow-grid">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-body text-[9px] text-classified-grey tracking-[0.1em]">
                        SYSTEM LOAD
                      </span>
                      <span className="terminal-text text-[11px] text-phosphor">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1 bg-shadow-grid relative overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-phosphor"
                        style={{ boxShadow: "0 0 8px #00FF41" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Classification footer */}
          <motion.div
            className="absolute bottom-6 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="classification-stamp text-classified-grey/40">
              TOP SECRET // NERV SPECIAL AGENCY // UNAUTHORIZED ACCESS PROHIBITED
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
