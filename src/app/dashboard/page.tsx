// filepath: src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import { ThreatLevelIndicator } from "@/components/threat/ThreatLevelIndicator";
import { MagiConsensusPanel } from "@/components/magi/MagiConsensusPanel";
import { SurveillanceList } from "@/components/asteroid/SurveillanceList";
import { RiskGauge } from "@/components/threat/RiskGauge";
import { SystemHeader } from "@/components/layout/SystemHeader";
import { StatusBar } from "@/components/layout/StatusBar";
import { StoreProvider } from "@/providers/StoreProvider";
import { AlertBanner } from "@/components/alerts/AlertBanner";
import { ActiveTrackingList } from "@/components/asteroid/ActiveTrackingList";
import { AsteroidDossier } from "@/components/asteroid/AsteroidDossier";
import { AsteroidFeed } from "@/components/asteroid/AsteroidFeed";
import { BootSequence } from "@/components/ui/BootSequence";
import { EasterEggManager } from "@/components/ui/EasterEggManager";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { CommandRail, TrackingRail, RosterDrawer } from "@/components/hud/HeroHud";
import { useAlertTier, usePriorityObject, useStore } from "@/store";
import { formatProbability, formatVelocity } from "@/lib/utils/format";
import { useAlertSounds, useDataSounds } from "@/hooks/useSoundEngine";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { soundEngine } from "@/lib/sound/SoundEngine";

// 3D solar system is client-only (Three.js touches the DOM/WebGL).
const SolarSystem = dynamic(
  () => import("@/components/solar-system/SolarSystem").then((m) => m.SolarSystem),
  { ssr: false, loading: () => <HeroLoader /> }
);

export default function DashboardPage() {
  return (
    <StoreProvider>
      <DashboardRoot />
    </StoreProvider>
  );
}

type MobileTab = "orbital" | "roster" | "threat" | "magi";

function DashboardRoot() {
  const alertTier = useAlertTier();
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);
  const [showBoot, setShowBoot] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("orbital");
  const completeBootSequence = useStore((s) => s.completeBootSequence);

  // Defer the interactive (framer-motion + WebGL) tree to the client so SSR and
  // first client render produce identical HTML (no hydration mismatch).
  useEffect(() => setMounted(true), []);

  useAlertSounds();
  useDataSounds();

  // Global CRT tinting per alert tier.
  useEffect(() => {
    const body = document.body;
    body.classList.remove("alert-priority-red", "alert-pattern-blue");
    if (alertTier === "PRIORITY_RED") body.classList.add("alert-priority-red");
    else if (alertTier === "PATTERN_BLUE") body.classList.add("alert-pattern-blue");
    return () => body.classList.remove("alert-priority-red", "alert-pattern-blue");
  }, [alertTier]);

  // `?` toggles the keyboard reference.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((v) => !v);
        soundEngine?.play("ui_click");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleBootComplete = () => {
    setShowBoot(false);
    completeBootSequence();
    soundEngine?.play("boot_complete");
  };

  // Static splash for SSR / first paint — must match server markup exactly.
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-void-black">
        <span className="font-display text-nerv-orange text-sm tracking-[0.5em] opacity-80">
          NERV
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-void-black relative">
      <div className="grain-overlay" />

      {/* Always-mounted data owner — drives the shared ["asteroids"] query */}
      <AsteroidFeed />

      {showBoot && <BootSequence onComplete={handleBootComplete} />}
      <EasterEggManager />
      <KeyboardShortcuts open={showHelp} onClose={() => setShowHelp(false)} />

      {/* Render exactly ONE layout tree — keeps a single WebGL canvas alive. */}
      {isDesktop ? (
        // ── DESKTOP: full-bleed 3D hero + floating HUD ──────────────────────────
        <>
          <SystemHeader />
          <AlertBanner />
          <main className="flex-1 relative overflow-hidden">
            <SolarSystem />
            <div className="absolute inset-0 pointer-events-none z-30">
              <CommandRail />
              <TrackingRail />
              <RosterDrawer />
            </div>
          </main>
          <StatusBar />
          <AsteroidDossier />
        </>
      ) : (
        // ── MOBILE / TABLET: tabbed layout ──────────────────────────────────────
        <>
          <SystemHeader />
          <AlertBanner />
          <MobileContent tab={mobileTab} />
          <MobileTabBar tab={mobileTab} onTabChange={setMobileTab} />
          <AsteroidDossier />
        </>
      )}
    </div>
  );
}

