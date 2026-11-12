// Web Audio API Synthesizer for Holiday / Christmas BGM (Jingle Bells & We Wish You A Merry Christmas)
// Zero external assets required, 100% offline, crystal clear music-box / celesta / chime tones

interface Note {
  pitch: number; // Frequency in Hz
  duration: number; // in beats (1 = quarter note)
}

// Frequencies (Hz) for standard notes
const N = {
  REST: 0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.00,
  B5: 987.77,
  C6: 1046.50
};

// Melody 1: Jingle Bells (Refrain & Chorus)
const JINGLE_BELLS: Note[] = [
  // E E E - E E E - E G C D E
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 2 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 2 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.G5, duration: 1 },
  { pitch: N.C5, duration: 1.5 },
  { pitch: N.D5, duration: 0.5 },
  { pitch: N.E5, duration: 3 },
  { pitch: N.REST, duration: 1 },

  // F F F F F E E E E D D E D G
  { pitch: N.F5, duration: 1 },
  { pitch: N.F5, duration: 1 },
  { pitch: N.F5, duration: 1.5 },
  { pitch: N.F5, duration: 0.5 },
  { pitch: N.F5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 0.5 },
  { pitch: N.E5, duration: 0.5 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.D5, duration: 1 },
  { pitch: N.D5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.D5, duration: 2 },
  { pitch: N.G5, duration: 2 },

  // E E E - E E E - E G C D E
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 2 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 2 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.G5, duration: 1 },
  { pitch: N.C5, duration: 1.5 },
  { pitch: N.D5, duration: 0.5 },
  { pitch: N.E5, duration: 3 },
  { pitch: N.REST, duration: 1 },

  // F F F F F E E E G G F D C
  { pitch: N.F5, duration: 1 },
  { pitch: N.F5, duration: 1 },
  { pitch: N.F5, duration: 1.5 },
  { pitch: N.F5, duration: 0.5 },
  { pitch: N.F5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.E5, duration: 0.5 },
  { pitch: N.E5, duration: 0.5 },
  { pitch: N.G5, duration: 1 },
  { pitch: N.G5, duration: 1 },
  { pitch: N.F5, duration: 1 },
  { pitch: N.D5, duration: 1 },
  { pitch: N.C5, duration: 3 },
  { pitch: N.REST, duration: 2 }
];

// Melody 2: We Wish You A Merry Christmas
const WE_WISH_YOU: Note[] = [
  // We wish you a Merry Christmas
  { pitch: N.D5, duration: 1 },
  { pitch: N.G5, duration: 1 },
  { pitch: N.G5, duration: 0.5 },
  { pitch: N.A5, duration: 0.5 },
  { pitch: N.G5, duration: 0.5 },
  { pitch: N.F5, duration: 0.5 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.C5, duration: 1 },

  // We wish you a Merry Christmas
  { pitch: N.E5, duration: 1 },
  { pitch: N.A5, duration: 1 },
  { pitch: N.A5, duration: 0.5 },
  { pitch: N.B5, duration: 0.5 },
  { pitch: N.A5, duration: 0.5 },
  { pitch: N.G5, duration: 0.5 },
  { pitch: N.F5, duration: 1 },
  { pitch: N.D5, duration: 1 },

  // We wish you a Merry Christmas and a Happy New Year
  { pitch: N.F5, duration: 1 },
  { pitch: N.B5, duration: 1 },
  { pitch: N.B5, duration: 0.5 },
  { pitch: N.C6, duration: 0.5 },
  { pitch: N.B5, duration: 0.5 },
  { pitch: N.A5, duration: 0.5 },
  { pitch: N.G5, duration: 1 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.D5, duration: 0.5 },
  { pitch: N.D5, duration: 0.5 },
  { pitch: N.E5, duration: 1 },
  { pitch: N.A5, duration: 1 },
  { pitch: N.F5, duration: 1 },
  { pitch: N.G5, duration: 2 },
  { pitch: N.REST, duration: 2 }
];

class ChristmasAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTimer: any = null;
  private volume = 0.06;
  private listeners: ((playing: boolean) => void)[] = [];
  private fullSong: Note[] = [...JINGLE_BELLS, ...WE_WISH_YOU];
  private tempoBpm = 148;

  constructor() {
    // Check initial preference from localStorage
    const saved = localStorage.getItem('npt_noel_music');
    // Default to false so user has polite opt-in or can trigger anytime with 1 click
    this.isPlaying = saved === 'true';
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.isPlaying));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single bell / chime note with crystalline harmonics
  private playBellNote(frequency: number, durationSeconds: number) {
    if (!this.ctx || frequency <= 0) return;

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds * 1.6);
    masterGain.connect(this.ctx.destination);

    // Fundamental tone (sine)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);

    // Overtone 1 (sparkle bell harmonic at 2.76x)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2.76, now);
    gain2.gain.setValueAtTime(0.35, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds * 0.8);

    // Overtone 2 (warm fifth harmonic at 1.5x)
    const osc3 = this.ctx.createOscillator();
    const gain3 = this.ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(frequency * 1.5, now);
    gain3.gain.setValueAtTime(0.2, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds * 1.1);

    osc1.connect(masterGain);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc3.connect(gain3);
    gain3.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    const stopTime = now + durationSeconds * 1.8;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);
  }

  public play() {
    this.initCtx();
    this.isPlaying = true;
    localStorage.setItem('npt_noel_music', 'true');
    this.notify();

    let noteIndex = 0;
    const beatDurationMs = (60 / this.tempoBpm) * 1000;

    const tick = () => {
      if (!this.isPlaying) return;

      const currentNote = this.fullSong[noteIndex];
      const durationSeconds = (currentNote.duration * beatDurationMs) / 1000;

      if (currentNote.pitch > 0) {
        this.playBellNote(currentNote.pitch, durationSeconds);
      }

      noteIndex = (noteIndex + 1) % this.fullSong.length;
      this.currentTimer = setTimeout(tick, currentNote.duration * beatDurationMs);
    };

    tick();
  }

  public stop() {
    this.isPlaying = false;
    localStorage.setItem('npt_noel_music', 'false');
    if (this.currentTimer) {
      clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  // Quick festive jingle bell SFX for user interactions
  public playChimeSfx() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [N.E5, N.G5, N.C6].forEach((freq, idx) => {
      setTimeout(() => {
        this.playBellNote(freq, 0.4);
      }, idx * 90);
    });
  }
}

export const christmasAudio = new ChristmasAudioEngine();
