// filepath: src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ThreatLevelIndicator } from "@/components/threat/ThreatLevelIndicator";
import { MagiConsensusPanel } from "@/components/magi/MagiConsensusPanel";
import { SurveillanceList } from "@/components/asteroid/SurveillanceList";
import { RiskGauge } from "@/components/threat/RiskGauge";
import { SystemHeader } from "@/components/layout/SystemHeader";
import { StatusBar } from "@/components/layout/StatusBar";
import { StoreProvider } from "@/providers/StoreProvider";
import { OrbitalDisplayPlaceholder } from "@/components/orbital/OrbitalDisplayPlaceholder";
import { AlertBanner } from "@/components/alerts/AlertBanner";
import { ActiveTrackingList } from "@/components/asteroid/ActiveTrackingList";
import { AsteroidDossier } from "@/components/asteroid/AsteroidDossier";
import { BootSequence } from "@/components/ui/BootSequence";
import { EasterEggManager } from "@/components/ui/EasterEggManager";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { useAlertTier, usePriorityObject, useStore } from "@/store";
import { formatProbability, formatVelocity } from "@/lib/utils/format";
import { useAlertSounds, useDataSounds } from "@/hooks/useSoundEngine";
import { soundEngine } from "@/lib/sound/SoundEngine";

export default function DashboardPage() {
  return (
    <StoreProvider>
      <DashboardRoot />
    </StoreProvider>
  );
}

type MobileTab = "roster" | "orbital" | "threat" | "magi";

function DashboardRoot() {
  const alertTier = useAlertTier();
  const [showBoot, setShowBoot] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("roster");
  const completeBootSequence = useStore((s) => s.completeBootSequence);

  // Sound hooks — initialize once at root
  useAlertSounds();
  useDataSounds();

  // Apply body-level alert class for global CRT tinting
  useEffect(() => {
    const body = document.body;
    body.classList.remove("alert-priority-red", "alert-pattern-blue");
    if (alertTier === "PRIORITY_RED") body.classList.add("alert-priority-red");
    else if (alertTier === "PATTERN_BLUE") body.classList.add("alert-pattern-blue");
    return () => {
      body.classList.remove("alert-priority-red", "alert-pattern-blue");
    };
  }, [alertTier]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return;
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-void-black relative">
      {/* Film grain overlay */}
      <div className="grain-overlay" />

      {/* Boot sequence overlay */}
      {showBoot && <BootSequence onComplete={handleBootComplete} />}

      {/* Easter egg listener (keyboard) */}
      <EasterEggManager />

      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcuts open={showHelp} onClose={() => setShowHelp(false)} />

      {/* Main dashboard — desktop */}
      <div className="hidden lg:contents">
        <SystemHeader />
        <AlertBanner />
        <DesktopDashboardContent />
        <StatusBar />
        <AsteroidDossier />
      </div>

      {/* Main dashboard — mobile/tablet */}
      <div className="flex lg:hidden flex-col h-full overflow-hidden">
        <SystemHeader />
        <AlertBanner />
        <MobileDashboardContent tab={mobileTab} />
        <MobileTabBar tab={mobileTab} onTabChange={setMobileTab} />
        <AsteroidDossier />
      </div>
    </div>
  );
}

// ── DESKTOP LAYOUT (≥1024px) ────────────────────────────────────────────────────

