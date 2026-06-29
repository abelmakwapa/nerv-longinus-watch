// filepath: src/lib/sound/SoundEngine.ts
/**
 * NERV Longinus Watch — Synthetic Sound Engine
 *
 * Pure Web Audio API synthesis — no asset files required.
 * All sounds are generated from oscillators, filtered, and
 * enveloped to match the EVA interface aesthetic:
 * clinical, cold, mechanical, slightly ominous.
 *
 * The engine initializes lazily on first user interaction
 * to comply with browser autoplay policy.
 */

type SoundId =
  | "boot_chime"
  | "boot_complete"
  | "ui_select"
  | "ui_click"
  | "ui_close"
  | "alert_amber"
  | "alert_red"
  | "alert_red_klaxon"
  | "pattern_blue"
  | "data_refresh"
  | "data_ping"
  | "tier_escalate"
  | "dossier_open"
  | "dossier_close"
  | "easter_egg"
  | "konami"
  | "second_impact";

class NERVSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _enabled = true;
  private _volume = 0.4;
  private initialized = false;

  // Initialize on first user gesture
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private get gain(): GainNode {
    this.ensureContext();
    return this.masterGain!;
  }

  // ── PRIMITIVE BUILDERS ──────────────────────────────────────────────────────────

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    startAt = 0,
    gainVal = 0.3
  ): void {
    if (!this._enabled) return;
    const ctx = this.ensureContext();
    const t = ctx.currentTime + startAt;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gainVal, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(env);
    env.connect(this.gain);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  private filteredTone(
    freq: number,
    duration: number,
    filterFreq: number,
    filterType: BiquadFilterType = "lowpass",
    startAt = 0,
    gainVal = 0.25
  ): void {
    if (!this._enabled) return;
    const ctx = this.ensureContext();
    const t = ctx.currentTime + startAt;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, t);

    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, t);
    filter.Q.setValueAtTime(5, t);

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gainVal, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.gain);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  private noise(duration: number, startAt = 0, gainVal = 0.05): void {
    if (!this._enabled) return;
    const ctx = this.ensureContext();
    const t = ctx.currentTime + startAt;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gainVal, t + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    source.connect(filter);
    filter.connect(env);
    env.connect(this.gain);
    source.start(t);
  }

  // ── SOUND DEFINITIONS ──────────────────────────────────────────────────────────

  play(id: SoundId): void {
    if (!this._enabled) return;
    try {
      this._play(id);
    } catch {
      // Audio synthesis errors should never crash the UI
    }
  }

  private _play(id: SoundId): void {
    switch (id) {
      // Boot sequence — ascending NERV chime
      case "boot_chime":
        [440, 550, 660, 880].forEach((freq, i) => {
          this.tone(freq, 0.15, "sine", i * 0.07, 0.2);
        });
        break;

      case "boot_complete":
        this.tone(880, 0.08, "sine", 0, 0.25);
        this.tone(1320, 0.2, "sine", 0.06, 0.2);
        this.tone(880, 0.3, "sine", 0.18, 0.15);
        this.noise(0.05, 0, 0.04);
        break;

      // UI interactions — brief clicks/chirps
      case "ui_select":
        this.tone(660, 0.06, "square", 0, 0.1);
        this.tone(880, 0.04, "square", 0.04, 0.08);
        break;

      case "ui_click":
        this.tone(440, 0.04, "square", 0, 0.08);
        this.noise(0.03, 0, 0.03);
        break;

      case "ui_close":
        this.tone(440, 0.06, "sine", 0, 0.15);
        this.tone(330, 0.1, "sine", 0.04, 0.1);
        break;

      // Dossier sounds
      case "dossier_open":
        this.tone(880, 0.04, "square", 0, 0.1);
        this.tone(660, 0.04, "square", 0.03, 0.08);
        this.tone(550, 0.08, "sine", 0.06, 0.1);
        break;

      case "dossier_close":
        this.tone(550, 0.04, "square", 0, 0.08);
        this.tone(330, 0.1, "sine", 0.04, 0.1);
        break;

      // Alert sounds — escalating severity
      case "alert_amber":
        this.filteredTone(440, 0.3, 800, "bandpass", 0, 0.2);
        this.filteredTone(440, 0.3, 800, "bandpass", 0.35, 0.2);
        break;

      case "alert_red":
        // Two-tone warning klaxon
        this.tone(880, 0.15, "square", 0, 0.2);
        this.tone(660, 0.15, "square", 0.18, 0.2);
        this.tone(880, 0.15, "square", 0.36, 0.2);
        this.tone(660, 0.15, "square", 0.54, 0.2);
        break;

      case "alert_red_klaxon":
        // Continuous alarm pattern
        for (let i = 0; i < 4; i++) {
          this.filteredTone(220, 0.12, 1200, "lowpass", i * 0.15, 0.25);
          this.filteredTone(330, 0.12, 1200, "lowpass", i * 0.15 + 0.08, 0.2);
        }
        break;

      case "pattern_blue":
        // Low ominous drone + high alarm
        this.tone(55, 1.5, "sine", 0, 0.3);       // Sub bass drone
        this.tone(110, 1.2, "sawtooth", 0, 0.12); // Drone harmonic
        this.tone(880, 0.1, "square", 0.1, 0.15);
        this.tone(1320, 0.1, "square", 0.25, 0.12);
        this.tone(880, 0.1, "square", 0.4, 0.15);
        this.tone(1760, 0.4, "sine", 0.55, 0.2);  // High alarm shriek
        break;

      // Data operations
      case "data_refresh":
        this.tone(440, 0.03, "square", 0, 0.06);
        this.tone(550, 0.03, "square", 0.04, 0.06);
        this.tone(660, 0.06, "sine", 0.08, 0.08);
        break;

      case "data_ping":
        this.tone(1320, 0.06, "sine", 0, 0.12);
        this.noise(0.02, 0, 0.04);
        break;

      // Threat escalation — plays when tier increases
      case "tier_escalate":
        this.tone(220, 0.08, "square", 0, 0.2);
        this.tone(330, 0.08, "square", 0.06, 0.18);
        this.tone(440, 0.08, "square", 0.12, 0.16);
        this.tone(550, 0.15, "sine", 0.18, 0.15);
        break;

      // Easter egg sounds
      case "easter_egg":
        [523, 659, 784, 1047].forEach((f, i) => {
          this.tone(f, 0.1, "sine", i * 0.1, 0.2);
        });
        break;

      case "konami":
        // Victory fanfare — ascending octave
        [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => {
          this.tone(f, 0.08, "square", i * 0.08, 0.15);
        });
        this.tone(1047, 0.4, "sine", 0.6, 0.2);
        break;

      case "second_impact":
        // Deep rumble + silence
        this.tone(40, 2.0, "sine", 0, 0.4);
        this.tone(60, 1.5, "sine", 0, 0.3);
        this.noise(0.5, 0, 0.15);
        this.tone(880, 0.1, "square", 0.3, 0.1);
        this.tone(440, 1.5, "sine", 0.5, 0.2);
        break;
    }
  }

  // ── CONTROLS ───────────────────────────────────────────────────────────────────

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  setVolume(vol: number): void {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this._volume, this.ctx!.currentTime, 0.05);
    }
  }

  get isEnabled(): boolean { return this._enabled; }
  get volume(): number { return this._volume; }
  get isInitialized(): boolean { return this.initialized; }
}

// Singleton instance
export const soundEngine = typeof window !== "undefined"
  ? new NERVSoundEngine()
  : null;

export type { SoundId };
