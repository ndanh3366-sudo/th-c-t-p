// Metallic Sound Generator using Web Audio API

let audioCtx: AudioContext | null = null;
let soundMuted = false;

try {
  if (typeof window !== 'undefined') {
    soundMuted = localStorage.getItem('npt_sound_muted') === 'true';
  }
} catch {
  soundMuted = false;
}

export const isGlobalSoundMuted = (): boolean => soundMuted;

export const setGlobalSoundMuted = (muted: boolean) => {
  soundMuted = muted;
  try {
    localStorage.setItem('npt_sound_muted', String(muted));
  } catch {}
};

export const toggleGlobalSound = (): boolean => {
  const next = !soundMuted;
  setGlobalSoundMuted(next);
  return next;
};

/**
 * Realistic Computer Mouse Click Sound Generator using Web Audio API
 * Accurately synthesizes the crisp microswitch snap, spring buckle, and hollow plastic shell resonance of a computer mouse.
 */
export const playMouseClickSound = () => {
  if (soundMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // --- 1. Down-Click (Tactile Microswitch Snap) ---
    // High-pitched crisp switch snap
    const clickOsc = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    const clickFilter = audioCtx.createBiquadFilter();

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(2800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.009);

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2600, now);
    clickFilter.Q.setValueAtTime(3.5, now);

    clickGain.gain.setValueAtTime(0.32, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(audioCtx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.012);

    // Mouse plastic shell body acoustic resonance (subtle hollow thump)
    const bodyOsc = audioCtx.createOscillator();
    const bodyGain = audioCtx.createGain();

    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(450, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(140, now + 0.014);

    bodyGain.gain.setValueAtTime(0.2, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(audioCtx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.016);

    // Ultra-short microswitch tactile friction noise (3.5ms sharp click transient)
    const noiseSamples = Math.floor(audioCtx.sampleRate * 0.005);
    const noiseBuffer = audioCtx.createBuffer(1, noiseSamples, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseSamples; i++) {
      const envelope = Math.exp(-i / (noiseSamples * 0.25));
      noiseData[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(3200, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.005);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.005);

    // --- 2. Microswitch Reset Release (Subtle secondary tick ~28ms later) ---
    const releaseTime = now + 0.028;
    const releaseOsc = audioCtx.createOscillator();
    const releaseGain = audioCtx.createGain();
    const releaseFilter = audioCtx.createBiquadFilter();

    releaseOsc.type = 'triangle';
    releaseOsc.frequency.setValueAtTime(3200, releaseTime);
    releaseOsc.frequency.exponentialRampToValueAtTime(600, releaseTime + 0.007);

    releaseFilter.type = 'bandpass';
    releaseFilter.frequency.setValueAtTime(3000, releaseTime);
    releaseFilter.Q.setValueAtTime(4, releaseTime);

    releaseGain.gain.setValueAtTime(0.09, releaseTime);
    releaseGain.gain.exponentialRampToValueAtTime(0.001, releaseTime + 0.008);

    releaseOsc.connect(releaseFilter);
    releaseFilter.connect(releaseGain);
    releaseGain.connect(audioCtx.destination);

    releaseOsc.start(releaseTime);
    releaseOsc.stop(releaseTime + 0.009);
  } catch (err) {
    // Ignore audio autoplay restrictions gracefully
  }
};

// Aliases for backwards compatibility and ergonomic usage
export const playMetallicClickSound = playMouseClickSound;
export const playClickSound = playMouseClickSound;

export const playHenshinSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Siren / Charging Driver Sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.8);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.8);

    // Secondary metallic burst
    setTimeout(() => {
      playMetallicClickSound();
    }, 400);
  } catch (err) {
    // ignore
  }
};

// Belt mechanical item insert lock sound
export const playBeltInsertSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    // Dual clunk frequencies
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    // Second metallic latch click
    setTimeout(() => {
      playMetallicClickSound();
    }, 60);
  } catch {}
};

// Belt mechanical crank / lever ratcheting sound
export const playBeltCrankSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600 + i * 150, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      }, i * 65);
    }
  } catch {}
};

// Gavv Gochizo munching bouncy pop sound
export const playGochizoMunchSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {}
};

// Decade Card Scan electronic barcode sweep
export const playDecadeScanSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(2800, now + 0.15);
    osc.frequency.linearRampToValueAtTime(1600, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {}
};

// Rider Kick deep bass explosion
export const playRiderKickExplosionSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    // Sub-bass sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.7);

    // Noise crackle
    const bufferSize = audioCtx.sampleRate * 0.4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
  } catch {}
};

// Clock Up time dilation sound
export const playClockUpSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.5);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  } catch {}
};

// Royal Fanfare victory chords
export const playFanfareSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }, idx * 110);
    });
  } catch {}
};