function DesktopDashboardContent() {
  const priorityObject = usePriorityObject();

  const velocityValue = priorityObject?.closestApproach?.velocityKmS ?? 0;
  const probabilityValue = priorityObject?.threat.impactProbability ?? 0;
  const atFieldValue = priorityObject?.atFieldProbability ?? 0;

  return (
    <main className="flex-1 overflow-hidden grid grid-cols-[1fr_260px_240px] grid-rows-[1fr_auto] relative">

      {/* ── COLUMN 1: CENTER — ORBITAL DISPLAY + GAUGES ─────────────────────────── */}
      <div className="flex flex-col overflow-hidden border-r border-shadow-grid">

        {/* Orbital Display */}
        <section className="flex-1 relative border-b border-shadow-grid min-h-0">
          <OrbitalDisplayPlaceholder />
        </section>

        {/* Analog Gauge Cluster */}
        <section className="h-52 flex items-center justify-around px-6 bg-void-black shrink-0 retro-grid">
          <RiskGauge
            value={velocityValue}
            maxValue={70}
            label="APPROACH VELOCITY"
            unit="km/s"
            displayValue={formatVelocity(velocityValue)}
            dangerThreshold={0.57}
            tier={priorityObject?.threat.tier ?? "MINIMAL"}
            size={148}
          />

          <RiskGauge
            value={probabilityValue}
            maxValue={0.01}
            label="IMPACT PROBABILITY"
            unit="P(IMPACT)"
            displayValue={formatProbability(probabilityValue)}
            dangerThreshold={0.7}
            tier={priorityObject?.threat.tier ?? "MINIMAL"}
            size={148}
          />

          <RiskGauge
            value={atFieldValue}
            maxValue={1}
            label="A.T. FIELD PROBABILITY"
            unit="%"
            displayValue={`${(atFieldValue * 100).toFixed(3)}%`}
            dangerThreshold={0.001}
            tier={atFieldValue > 0 ? "PATTERN_BLUE" : "MINIMAL"}
            size={148}
          />
        </section>
      </div>

      {/* ── COLUMN 2: MID-RIGHT — THREAT LEVEL + TRACKING LIST ──────────────────── */}
      <div className="flex flex-col overflow-hidden border-r border-shadow-grid">
        <section className="flex-1 overflow-hidden min-h-0 border-b border-shadow-grid">
          <ThreatLevelIndicator className="h-full" />
        </section>
        <section className="h-64 overflow-hidden shrink-0">
          <ActiveTrackingList />
        </section>
      </div>

      {/* ── COLUMN 3: FAR RIGHT — MAGI + DOSSIER PREVIEW ───────────────────────── */}
      <div className="flex flex-col overflow-hidden">
        <section className="flex-1 overflow-hidden min-h-0 border-b border-shadow-grid">
          <MagiConsensusPanel />
        </section>
        <section className="h-64 overflow-hidden shrink-0">
          <DossierPreview />
        </section>
      </div>

      {/* ── FULL WIDTH ROW 2: SURVEILLANCE LIST ─────────────────────────────────── */}
      <div
        className="col-span-3 border-t border-shadow-grid overflow-hidden"
        style={{ height: "calc(50vh - 48px)" }}
      >
        <SurveillanceList />
      </div>
    </main>
  );
}

// ── MOBILE LAYOUT (<1024px) ─────────────────────────────────────────────────────

function MobileDashboardContent({ tab }: { tab: MobileTab }) {
  const priorityObject = usePriorityObject();
  const velocityValue = priorityObject?.closestApproach?.velocityKmS ?? 0;
  const probabilityValue = priorityObject?.threat.impactProbability ?? 0;
  const atFieldValue = priorityObject?.atFieldProbability ?? 0;

  return (
    <main className="flex-1 overflow-hidden bg-void-black">
      {tab === "roster" && (
        <div className="h-full">
          <SurveillanceList />
        </div>
      )}

      {tab === "orbital" && (
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <OrbitalDisplayPlaceholder />
          </div>
          <div className="shrink-0 flex items-center justify-around px-4 py-3 bg-void-black border-t border-shadow-grid retro-grid gap-2">
            <RiskGauge
              value={velocityValue}
              maxValue={70}
              label="VELOCITY"
              unit="km/s"
              displayValue={formatVelocity(velocityValue)}
              dangerThreshold={0.57}
              tier={priorityObject?.threat.tier ?? "MINIMAL"}
              size={100}
            />
            <RiskGauge
              value={probabilityValue}
              maxValue={0.01}
              label="P(IMPACT)"
              unit=""
              displayValue={formatProbability(probabilityValue)}
              dangerThreshold={0.7}
              tier={priorityObject?.threat.tier ?? "MINIMAL"}
              size={100}
            />
            <RiskGauge
              value={atFieldValue}
              maxValue={1}
              label="AT FIELD"
              unit="%"
              displayValue={`${(atFieldValue * 100).toFixed(1)}%`}
              dangerThreshold={0.001}
              tier={atFieldValue > 0 ? "PATTERN_BLUE" : "MINIMAL"}
              size={100}
            />
          </div>
        </div>
      )}

      {tab === "threat" && (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 border-b border-shadow-grid overflow-auto">
            <ThreatLevelIndicator className="h-full min-h-[300px]" />
          </div>
          <div className="shrink-0 h-56 overflow-hidden">
            <ActiveTrackingList />
          </div>
        </div>
      )}

      {tab === "magi" && (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 border-b border-shadow-grid overflow-auto">
            <MagiConsensusPanel />
          </div>
          <div className="shrink-0 h-56 overflow-hidden">
            <DossierPreview />
          </div>
        </div>
      )}
    </main>
  );
}

