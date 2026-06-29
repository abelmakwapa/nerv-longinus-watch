```
████████████████████████████████████████████████████████████████████████████
██                                                                          ██
██   N E R V   S P E C I A L   O P E R A T I O N S   A G E N C Y         ██
██   ────────────────────────────────────────────────────────────────────  ██
██   D E E P   S P A C E   D E F E N S E   G R I D                       ██
██   L O N G I N U S   W A T C H   //   A N G E L   A P P R O A C H     ██
██                                                                          ██
██   CLASSIFICATION: TOP SECRET // GEHIRN EYES ONLY                        ██
██   DOCUMENT ID: NERV-DSDG-001-A // REV 4.7.1-DELTA                      ██
██   AUTHORIZED: COMMANDER IKARI, GENDO // APPROVED BY SEELE               ██
██                                                                          ██
████████████████████████████████████████████████████████████████████████████
```

---

> *"God is in his heaven. All is right with the world."*
> — Kaji, Ryoji // Undercover Operative, NERV

---

## SECTION 01: MISSION OVERVIEW

**CLASSIFICATION: EYES ONLY — GEHIRN PERSONNEL LEVEL 4+**

The **NERV Deep Space Defense Grid — Longinus Watch** is a classified near-Earth object (NEO) surveillance system operated under the jurisdiction of NERV Special Operations Agency, Geofront Headquarters, Tokyo-3.

The system continuously monitors the approach vectors of catalogued asteroids and provides real-time threat assessments via the MAGI supercomputer network. All threat designations are cross-referenced against the Dead Sea Scrolls Annex VII (Section 4: *Celestial Body Threat Classification*) and correlated with the AT Field Detection Array.

**PRIMARY DIRECTIVE:** Early detection of Objects of Interest that may constitute an Angel approach vector disguised as a natural celestial body.

**SECONDARY DIRECTIVE:** Public reassurance. All data marked `SOURCE: LIVE` originates from the NASA Near Earth Object Web Service (NeoWs). The system presents actual astronomical data through a classified interface.

---

## SECTION 02: INSTALLATION PROTOCOL

**For authorized NERV personnel only. Unauthorized access will be logged.**

### Prerequisites

- Node.js 18+ (MAGI compatibility: confirmed)
- npm 9+ or compatible package manager
- Access to classified NERV network segment (or internet)
- NASA API key (optional — system operates on mock telemetry if unavailable)

### Step 1: Acquire Source Code

```bash
git clone [REDACTED — REQUEST ACCESS FROM NERV IT DIVISION]
cd nerv-longinus-watch
```

### Step 2: Initialize MAGI Dependencies

```bash
npm install
```

*Note: This installs the MAGI interface layer and all required subsystems. Estimated time: 45 seconds. The MAGI array requires approximately 890 modules to operate.*

### Step 3: Configure Telemetry Feed

Create the environment file (classification: INTERNAL):

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# NASA NeoWs API key — obtain from https://api.nasa.gov/
# If not provided, system will operate on MOCK TELEMETRY (7 hardcoded objects)
NASA_API_KEY=your_key_here

# Optional: override days of data to fetch (default: 7)
NERV_APPROACH_WINDOW_DAYS=7
```

**Obtaining a NASA API Key:** Visit `https://api.nasa.gov/` and register. The key is free and grants 1,000 requests per hour. Without a key, the system uses `DEMO_KEY` (rate-limited to 30 req/hour, 50 req/day).

**Operating without a key:** The system will automatically detect API unavailability and activate `MOCK TELEMETRY MODE`, providing 7 pre-programmed asteroid objects for interface demonstration. The header will display `TELEMETRY: MOCK DATA`.

### Step 4: Boot the System

```bash
npm run dev
```

*MAGI array initializes on port `3001`. If 3001 is occupied, Next.js will attempt 3002, 3003, etc.*

Access the interface at: `http://localhost:3001`

*The boot sequence will play automatically on first load. This is normal.*

---

