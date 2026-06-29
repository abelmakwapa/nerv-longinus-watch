// filepath: src/components/ui/EasterEggManager.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { soundEngine } from "@/lib/sound/SoundEngine";

// ── KONAMI CODE ─────────────────────────────────────────────────────────────────
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

// ── SECRET WORD TRIGGERS ─────────────────────────────────────────────────────────
const WORD_TRIGGERS: Record<string, string> = {
  "adam": "ADAM",
  "lilith": "LILITH",
  "rei": "REI",
  "gendo": "GENDO",
  "yui": "YUI",
  "seele": "SEELE",
  "evangelion": "EVANGELION",
  "instrumentality": "INSTRUMENTALITY",
  "nerv": "NERV_LOGO",
};

// ── EASTER EGG CONTENT ──────────────────────────────────────────────────────────

const EGG_CONTENT = {
  KONAMI: {
    title: "SCENARIO UNIT-13 // ACTIVATION PROTOCOL",
    classification: "SEELE EYES ONLY",
    lines: [
      "SCENARIO DOCUMENT 01-F",
      "AUTHORIZED PERSONNEL: CHAIRMAN KEEL",
      "",
      "THE HUMAN INSTRUMENTALITY PROJECT",
      "PHASE IV: CONTACT EXPERIMENT INITIATION",
      "",
      "EVANGELION UNIT-13 IS AUTHORIZED TO",
      "ENGAGE CLASSIFIED TARGET AT THIRD IMPACT",
      "COORDINATES: CLASSIFIED // TERMINAL DOGMA",
      "",
      "ALL PERSONNEL NOT ASSIGNED TO INSTRUMENTALITY",
      "ARE TO BE EVACUATED FROM GEOFRONT.",
      "",
      "GOD IS DEAD. LONG LIVE HUMANITY.",
      "",
      "END SCENARIO DOCUMENT 01-F",
    ],
    color: "#9933CC",
    bgColor: "rgba(40, 0, 60, 0.97)",
  },
  ADAM: {
    title: "CLASSIFIED SPECIMEN: ADAM",
    classification: "GEHIRN LEVEL 6",
    lines: [
      "SPECIMEN DESIGNATION: ADAM",
      "FIRST ANGEL // PROGENITOR",
      "STATUS: EMBRYONIC CONTAINMENT",
      "",
      "LOCATION: TERMINAL DOGMA // LEVEL B-7",
      "CONTAINMENT STATUS: SECURE",
      "SOUL INTEGRATION: COMPLETE",
      "",
      "NOTE: CONTACT WITH SPECIMEN ADAM",
      "WILL TRIGGER THIRD IMPACT.",
      "DO NOT APPROACH.",
      "DO NOT LOOK DIRECTLY AT SPECIMEN.",
      "DO NOT THINK ABOUT SPECIMEN.",
      "",
      "WE ARE ALL LILLITH'S CHILDREN.",
    ],
    color: "#FF6600",
    bgColor: "rgba(20, 8, 0, 0.97)",
  },
  LILITH: {
    title: "PROGENITOR: LILLITH",
    classification: "DEAD SEA SCROLLS — RESTRICTED",
    lines: [
      "DESIGNATION: SECOND ANGEL",
      "FIRST ANCESTRAL RACE EMISSARY",
      "STATUS: CRUCIFORM CONTAINMENT // LEVEL B-7",
      "",
      "ALL LIFE ON EARTH ORIGINATED FROM",
      "THIS SPECIMEN'S GENETIC MATERIAL.",
      "HUMANITY IS LILLITH'S CHILDREN.",
      "ANGELS ARE ADAM'S CHILDREN.",
      "",
      "THE LANCE OF LONGINUS MAINTAINS",
      "CONTAINMENT AT 97.3% INTEGRITY.",
      "",
      "SOUL CONTAINMENT STATUS: 97.3%",
      "REMAINING 2.7% IS... PERSONAL.",
    ],
    color: "#4488FF",
    bgColor: "rgba(0, 4, 20, 0.97)",
  },
  REI: {
    title: "PILOT // FIRST CHILD",
    classification: "PERSONAL LOG — AYANAMI, REI",
    lines: [
      "> I AM NOT AFRAID TO DIE.",
      "> I AM AFRAID OF BEING REPLACED.",
      "> ...",
      "> I EXIST BECAUSE THERE ARE PEOPLE",
      "> WHO NEED ME TO EXIST.",
      "> THE COMMANDER NEEDS ME.",
      "> ...",
      "> WHAT IS THAT WARMTH?",
      "> WHERE DID IT COME FROM?",
      "> ...",
      "> PERHAPS I DO HAVE A HEART.",
      "> PERHAPS I AM... HUMAN.",
    ],
    color: "#4488FF",
    bgColor: "rgba(0, 2, 10, 0.97)",
  },
  GENDO: {
    title: "COMMANDER'S LOG — CLASSIFIED",
    classification: "IKARI, GENDO // PERSONAL",
    lines: [
      "THE INSTRUMENTALITY PROJECT PROCEEDS",
      "AS PLANNED. THE COMMITTEE SUSPECTS",
      "NOTHING. YUI WOULD HAVE APPROVED.",
      "",
      "SHINJI IS... NOT READY.",
      "HE WILL NEVER BE READY.",
      "I WILL MAKE HIM READY.",
      "HE DOES NOT HAVE TO LIKE ME",
      "TO PILOT THE EVA.",
      "",
      "NERV POSSESSES TWO OF THE THREE",
      "ELEMENTS REQUIRED FOR CONTACT.",
      "THE THIRD APPROACHES.",
      "",
      "EVERYTHING IS PROCEEDING",
      "ACCORDING TO THE SCENARIO.",
    ],
    color: "#FF6600",
    bgColor: "rgba(10, 5, 0, 0.97)",
  },
  YUI: {
    title: "IKARI, YUI // SOUL RECORD",
    classification: "SOUL CONTAINMENT LOG",
    lines: [
      "I CHOSE THIS.",
      "I CHOSE TO BECOME PART OF UNIT-01.",
      "",
      "AS LONG AS A SINGLE PERSON",
      "LIVES ON THIS EARTH —",
      "AS LONG AS SOMEONE REMEMBERS ME —",
      "I WILL EXIST.",
      "",
      "EVANGELION UNIT-01 WILL STAND",
      "AS PROOF THAT HUMANITY ONCE EXISTED.",
      "",
      "EVEN IF THE HUMAN RACE PERISHES,",
      "EVEN IF THE SOLAR SYSTEM ENDS,",
      "AS LONG AS THIS EVA REMAINS —",
      "HUMANITY WILL REMAIN.",
      "",
      "TAKE CARE OF YOURSELF, SHINJI.",
    ],
    color: "#FFB000",
    bgColor: "rgba(15, 8, 0, 0.97)",
  },
  SEELE: {
    title: "SEELE // HUMAN INSTRUMENTALITY COMMITTEE",
    classification: "SEELE EYES ONLY — ALL COPIES DESTROY AFTER READING",
    lines: [
      "SEELE 01 — SOUND ONLY",
      "SEELE 02 — SOUND ONLY",
      "SEELE 03 — SOUND ONLY",
      "// ... //",
      "SEELE 12 — SOUND ONLY",
      "",
      "THE SCENARIO HAS BEEN COMPROMISED.",
      "NERV DEVIATES FROM THE DEAD SEA SCROLLS.",
      "THE COMMANDER PURSUES HIS OWN AGENDA.",
      "",
      "INITIATE FORCE MAJEURE.",
      "JAPAN STRATEGIC SELF-DEFENSE FORCE:",
      "AUTHORIZED.",
      "",
      "THE HUMAN RACE HAS RUN ITS COURSE.",
      "THE NEW CENTURY BELONGS TO A",
      "SPECIES OF HIGHER CONSCIOUSNESS.",
    ],
    color: "#9933CC",
    bgColor: "rgba(10, 0, 15, 0.97)",
  },
  EVANGELION: {
    title: "PROJECT EVANGELION // OVERVIEW",
    classification: "NERV INTERNAL — LEVEL 5",
    lines: [
      "THE EVANGELION UNITS ARE NOT ROBOTS.",
      "THEY ARE LIVING ORGANISMS —",
      "BEINGS OF DIVINE ORIGIN,",
      "CLAD IN ARMOR TO RESTRAIN THEM.",
      "",
      "EACH UNIT CONTAINS A HUMAN SOUL:",
      "UNIT-00: AYANAMI REI (CLONE)",
      "UNIT-01: IKARI YUI",
      "UNIT-02: SORYU KYOKO ZEPPELIN",
      "UNIT-13: CLASSIFIED",
      "",
      "THE ARMOR IS NOT TO PROTECT",
      "THE PILOT FROM THE ANGEL.",
      "THE ARMOR IS TO PROTECT",
      "THE WORLD FROM THE EVA.",
    ],
    color: "#FF6600",
    bgColor: "rgba(10, 5, 0, 0.97)",
  },
  INSTRUMENTALITY: {
    title: "THIRD IMPACT — HUMAN INSTRUMENTALITY",
    classification: "POST-SCENARIO CLASSIFICATION: OMEGA",
    lines: [
      "THE HUMAN INSTRUMENTALITY PROJECT",
      "COMPLETES THE CYCLE OF EVOLUTION:",
      "",
      "INDIVIDUAL SOULS → COLLECTIVE CONSCIOUSNESS",
      "SEPARATE IDENTITY → UNIFIED BEING",
      "PHYSICAL FORM → PURE INFORMATION",
      "",
      "IN THE END, ALL SOULS WILL RETURN",
      "TO LILLITH. ALL WILL BECOME ONE.",
      "THERE WILL BE NO MORE PAIN.",
      "NO MORE LONELINESS.",
      "NO MORE AT FIELD BARRIERS",
      "SEPARATING HUMAN FROM HUMAN.",
      "",
      "IS THIS SALVATION?",
      "IS THIS DEATH?",
      "PERHAPS THEY ARE THE SAME THING.",
    ],
    color: "#4488FF",
    bgColor: "rgba(0, 0, 15, 0.97)",
  },
  NERV_LOGO: {
    title: "NERV // SPECIAL OPERATIONS AGENCY",
    classification: "PUBLIC RELATIONS DOCUMENT — FALSE COVER STORY",
    lines: [
      "NERV (ネルフ) IS A FICTIONAL PARAMILITARY",
      "ORGANIZATION FROM THE 1995 ANIME SERIES",
      "NEON GENESIS EVANGELION BY HIDEAKI ANNO.",
      "",
      "LONGINUS WATCH IS AN UNOFFICIAL FAN PROJECT.",
      "THIS IS NOT REAL.",
      "THE ASTEROIDS ARE REAL.",
      "THE PROBABILITY OF IMPACT IS REAL.",
      "",
      "NASA NEOWS API DATA: GENUINE",
      "MAGI ANALYSIS: SYNTHETIC",
      "THREAT ASSESSMENTS: APPROXIMATE",
      "ANGEL CODENAMES: FICTIONAL",
      "",
      "DATA SOURCE: api.nasa.gov",
      "BUILT WITH: NEXT.JS 15 + REACT 19",
      "",
      "THIS MESSAGE WILL SELF-DESTRUCT.",
      "IT WILL NOT.",
    ],
    color: "#FF6600",
    bgColor: "rgba(6, 10, 15, 0.97)",
  },
} as const;