// ── HERO LOADER ───────────────────────────────────────────────────────────────────

function HeroLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-void-black gap-3">
      <div className="font-display text-[12px] tracking-[0.3em] text-nerv-orange animate-neon-pulse">
        INITIALIZING ORBITAL PROJECTION
      </div>
      <div className="terminal-text text-[10px] text-phosphor-mid">
        MAGI &gt; COMPILING KEPLERIAN SOLVER…
      </div>
      <div className="w-48 h-px bg-shadow-grid overflow-hidden">
        <div className="h-full w-1/3 bg-nerv-orange animate-data-scroll" />
      </div>
    </div>
  );
}

// ── MOBILE LAYOUT ───────────────────────────────────────────────────────────────

function MobileContent({ tab }: { tab: MobileTab }) {
  const priorityObject = usePriorityObject();
  const velocityValue = priorityObject?.closestApproach?.velocityKmS ?? 0;
  const probabilityValue = priorityObject?.threat.impactProbability ?? 0;
  const atFieldValue = priorityObject?.atFieldProbability ?? 0;

  return (
    <main className="flex-1 overflow-hidden bg-void-black">
      {tab === "orbital" && (
        <div className="h-full flex flex-col">
          <div className="relative flex-1 min-h-0">
            <SolarSystem />
          </div>
          <div className="shrink-0 flex items-center justify-around px-3 py-2.5 bg-void-black border-t border-shadow-grid retro-grid gap-2">
            <RiskGauge value={velocityValue} maxValue={70} label="VELOCITY" unit="km/s"
              displayValue={formatVelocity(velocityValue)} dangerThreshold={0.57}
              tier={priorityObject?.threat.tier ?? "MINIMAL"} size={92} />
            <RiskGauge value={probabilityValue} maxValue={0.01} label="P(IMPACT)" unit=""
              displayValue={formatProbability(probabilityValue)} dangerThreshold={0.7}
              tier={priorityObject?.threat.tier ?? "MINIMAL"} size={92} />
            <RiskGauge value={atFieldValue} maxValue={1} label="AT FIELD" unit="%"
              displayValue={`${(atFieldValue * 100).toFixed(1)}%`} dangerThreshold={0.001}
              tier={atFieldValue > 0 ? "PATTERN_BLUE" : "MINIMAL"} size={92} />
          </div>
        </div>
      )}

      {tab === "roster" && <div className="h-full"><SurveillanceList /></div>}

      {tab === "threat" && (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 border-b border-shadow-grid overflow-auto">
            <ThreatLevelIndicator className="h-full min-h-[300px]" />
          </div>
          <div className="shrink-0 h-56 overflow-hidden"><ActiveTrackingList /></div>
        </div>
      )}

      {tab === "magi" && (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 border-b border-shadow-grid overflow-auto">
            <MagiConsensusPanel />
          </div>
          <div className="shrink-0 h-56 overflow-hidden"><DossierPreview /></div>
        </div>
      )}
    </main>
  );
}

const MOBILE_TABS: { id: MobileTab; label: string; icon: string }[] = [
  { id: "orbital", label: "ORBITAL", icon: "◎" },
  { id: "roster", label: "ROSTER", icon: "≡" },
  { id: "threat", label: "THREAT", icon: "⚠" },
  { id: "magi", label: "MAGI", icon: "▲" },
];