## SECTION 03: SYSTEM ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────────┐
│  NERV LONGINUS WATCH — SYSTEM ARCHITECTURE (CLASSIFIED)            │
├─────────────────────┬──────────────────────────────────────────────┤
│  PRESENTATION LAYER │  Next.js 15 App Router + React 19           │
│  RUNTIME            │  Node.js // Turbopack dev server             │
│  TYPE SYSTEM        │  TypeScript 5 (strict mode)                  │
│  STATE MANAGEMENT   │  Zustand 5 ("NERV-LONGINUS-WATCH" store)     │
│  DATA FETCHING      │  TanStack Query 5 (15-min polling interval)  │
│  STYLING            │  Tailwind CSS 3 + Custom CRT layer           │
│  ANIMATION          │  Framer Motion 11                            │
│  AUDIO              │  Web Audio API (pure synthesis, no files)    │
│  ORBITAL RENDERING  │  Canvas 2D API (Keplerian elements)          │
├─────────────────────┼──────────────────────────────────────────────┤
│  EXTERNAL DATA      │  NASA NeoWs API (api.nasa.gov)              │
│  MOCK FALLBACK      │  7 hardcoded objects (SAMSHEL through IRUEL) │
│  API ROUTE          │  /api/asteroids?days=7                       │
└─────────────────────┴──────────────────────────────────────────────┘
```

### Component Structure (NERV Designation)

```
src/
├── app/
│   ├── api/asteroids/route.ts      ← TELEMETRY INTAKE UNIT
│   ├── dashboard/page.tsx          ← MAIN OPERATIONS CENTER
│   └── globals.css                 ← CRT PHOSPHOR LAYER
├── components/
│   ├── alerts/AlertBanner.tsx      ← PRIORITY NOTIFICATION SYSTEM
│   ├── asteroid/
│   │   ├── AsteroidDossier.tsx     ← OBJECT ANALYSIS UNIT (Canvas orbit)
│   │   ├── AsteroidRow.tsx         ← SURVEILLANCE ROSTER ENTRY
│   │   ├── SurveillanceList.tsx    ← SURVEILLANCE ROSTER DISPLAY
│   │   └── ActiveTrackingList.tsx  ← ACTIVE TRACKING REGISTRY
│   ├── layout/
│   │   ├── SystemHeader.tsx        ← COMMAND INTERFACE HEADER
│   │   └── StatusBar.tsx          ← SYSTEM STATUS TICKER
│   ├── magi/MagiConsensusPanel.tsx ← MAGI SUPERCOMPUTER INTERFACE
│   ├── orbital/
│   │   └── OrbitalDisplayPlaceholder.tsx ← RADAR SWEEP DISPLAY
│   ├── threat/
│   │   ├── ThreatLevelIndicator.tsx ← THREAT CLASSIFICATION UNIT
│   │   └── RiskGauge.tsx           ← ANALOG METRIC DISPLAY
│   └── ui/
│       ├── BootSequence.tsx        ← MAGI INITIALIZATION SEQUENCE
│       ├── CornerBrackets.tsx      ← HOLOGRAPHIC FRAME ELEMENT
│       ├── EasterEggManager.tsx    ← [REDACTED]
│       └── KeyboardShortcuts.tsx   ← OPERATOR REFERENCE PANEL
├── hooks/
│   └── useSoundEngine.ts           ← AUDIO SUBSYSTEM HOOKS
├── lib/
│   ├── mock/mock-asteroids.ts      ← MOCK TELEMETRY ARRAY
│   ├── sound/SoundEngine.ts        ← SYNTHETIC AUDIO ENGINE
│   └── utils/format.ts             ← DISPLAY FORMATTING UTILITIES
├── store/index.ts                  ← ZUSTAND STATE (NERV-LONGINUS-WATCH)
└── types/asteroid.types.ts         ← TYPE DEFINITIONS
```

---

## SECTION 04: MAGI THREAT CLASSIFICATION PROTOCOL

The system classifies Near Earth Objects into six threat tiers, managed by the MAGI supercomputer network. Classifications are computed from a weighted threat score algorithm.

| TIER | DESIGNATION | SCORE RANGE | INDICATOR COLOR | SYSTEM STATE |
|------|-------------|-------------|-----------------|--------------|
| 0 | MINIMAL | 0–20 | `#006614` Phosphor | NOMINAL |
| 1 | MONITOR | 20–40 | `#00CC33` Green | SURVEILLANCE ACTIVE |
| 2 | ELEVATED | 40–60 | `#FFB000` Amber | CONDITION YELLOW |
| 3 | PRIORITY AMBER | 60–70 | `#FF6600` Orange | CONDITION ORANGE |
| 4 | PRIORITY RED | 70–85 | `#CC0000` Red | ALERT — ALL HANDS |
| 5 | PATTERN BLUE | 85+ | `#0044FF` Blue | ANGEL-CLASS EVENT |

**PATTERN BLUE designation** triggers the full-spectrum alert response: AT Field detection array activation, EVANGELION UNIT-01 standby status change, and immediate notification to the Commander.

A Pattern Blue classification indicates an object with threat characteristics consistent with a Celestial Arrival Event as described in Dead Sea Scroll Fragment 44-C. All personnel are to report to battle stations.

---

## SECTION 05: MAGI SUPERCOMPUTER NETWORK

The MAGI system (Multi-Analytical Geological Insight) is a network of three supercomputers, each representing a facet of their creator — Dr. Akagi Naoko — a scientist, a mother, and a woman.

| UNIT | DESIGNATION | ASSESSMENT BIAS | ROLE IN LONGINUS |
|------|-------------|-----------------|------------------|
| MAGI-01 | CASPER | Scientist | Primary risk calculation |
| MAGI-02 | BALTHASAR | Mother | Secondary verification |
| MAGI-03 | MELCHIOR | Woman | Tertiary consensus |

Each MAGI unit independently calculates threat probability and the system displays their individual assessments and consensus verdict. Minor variance between units is expected and normal. A split vote triggers a WARNING state.

*Known Easter Egg: Observe MAGI-03 Melchior's behavior at 03:00:00 UTC.*

---

## SECTION 06: OPERATOR INTERFACE REFERENCE