// ── MOBILE TAB BAR ──────────────────────────────────────────────────────────────

const MOBILE_TABS: { id: MobileTab; label: string; icon: string }[] = [
  { id: "roster", label: "ROSTER", icon: "≡" },
  { id: "orbital", label: "ORBITAL", icon: "◎" },
  { id: "threat", label: "THREAT", icon: "⚠" },
  { id: "magi", label: "MAGI", icon: "▲" },
];

function MobileTabBar({
  tab,
  onTabChange,
}: {
  tab: MobileTab;
  onTabChange: (t: MobileTab) => void;
}) {
  const alertTier = useAlertTier();
  const isHighAlert = alertTier === "PRIORITY_RED" || alertTier === "PATTERN_BLUE";

  return (
    <nav
      className={cn(
        "shrink-0 flex border-t",
        isHighAlert ? "border-bloodwarn-mid/50" : "border-shadow-grid"
      )}
    >
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

// ── DOSSIER PREVIEW ─────────────────────────────────────────────────────────────────
// NOTE: Preserved known bug — CommonJS require() inside React component function body
function DossierPreview() {
  const { useSelectedId, useStore: useAppStore } = require("@/store");
  // Note: We'd normally import this at top — inline for component co-location
  const selectedId = usePriorityObject();
  const selectAsteroid = useStore((s) => s.selectAsteroid);

  if (!selectedId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-terminal-black p-4 retro-grid">
        <div className="corner-brackets-full text-classified-grey/30 w-full h-full flex flex-col items-center justify-center gap-3 p-4">
          <span className="terminal-text text-[11px] text-phosphor-dim text-center">
            SYS &gt; NO OBJECT SELECTED
          </span>
          <span className="font-body text-[9px] text-classified-grey/60 text-center leading-relaxed">
            SELECT AN OBJECT FROM THE
            <br />
            SURVEILLANCE ROSTER
          </span>
          <span className="font-body text-[8px] text-classified-grey/30 tracking-[0.1em] mt-1">
            — OR CLICK ANY TRACKING ENTRY —
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-terminal-black overflow-hidden">
      {/* Mini header */}
      <div className="px-3 py-2 border-b border-shadow-grid shrink-0 flex items-center justify-between">
        <span className="font-body text-[9px] text-classified-grey tracking-[0.1em]">
          DOSSIER PREVIEW
        </span>
        <button
          onClick={() => {
            selectAsteroid(null);
            soundEngine?.play("ui_close");
          }}
          className="font-body text-[9px] text-classified-grey/50 hover:text-nerv-orange transition-colors"
        >
          ✕
        </button>
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
                selectedId.threat.tier === "PRIORITY_AMBER" ? "#FF6600" :
                "#00CC33",
              borderColor: "currentColor",
            }}
          >
            {selectedId.threat.tier.replace("_", " ")}
          </div>
        </div>

        <div className="space-y-1.5 terminal-text text-[11px]">
          <div className="flex justify-between">
            <span className="text-classified-grey text-[9px]">P(IMPACT)</span>
            <span className="text-bloodwarn-text">
              {formatProbability(selectedId.threat.impactProbability)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-classified-grey text-[9px]">SCORE</span>
            <span className="text-amber-bright">
              {selectedId.threat.score.toFixed(1)} / 100
            </span>
          </div>
          {selectedId.closestApproach && (
            <div className="flex justify-between">
              <span className="text-classified-grey text-[9px]">APPROACH</span>
              <span className="text-phosphor-mid">
                {selectedId.closestApproach.date}
              </span>
            </div>
          )}
        </div>

        {/* Open full dossier button */}
        <button
          onClick={() => {
            selectAsteroid(selectedId.id);
            soundEngine?.play("dossier_open");
          }}
          className={cn(
            "mt-auto w-full py-1.5 text-center",
            "font-display text-[9px] tracking-[0.15em]",
            "border border-nerv-orange/30 text-nerv-orange-dim",
            "hover:border-nerv-orange hover:text-nerv-orange hover:bg-nerv-orange/5",
            "transition-colors duration-150"
          )}
        >
          OPEN FULL DOSSIER →
        </button>
      </div>
    </div>
  );
}
