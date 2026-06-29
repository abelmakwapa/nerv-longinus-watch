// filepath: src/store/index.ts
/**
 * NERV LONGINUS WATCH — Application State Store
 *
 * Zustand store managing all client-side UI state.
 * Server state (API data) is handled by TanStack Query.
 *
 * Store is organized by domain slice:
 * - alert: Current threat level and alert conditions
 * - selection: Which asteroid is currently selected/viewed
 * - filter: List filter and sort parameters
 * - ui: Panel visibility, tab state, etc.
 */

"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ThreatTier, FilterState, NervAsteroid } from "@/types/asteroid.types";

// ── STATE TYPES ───────────────────────────────────────────────────────────────────

interface AlertState {
  currentTier: ThreatTier;
  priorityObject: NervAsteroid | null;
  escalationTimestamp: number | null;
  patternBlueConfirmed: boolean;
}

interface SelectionState {
  selectedAsteroidId: string | null;
  hoveredAsteroidId: string | null;
}

interface UIState {
  activeTab: string;
  isBootComplete: boolean;
  glitchActive: boolean;
  dataSource: "live" | "mock" | "cached" | null;
  lastRefresh: number | null;
  isRefreshing: boolean;
}

interface AppState {
  alert: AlertState;
  selection: SelectionState;
  filter: FilterState;
  ui: UIState;
}

interface AppActions {
  // Alert actions
  setAlertTier: (tier: ThreatTier, object: NervAsteroid | null) => void;
  confirmPatternBlue: () => void;

  // Selection actions
  selectAsteroid: (id: string | null) => void;
  hoverAsteroid: (id: string | null) => void;

  // Filter actions
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilters: () => void;

  // UI actions
  setActiveTab: (tab: string) => void;
  completeBootSequence: () => void;
  triggerGlitch: () => void;
  setDataSource: (source: "live" | "mock" | "cached") => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setLastRefresh: (timestamp: number) => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────────

const initialFilterState: FilterState = {
  tier: "ALL",
  search: "",
  sortField: "threat",
  sortDirection: "desc",
  showHazardousOnly: false,
};

const initialState: AppState = {
  alert: {
    currentTier: "MINIMAL",
    priorityObject: null,
    escalationTimestamp: null,
    patternBlueConfirmed: false,
  },
  selection: {
    selectedAsteroidId: null,
    hoveredAsteroidId: null,
  },
  filter: initialFilterState,
  ui: {
    activeTab: "surveillance",
    isBootComplete: false,
    glitchActive: false,
    dataSource: null,
    lastRefresh: null,
    isRefreshing: false,
  },
};

// ── STORE ─────────────────────────────────────────────────────────────────────────

export const useStore = create<AppState & AppActions>()(
  devtools(
    (set) => ({
      ...initialState,

      // ── ALERT ACTIONS ───────────────────────────────────────────────────────────
      setAlertTier: (tier, object) =>
        set(
          (state) => ({
            alert: {
              ...state.alert,
              currentTier: tier,
              priorityObject: object,
              escalationTimestamp: Date.now(),
            },
          }),
          false,
          "alert/setTier"
        ),

      confirmPatternBlue: () =>
        set(
          (state) => ({
            alert: { ...state.alert, patternBlueConfirmed: true },
          }),
          false,
          "alert/confirmPatternBlue"
        ),

      // ── SELECTION ACTIONS ───────────────────────────────────────────────────────
      selectAsteroid: (id) =>
        set(
          (state) => ({
            selection: { ...state.selection, selectedAsteroidId: id },
          }),
          false,
          "selection/select"
        ),

      hoverAsteroid: (id) =>
        set(
          (state) => ({
            selection: { ...state.selection, hoveredAsteroidId: id },
          }),
          false,
          "selection/hover"
        ),

      // ── FILTER ACTIONS ──────────────────────────────────────────────────────────
      setFilter: (filterUpdate) =>
        set(
          (state) => ({
            filter: { ...state.filter, ...filterUpdate },
          }),
          false,
          "filter/set"
        ),

      resetFilters: () =>
        set(
          () => ({ filter: initialFilterState }),
          false,
          "filter/reset"
        ),

      // ── UI ACTIONS ──────────────────────────────────────────────────────────────
      setActiveTab: (tab) =>
        set(
          (state) => ({ ui: { ...state.ui, activeTab: tab } }),
          false,
          "ui/setTab"
        ),

      completeBootSequence: () =>
        set(
          (state) => ({ ui: { ...state.ui, isBootComplete: true } }),
          false,
          "ui/bootComplete"
        ),

      triggerGlitch: () => {
        set(
          (state) => ({ ui: { ...state.ui, glitchActive: true } }),
          false,
          "ui/glitchStart"
        );
        // Auto-clear glitch after animation duration
        setTimeout(() => {
          set(
            (state) => ({ ui: { ...state.ui, glitchActive: false } }),
            false,
            "ui/glitchEnd"
          );
        }, 300);
      },

      setDataSource: (source) =>
        set(
          (state) => ({ ui: { ...state.ui, dataSource: source } }),
          false,
          "ui/setDataSource"
        ),

      setRefreshing: (isRefreshing) =>
        set(
          (state) => ({ ui: { ...state.ui, isRefreshing } }),
          false,
          "ui/setRefreshing"
        ),

      setLastRefresh: (timestamp) =>
        set(
          (state) => ({ ui: { ...state.ui, lastRefresh: timestamp } }),
          false,
          "ui/setLastRefresh"
        ),
    }),
    { name: "NERV-LONGINUS-WATCH" }
  )
);

// ── SELECTOR HOOKS ────────────────────────────────────────────────────────────────
// Typed selectors prevent direct state access and enable precise subscriptions

export const useAlertTier = () => useStore((s) => s.alert.currentTier);
export const usePriorityObject = () => useStore((s) => s.alert.priorityObject);
export const useSelectedId = () => useStore((s) => s.selection.selectedAsteroidId);
export const useHoveredId = () => useStore((s) => s.selection.hoveredAsteroidId);
export const useFilterState = () => useStore((s) => s.filter);
export const useActiveTab = () => useStore((s) => s.ui.activeTab);
export const useIsBootComplete = () => useStore((s) => s.ui.isBootComplete);
export const useGlitchActive = () => useStore((s) => s.ui.glitchActive);
export const useDataSource = () => useStore((s) => s.ui.dataSource);
export const useIsRefreshing = () => useStore((s) => s.ui.isRefreshing);
export const useLastRefresh = () => useStore((s) => s.ui.lastRefresh);