### Desktop Interface (Recommended — ≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  SYSTEM HEADER    [NERV] [TITLE]  [── NAVIGATION TABS ──]  [CLOCK] │
├─────────────────────────────────────────────────────────────────────┤
│  ALERT BANNER (conditional — appears on ELEVATED+ threats)          │
├──────────────────────────┬────────────────┬─────────────────────────┤
│                          │                │                         │
│   ORBITAL RADAR DISPLAY  │  THREAT LEVEL  │   MAGI CONSENSUS        │
│   (Canvas, animated)     │  INDICATOR     │   PANEL                 │
│                          │                │                         │
│   ──────────────────     │  ─────────     │   ─────────────         │
│                          │                │                         │
│   GAUGE  GAUGE  GAUGE    │  ACTIVE        │   DOSSIER               │
│   (velocity/prob/AT)     │  TRACKING LIST │   PREVIEW               │
├──────────────────────────┴────────────────┴─────────────────────────┤
│  SURVEILLANCE ROSTER (scrollable asteroid table, full width)        │
├─────────────────────────────────────────────────────────────────────┤
│  STATUS BAR [MAGI OK] [LIVE/MOCK] [TICKER...] [SOUL CONTAINMENT]   │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Interface (<1024px)

The mobile interface uses a tab-based navigation:

| TAB | ICON | CONTENT |
|-----|------|---------|
| ROSTER | ≡ | Surveillance list (primary view) |
| ORBITAL | ◎ | Radar display + gauges |
| THREAT | ⚠ | Threat indicator + active tracking |
| MAGI | ▲ | MAGI consensus + dossier preview |

---

## SECTION 07: KEYBOARD SHORTCUTS

| KEY | ACTION |
|-----|--------|
| `?` | Toggle keyboard reference panel |
| `Esc` | Close dossier / dismiss overlay |
| `↑↑↓↓←→←→BA` | [CLASSIFIED] |

**Classified Input Triggers:** The system responds to certain typed words. Personnel with NERV clearance level 4+ are encouraged to experiment. Words from the Dead Sea Scrolls may yield results.

---

## SECTION 08: DATA PIPELINE

```
NASA NeoWs API
    ↓ (HTTP GET, /rest/v1/feed)
/api/asteroids?days=7    [Next.js Route Handler]
    ↓ (transforms raw NASA format)
NervAsteroid[]           [typed, with threat scoring]
    ↓ (TanStack Query cache, 15-min polling)
Zustand Store            [global state, devtools: "NERV-LONGINUS-WATCH"]
    ↓
React Components         [reactive, animated via Framer Motion]
```

**Threat Score Algorithm:**

```typescript
score = (impactProbability * 100) +
        (torinoScale * 8) +
        (velocityBonus) +
        (diameterBonus) +
        (isPHA ? 10 : 0) +
        (isSentry ? 15 : 0)
```

---

## SECTION 09: AUDIO SYSTEM

The Longinus Watch includes a synthetic audio engine built entirely on the Web Audio API — no audio files are required. All sounds are generated from oscillators and filters in real time.

The audio system initializes on first user interaction (browser autoplay policy compliance) and responds to:

- Boot sequence completion
- Threat tier escalation
- Asteroid selection / dossier open-close
- Data refresh
- Easter egg triggers

**Note:** Volume is set to 40% by default. The audio system may be silenced by blocking audio in your browser.

---

## SECTION 10: KNOWN ISSUES AND CLASSIFIED BEHAVIORS

### Preserved System Anomalies

- `DossierPreview` component contains a deliberate CommonJS `require()` inside the React function body. This is a known artifact of the original source architecture and has been preserved for continuity.

- The `DossierPreview` displays the highest-priority object regardless of user selection. This is intentional behavior ensuring operators always see the most critical object in their peripheral view.

### Classification Stamps

All displayed objects carry one of the following classification levels:

| LEVEL | DESIGNATION |
|-------|-------------|
| UNCLASSIFIED | Public NEO catalog data |
| CONFIDENTIAL | Enhanced orbital parameters |
| SECRET | Threat assessment metadata |
| TOP SECRET | MAGI correlation data |
| TS/SCI | AT Field probability |
| GEHIRN EYES ONLY | Object may be Angel-class |

---

## SECTION 11: OPERATIONAL NOTES

*From the desk of Commander Ikari Gendo:*

*This system exists because the Committee requires it. The MAGI perform their analysis because Dr. Akagi built them to do so. The pilots are on standby because that is their purpose.*

*I do not require your admiration of this interface. I require your vigilance.*

*The next approach is in 52 hours. Prepare accordingly.*

*— Commander Ikari // NERV HQ Tokyo-3*

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF DOCUMENT // NERV-DSDG-001-A

THIS DOCUMENT IS CLASSIFIED TOP SECRET.
UNAUTHORIZED DISCLOSURE IS PUNISHABLE UNDER SPECIAL AGENCY STATUTES.
DESTROY AFTER READING. (YOU WILL NOT DESTROY IT.)

NERV // SPECIAL OPERATIONS AGENCY
"God's in His heaven — All's right with the world."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