function MobileTabBar({ tab, onTabChange }: { tab: MobileTab; onTabChange: (t: MobileTab) => void }) {
  const alertTier = useAlertTier();
  const isHighAlert = alertTier === "PRIORITY_RED" || alertTier === "PATTERN_BLUE";

  return (
    <nav className={cn("shrink-0 flex border-t", isHighAlert ? "border-bloodwarn-mid/50" : "border-shadow-grid")}>
      {MOBILE_TABS.map(({ id, label, icon }) => {
        const isActive = tab === id;
        return (
          <button
            key={id}
            onClick={() => {
              onTabChange(id);
              soundEngine?.play("ui_click");
            }}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5",
              "font-display text-[8px] tracking-[0.12em] transition-colors duration-100",
              isActive
                ? "text-nerv-orange bg-nerv-orange/5 border-t-2 border-nerv-orange"
                : "text-classified-grey bg-terminal-black border-t-2 border-transparent",
              !isActive && "hover:text-amber-warm"
            )}
          >
            <span className="text-[14px] leading-none">{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── DOSSIER PREVIEW (mobile MAGI tab) ─────────────────────────────────────────────────
// NOTE: Preserved known bug — CommonJS require() inside React component function body
function DossierPreview() {
  const { useSelectedId, useStore: useAppStore } = require("@/store");
  const selectedId = usePriorityObject();
  const selectAsteroid = useStore((s) => s.selectAsteroid);

  if (!selectedId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-terminal-black p-4 retro-grid">
        <div className="corner-brackets-full text-classified-grey/30 w-full h-full flex flex-col items-center justify-center gap-3 p-4">
          <span className="terminal-text text-[11px] text-phosphor-dim text-center">SYS &gt; NO OBJECT SELECTED</span>
          <span className="font-body text-[9px] text-classified-grey/60 text-center leading-relaxed">
            TAP AN OBJECT IN THE ORBITAL VIEW<br />OR THE SURVEILLANCE ROSTER
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-terminal-black overflow-hidden">
      <div className="px-3 py-2 border-b border-shadow-grid shrink-0 flex items-center justify-between">
        <span className="font-body text-[9px] text-classified-grey tracking-[0.1em]">DOSSIER PREVIEW</span>
        <button
          onClick={() => { selectAsteroid(null); soundEngine?.play("ui_close"); }}
          className="font-body text-[9px] text-classified-grey/50 hover:text-nerv-orange transition-colors"
        >✕</button>
      </div>
      <div className="flex-1 p-3 gap-2 overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-display text-[12px] text-amber-bright tracking-[0.06em] block truncate">
              {selectedId.designation}
            </span>
            <span className="font-body text-[8px] text-classified-grey tracking-[0.08em]">
              NERV: {selectedId.nervCodename}
            </span>
          </div>
          <div
            className="px-1.5 py-0.5 border text-[8px] font-display tracking-[0.1em] shrink-0"
            style={{
              color:
                selectedId.threat.tier === "PATTERN_BLUE" ? "#4488FF" :
                selectedId.threat.tier === "PRIORITY_RED" ? "#FF4444" :
                selectedId.threat.tier === "PRIORITY_AMBER" ? "#FF6600" : "#00CC33",
              borderColor: "currentColor",
            }}
          >
            {selectedId.threat.tier.replace("_", " ")}
          </div>
        </div>
        <div className="space-y-1.5 terminal-text text-[11px]">
          <div className="flex justify-between">
            <span className="text-classified-grey text-[9px]">P(IMPACT)</span>
            <span className="text-bloodwarn-text">{formatProbability(selectedId.threat.impactProbability)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-classified-grey text-[9px]">SCORE</span>
            <span className="text-amber-bright">{selectedId.threat.score.toFixed(1)} / 100</span>
          </div>
          {selectedId.closestApproach && (
            <div className="flex justify-between">
              <span className="text-classified-grey text-[9px]">APPROACH</span>
              <span className="text-phosphor-mid">{selectedId.closestApproach.date}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => { selectAsteroid(selectedId.id); soundEngine?.play("dossier_open"); }}
          className={cn(
            "mt-auto w-full py-1.5 text-center font-display text-[9px] tracking-[0.15em]",
            "border border-nerv-orange/30 text-nerv-orange-dim",
            "hover:border-nerv-orange hover:text-nerv-orange hover:bg-nerv-orange/5 transition-colors duration-150"
          )}
        >OPEN FULL DOSSIER →</button>
      </div>
    </div>
  );
}