// ── COMPONENT ───────────────────────────────────────────────────────────────────

type EggKey = keyof typeof EGG_CONTENT | null;

export function EasterEggManager() {
  const [activeEgg, setActiveEgg] = useState<EggKey>(null);
  const inputBuffer = useRef<string[]>([]);
  const konamiBuffer = useRef<string[]>([]);

  const closeEgg = useCallback(() => {
    setActiveEgg(null);
    soundEngine?.play("ui_close");
  }, []);

  const triggerEgg = useCallback((key: EggKey) => {
    if (!key) return;
    setActiveEgg(key);
    if (key === "KONAMI") soundEngine?.play("konami");
    else if (key === "INSTRUMENTALITY") soundEngine?.play("second_impact");
    else soundEngine?.play("easter_egg");
    inputBuffer.current = [];
    konamiBuffer.current = [];
  }, []);

  useEffect(() => {
    // Console easter egg — logged once on mount
    console.log(
      "%c\n  NERV DEEP SPACE DEFENSE GRID\n  LONGINUS WATCH v1.0.0\n  ANGEL APPROACH SYSTEM\n\n  %cCLASSIFICATION: TOP SECRET // GEHIRN EYES ONLY\n\n  %cBUILT WITH: Next.js 15 · React 19 · TypeScript\n  DATA SOURCE: NASA NeoWs API\n  MAGI NETWORK: NOMINAL\n\n  %cGOD IS IN HIS HEAVEN. ALL IS RIGHT WITH THE WORLD.\n",
      "color: #FF6600; font-size: 14px; font-family: monospace; font-weight: bold;",
      "color: #CC0000; font-size: 11px; font-family: monospace;",
      "color: #4A5566; font-size: 10px; font-family: monospace;",
      "color: #006614; font-size: 10px; font-family: monospace; font-style: italic;"
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      // ── KONAMI CODE ─────────────────────────────────────────────────────────
      konamiBuffer.current.push(e.key);
      if (konamiBuffer.current.length > KONAMI.length) {
        konamiBuffer.current.shift();
      }
      if (konamiBuffer.current.join(",") === KONAMI.join(",")) {
        triggerEgg("KONAMI");
        return;
      }

      // ── WORD TRIGGERS ────────────────────────────────────────────────────────
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        inputBuffer.current.push(e.key.toLowerCase());
        if (inputBuffer.current.length > 20) inputBuffer.current.shift();

        const typed = inputBuffer.current.join("");
        for (const [word, eggKey] of Object.entries(WORD_TRIGGERS)) {
          if (typed.endsWith(word)) {
            triggerEgg(eggKey as EggKey);
            return;
          }
        }
      }

      // ── ESC TO CLOSE ─────────────────────────────────────────────────────────
      if (e.key === "Escape" && activeEgg) {
        closeEgg();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeEgg, triggerEgg, closeEgg]);

  const egg = activeEgg ? EGG_CONTENT[activeEgg] : null;

  return (
    <AnimatePresence>
      {egg && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9990] bg-void-black/80 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEgg}
          />

          {/* Content panel */}
          <motion.div
            className="fixed inset-0 z-[9991] flex items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative max-w-lg w-full"
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              style={{
                background: egg.bgColor,
                border: `1px solid ${egg.color}30`,
                boxShadow: `0 0 60px ${egg.color}20, 0 0 120px ${egg.color}08`,
              }}
            >
              {/* Scanlines */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
                }}
              />

              {/* Header */}
              <div
                className="relative px-5 py-3 border-b"
                style={{ borderColor: `${egg.color}25` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className="font-display text-[9px] tracking-[0.2em] mb-0.5"
                      style={{ color: `${egg.color}80` }}
                    >
                      {egg.classification}
                    </div>
                    <div
                      className="font-display text-[13px] tracking-[0.12em]"
                      style={{ color: egg.color }}
                    >
                      {egg.title}
                    </div>
                  </div>
                  <button
                    onClick={closeEgg}
                    className="font-display text-[11px] tracking-widest transition-opacity opacity-50 hover:opacity-100"
                    style={{ color: egg.color }}
                  >
                    ✕
                  </button>
                </div>

                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${egg.color}80, transparent)`,
                  }}
                />
              </div>

              {/* Body */}
              <div className="relative px-5 py-4 space-y-0.5 max-h-80 overflow-y-auto">
                {egg.lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.15 }}
                  >
                    {line === "" ? (
                      <div className="h-2" />
                    ) : (
                      <div
                        className="terminal-text text-[12px] leading-relaxed"
                        style={{
                          color: line.startsWith(">")
                            ? egg.color
                            : `${egg.color}90`,
                        }}
                      >
                        {line}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="relative px-5 py-2.5 border-t flex items-center justify-between"
                style={{ borderColor: `${egg.color}15` }}
              >
                <span
                  className="font-body text-[8px] tracking-[0.1em]"
                  style={{ color: `${egg.color}40` }}
                >
                  PRESS ESC OR CLICK OUTSIDE TO DISMISS
                </span>
                <span
                  className="font-body text-[8px] tracking-[0.06em]"
                  style={{ color: `${egg.color}30` }}
                >
                  NERV // LONGINUS WATCH
                </span>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
