// filepath: src/components/ui/KeyboardShortcuts.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHORTCUTS = [
  { key: "?", action: "Toggle this help panel" },
  { key: "Esc", action: "Close dossier / dismiss overlay" },
  { key: "↑↑↓↓←→←→BA", action: "???" },
  { key: "Type any word", action: "Try typing: REI · GENDO · ADAM · SEELE" },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[9900] bg-void-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9901]
                       w-80 bg-deep-station border border-nerv-orange/25
                       shadow-nerv-orange-lg"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="px-4 py-3 border-b border-nerv-orange/20">
              <div className="font-display text-[11px] tracking-[0.2em] text-nerv-orange">
                KEYBOARD REFERENCE
              </div>
              <div className="terminal-text text-[9px] text-classified-grey mt-0.5">
                NERV INTERFACE // LONGINUS WATCH
              </div>
            </div>

            <div className="p-4 space-y-2">
              {SHORTCUTS.map(({ key, action }) => (
                <div key={key} className="flex items-start gap-3">
                  <kbd className="shrink-0 font-display text-[9px] text-amber-core
                                  bg-shadow-grid/50 border border-shadow-grid
                                  px-1.5 py-0.5 tracking-wider min-w-[2.5rem] text-center">
                    {key}
                  </kbd>
                  <span className="terminal-text text-[10px] text-phosphor-mid leading-tight">
                    {action}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-nerv-orange/10">
              <span className="font-body text-[8px] text-classified-grey tracking-[0.08em]">
                PRESS <kbd className="text-amber-warm">?</kbd> OR CLICK OUTSIDE TO CLOSE
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