// Card Draw swoosh
export const playCardDrawSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500, now);
    filter.Q.setValueAtTime(3, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } catch {}
};

// Laser / Energy blade clash
export const playLaserClashSound = () => {
  if (soundMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {}
};

// Tokusatsu Rider Finisher Kick / Critical Strike Sound
export const playFinisherSound = () => {
  if (soundMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    // Rising energy build-up
    const oscRise = audioCtx.createOscillator();
    const riseGain = audioCtx.createGain();
    oscRise.type = 'sawtooth';
    oscRise.frequency.setValueAtTime(180, now);
    oscRise.frequency.exponentialRampToValueAtTime(2400, now + 0.6);
    riseGain.gain.setValueAtTime(0.05, now);
    riseGain.gain.exponentialRampToValueAtTime(0.4, now + 0.55);
    riseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    oscRise.connect(riseGain);
    riseGain.connect(audioCtx.destination);
    oscRise.start(now);
    oscRise.stop(now + 0.65);

    // Explosive finisher impact
    setTimeout(() => {
      if (!audioCtx || soundMuted) return;
      const t = audioCtx.currentTime;
      const oscBoom = audioCtx.createOscillator();
      const boomGain = audioCtx.createGain();
      oscBoom.type = 'triangle';
      oscBoom.frequency.setValueAtTime(320, t);
      oscBoom.frequency.exponentialRampToValueAtTime(45, t + 0.8);
      boomGain.gain.setValueAtTime(0.5, t);
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      oscBoom.connect(boomGain);
      boomGain.connect(audioCtx.destination);
      oscBoom.start(t);
      oscBoom.stop(t + 0.85);
    }, 600);
  } catch {}
};

// Belt Standby Loop Chime
export const playStandbySound = () => {
  if (soundMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    [0, 0.15, 0.3, 0.45].forEach((offset, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      const freq = idx % 2 === 0 ? 880 : 1320;
      osc.frequency.setValueAtTime(freq, now + offset);
      gain.gain.setValueAtTime(0.18, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });
  } catch {}
};

// Full Tokusatsu Henshin Sequence Sound: Insert -> Standby -> Henshin Shockwave Burst
export const playHenshinSequenceSound = () => {
  if (soundMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    // 1. Mechanical Item Insertion click
    const clickOsc = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    clickOsc.connect(clickGain);
    clickGain.connect(audioCtx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.09);

    // 2. Rising Energy Charge
    const riseOsc = audioCtx.createOscillator();
    const riseGain = audioCtx.createGain();
    riseOsc.type = 'sawtooth';
    riseOsc.frequency.setValueAtTime(220, now + 0.1);
    riseOsc.frequency.exponentialRampToValueAtTime(1760, now + 0.55);
    riseGain.gain.setValueAtTime(0.05, now + 0.1);
    riseGain.gain.exponentialRampToValueAtTime(0.35, now + 0.5);
    riseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
    riseOsc.connect(riseGain);
    riseGain.connect(audioCtx.destination);
    riseOsc.start(now + 0.1);
    riseOsc.stop(now + 0.58);

    // 3. Henshin Explosion Burst at +0.55s
    setTimeout(() => {
      if (!audioCtx || soundMuted) return;
      const t = audioCtx.currentTime;

      // Sub-bass impact
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(150, t);
      subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.7);
      subGain.gain.setValueAtTime(0.6, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      subOsc.connect(subGain);
      subGain.connect(audioCtx.destination);
      subOsc.start(t);
      subOsc.stop(t + 0.75);

      // Heroic metallic chime chord (Major chord: E, G#, B, E)
      const chord = [659.25, 830.61, 987.77, 1318.51];
      chord.forEach((freq) => {
        const o = audioCtx!.createOscillator();
        const g = audioCtx!.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, t + 0.02);
        g.gain.setValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        o.connect(g);
        g.connect(audioCtx!.destination);
        o.start(t + 0.02);
        o.stop(t + 1.2);
      });
    }, 520);
  } catch {}
};

// Toast Notification Engine (Disabled top-right notification box as requested)
export const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  if (typeof window === 'undefined') return;
  // Ensure any existing toast container is cleanly removed
  const existingContainer = document.getElementById('npt-toast-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  // Log message quietly without creating visual banner in top-right
  console.log(`[Notification ${type}]:`, msg);
};

// Global click event listener to automatically play mouse click sound on all button and interactive clicks
if (typeof window !== 'undefined') {
  window.addEventListener(
    'click',
    (e) => {
      if (soundMuted) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('.cursor-pointer') ||
          target.closest('input[type="checkbox"]') ||
          target.closest('input[type="radio"]') ||
          target.closest('select') ||
          target.closest('[role="button"]') ||
          target.closest('[role="tab"]') ||
          target.getAttribute('role') === 'button')
      ) {
        playMouseClickSound();
      }
    },
    { capture: true }
  );
}

