// Synthesized sound for KodMaymunu. Every effect is built from a handful of
// oscillator and noise voices tuned to one C-major pentatonic palette, routed
// through a shared bus with a gentle compressor and a small room reverb, so
// the whole game sounds like one instrument. Nothing touches `window` until
// the first sound is requested, which keeps the module importable in Node.

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0];

let audioCtx = null;
let master = null;
let sfxBus = null;
let reverbSend = null;
let ambientBus = null;
let noiseBuffer = null;
let soundEnabled = true;
let ambientEnabled = true;
let currentWorld = 1;
let ambient = null;
let lastClickAt = 0;

function context() {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioCtor();
    } catch (_) {
      return null;
    }
    master = audioCtx.createGain();
    master.gain.value = 0.85;
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 12;
    compressor.ratio.value = 3.5;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.2;
    master.connect(compressor);
    compressor.connect(audioCtx.destination);

    sfxBus = audioCtx.createGain();
    sfxBus.gain.value = 0.9;
    sfxBus.connect(master);

    const reverb = audioCtx.createConvolver();
    reverb.buffer = impulseResponse(audioCtx, 1.8, 2.8);
    reverbSend = audioCtx.createGain();
    reverbSend.gain.value = 1;
    const reverbReturn = audioCtx.createGain();
    reverbReturn.gain.value = 0.22;
    reverbSend.connect(reverb);
    reverb.connect(reverbReturn);
    reverbReturn.connect(master);

    ambientBus = audioCtx.createGain();
    ambientBus.gain.value = 0;
    ambientBus.connect(master);

    noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = white * 0.6 + brown * 2.2;
    }

    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => {
        if (!audioCtx) return;
        if (document.hidden) audioCtx.suspend?.();
        else if (soundEnabled) audioCtx.resume?.();
      });
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume?.();
  if (soundEnabled && ambientEnabled && !ambient) startAmbient();
  return audioCtx;
}

function impulseResponse(ctx, seconds, decay) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

// One oscillator voice with an attack/decay envelope and an optional pitch glide.
function tone({ freq, type = 'sine', at = 0, dur = 0.2, gain = 0.1, attack = 0.006, glide = null, send = 0.15, detune = 0, bus = null }) {
  const ctx = audioCtx;
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glide), start + dur);
  osc.detune.value = detune;
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.linearRampToValueAtTime(gain, start + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp);
  amp.connect(bus || sfxBus);
  if (send > 0 && reverbSend) {
    const wet = ctx.createGain();
    wet.gain.value = send;
    amp.connect(wet);
    wet.connect(reverbSend);
  }
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

// A filtered slice of noise: footsteps, splashes, whooshes.
function noise({ at = 0, dur = 0.1, gain = 0.1, type = 'bandpass', freq = 1000, glide = null, q = 1, attack = 0.004, send = 0.08, bus = null }) {
  const ctx = audioCtx;
  const start = ctx.currentTime + at;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.playbackRate.value = 0.9 + Math.random() * 0.2;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, start);
  if (glide) filter.frequency.exponentialRampToValueAtTime(Math.max(40, glide), start + dur);
  filter.Q.value = q;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.linearRampToValueAtTime(gain, start + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  source.connect(filter);
  filter.connect(amp);
  amp.connect(bus || sfxBus);
  if (send > 0 && reverbSend) {
    const wet = ctx.createGain();
    wet.gain.value = send;
    amp.connect(wet);
    wet.connect(reverbSend);
  }
  const offset = Math.random() * 1.5;
  source.start(start, offset, dur + 0.05);
}

// A soft mallet note: fundamental plus a quiet octave, like a marimba.
function mallet(freq, at = 0, gain = 0.09, dur = 0.45) {
  tone({ freq, type: 'sine', at, dur, gain, attack: 0.004, send: 0.25 });
  tone({ freq: freq * 2, type: 'sine', at, dur: dur * 0.5, gain: gain * 0.35, attack: 0.003, send: 0.2 });
  tone({ freq: freq * 4.01, type: 'sine', at, dur: 0.06, gain: gain * 0.15, attack: 0.002, send: 0 });
}

function bell(freq, at = 0, gain = 0.06, dur = 1.4, bus = null) {
  tone({ freq, type: 'sine', at, dur, gain, attack: 0.003, send: 0.35, bus });
  tone({ freq: freq * 2.76, type: 'sine', at, dur: dur * 0.45, gain: gain * 0.3, attack: 0.002, send: 0.3, bus });
  tone({ freq: freq * 5.4, type: 'sine', at, dur: dur * 0.2, gain: gain * 0.12, attack: 0.002, send: 0.2, bus });
}

function play(fn) {
  if (!soundEnabled) return;
  try {
    if (!context()) return;
    fn();
  } catch (error) {
    // Sound is decoration; a failing voice must never break the game.
  }
}

// ── Ambience ────────────────────────────────────────────────────────────────
// Each island hums differently: leaves, surf, a temple drone, tide, wind.

const AMBIENCE = {
  1: { filter: 'lowpass', freq: 700, q: 0.6, level: 0.05, swell: 0.25, rate: 0.08, notes: [0, 2, 3, 4], voice: 'bird', every: [4, 8] },
  2: { filter: 'lowpass', freq: 520, q: 0.7, level: 0.07, swell: 0.6, rate: 0.12, notes: [2, 3, 4, 5], voice: 'mallet', every: [5, 9] },
  3: { filter: 'bandpass', freq: 420, q: 0.9, level: 0.04, swell: 0.3, rate: 0.05, notes: [0, 3, 5], voice: 'bell', every: [6, 11], drone: [130.81, 196.0] },
  4: { filter: 'lowpass', freq: 600, q: 0.7, level: 0.08, swell: 0.7, rate: 0.1, notes: [1, 3, 4, 6], voice: 'mallet', every: [5, 10] },
  5: { filter: 'bandpass', freq: 900, q: 1.4, level: 0.05, swell: 0.5, rate: 0.07, notes: [5, 7, 8, 10], voice: 'bell', every: [5, 9] }
};

function startAmbient() {
  if (!audioCtx || ambient || !ambientEnabled || !soundEnabled) return;
  const ctx = audioCtx;
  const recipe = AMBIENCE[currentWorld] || AMBIENCE[1];
  const nodes = { sources: [], timer: null };

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = recipe.filter;
  filter.frequency.value = recipe.freq;
  filter.Q.value = recipe.q;
  const level = ctx.createGain();
  level.gain.value = recipe.level;
  // A slow LFO gives surf and wind their breathing.
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = recipe.rate;
  lfoDepth.gain.value = recipe.level * recipe.swell;
  lfo.connect(lfoDepth);
  lfoDepth.connect(level.gain);
  source.connect(filter);
  filter.connect(level);
  level.connect(ambientBus);
  source.start();
  lfo.start();
  nodes.sources.push(source, lfo);

  if (recipe.drone) {
    for (const freq of recipe.drone) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.frequency.value = freq;
      amp.gain.value = 0.012;
      osc.connect(amp);
      amp.connect(ambientBus);
      osc.start();
      nodes.sources.push(osc);
    }
  }

  const scheduleNext = () => {
    const [min, max] = recipe.every;
    nodes.timer = setTimeout(() => {
      if (!ambient || !soundEnabled || !ambientEnabled) return;
      try {
        const note = PENTATONIC[recipe.notes[Math.floor(Math.random() * recipe.notes.length)]];
        if (recipe.voice === 'bird') {
          const base = 2200 + Math.random() * 900;
          for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
            tone({ freq: base, glide: base * 1.35, type: 'sine', at: i * 0.11, dur: 0.08, gain: 0.012, send: 0.4, bus: ambientBus });
          }
        } else if (recipe.voice === 'bell') {
          bell(note / 2, 0, 0.018, 2.4, ambientBus);
        } else {
          tone({ freq: note / 2, type: 'sine', dur: 0.9, gain: 0.018, attack: 0.01, send: 0.5, bus: ambientBus });
        }
      } catch (_) { /* ambience is optional */ }
      scheduleNext();
    }, (min + Math.random() * (max - min)) * 1000);
  };
  scheduleNext();

  ambientBus.gain.cancelScheduledValues(ctx.currentTime);
  ambientBus.gain.setValueAtTime(ambientBus.gain.value, ctx.currentTime);
  ambientBus.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2.5);
  ambient = nodes;
}

function stopAmbient(fade = 0.6) {
  if (!ambient) return;
  const nodes = ambient;
  ambient = null;
  clearTimeout(nodes.timer);
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  ambientBus.gain.cancelScheduledValues(now);
  ambientBus.gain.setValueAtTime(ambientBus.gain.value, now);
  ambientBus.gain.linearRampToValueAtTime(0, now + fade);
  for (const node of nodes.sources) {
    try { node.stop(now + fade + 0.05); } catch (_) { /* already stopped */ }
  }
}

export const soundEngine = {
  toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      context();
    } else {
      stopAmbient(0.2);
    }
    return soundEnabled;
  },

  isSoundEnabled() {
    return soundEnabled;
  },

  setAmbientEnabled(enabled) {
    ambientEnabled = Boolean(enabled);
    if (!ambientEnabled) stopAmbient();
    else if (soundEnabled && audioCtx) startAmbient();
    return ambientEnabled;
  },

  isAmbientEnabled() {
    return ambientEnabled;
  },

  // Switch the island ambience; the change crossfades on the next gesture.
  setWorld(worldId) {
    if (worldId === currentWorld) return;
    currentWorld = worldId;
    if (ambient) {
      stopAmbient(0.8);
      setTimeout(() => { if (soundEnabled && ambientEnabled) startAmbient(); }, 850);
    }
  },

  // Called from the first user gesture so ambience can start at all.
  unlock() {
    if (soundEnabled) context();
  },

  playStep(surface = 'grass') {
    play(() => {
      const vary = 0.92 + Math.random() * 0.16;
      if (surface === 'wood') {
        tone({ freq: 380 * vary, type: 'triangle', dur: 0.07, gain: 0.07, send: 0.1 });
        noise({ dur: 0.04, gain: 0.03, freq: 2400, q: 2 });
      } else if (surface === 'stone') {
        tone({ freq: 880 * vary, type: 'sine', dur: 0.035, gain: 0.04, send: 0.2 });
        noise({ dur: 0.03, gain: 0.04, type: 'highpass', freq: 2600 });
      } else if (surface === 'sand') {
        noise({ dur: 0.08, gain: 0.06, type: 'lowpass', freq: 1100 * vary, attack: 0.01 });
      } else if (surface === 'leaf') {
        tone({ freq: 620 * vary, glide: 900 * vary, dur: 0.07, gain: 0.05, send: 0.15 });
        noise({ dur: 0.05, gain: 0.02, type: 'lowpass', freq: 900 });
      } else if (surface === 'shell') {
        tone({ freq: 300 * vary, type: 'triangle', dur: 0.08, gain: 0.07, send: 0.15 });
      } else {
        noise({ dur: 0.05, gain: 0.05, freq: 1500 * vary, q: 0.8 });
        tone({ freq: 130 * vary, glide: 80, dur: 0.06, gain: 0.06, send: 0 });
      }
    });
  },

  playTurn() {
    play(() => noise({ dur: 0.12, gain: 0.035, freq: 700, glide: 1600, q: 1.2, attack: 0.03 }));
  },

  playWait() {
    play(() => {
      tone({ freq: 1250, type: 'sine', dur: 0.03, gain: 0.04, send: 0.2 });
      tone({ freq: 940, type: 'sine', at: 0.11, dur: 0.03, gain: 0.035, send: 0.2 });
    });
  },

  playPaddle() {
    play(() => noise({ dur: 0.16, gain: 0.05, type: 'lowpass', freq: 900, glide: 300, attack: 0.02 }));
  },

  playLeaf() {
    play(() => {
      tone({ freq: 520, glide: 190, dur: 0.2, gain: 0.05, send: 0.2 });
      tone({ freq: 900, glide: 1300, at: 0.12, dur: 0.05, gain: 0.02, send: 0.3 });
    });
  },

  // index: how many bananas were already taken in this run.
  playCoin(index = 0) {
    play(() => {
      const note = PENTATONIC[Math.min(PENTATONIC.length - 1, Math.max(0, index))];
      mallet(note, 0, 0.1, 0.5);
      tone({ freq: note * 1.5, type: 'sine', at: 0.06, dur: 0.18, gain: 0.03, send: 0.3 });
    });
  },

  playKey() {
    play(() => {
      [783.99, 1046.5, 1318.51].forEach((freq, i) => tone({ freq, type: 'triangle', at: i * 0.06, dur: 0.3, gain: 0.05, send: 0.35 }));
    });
  },

  playGate(delay = 0) {
    play(() => {
      tone({ freq: 150, glide: 90, at: delay, dur: 0.25, gain: 0.09, send: 0.1 });
      noise({ at: delay, dur: 0.12, gain: 0.05, type: 'lowpass', freq: 700 });
      bell(659.25, delay + 0.08, 0.04, 0.9);
    });
  },

  playSplash() {
    play(() => {
      noise({ dur: 0.5, gain: 0.12, type: 'lowpass', freq: 3200, glide: 350, attack: 0.01, send: 0.2 });
      tone({ freq: 240, glide: 90, dur: 0.25, gain: 0.07, send: 0.1 });
      tone({ freq: 392, type: 'triangle', at: 0.35, dur: 0.18, gain: 0.035, send: 0.2 });
      tone({ freq: 329.63, type: 'triangle', at: 0.52, dur: 0.24, gain: 0.035, send: 0.2 });
    });
  },

  playBump() {
    play(() => {
      tone({ freq: 230, glide: 150, dur: 0.18, gain: 0.08, send: 0.1 });
      noise({ dur: 0.03, gain: 0.05, freq: 900, q: 1 });
      tone({ freq: 392, type: 'triangle', at: 0.2, dur: 0.16, gain: 0.03, send: 0.2 });
      tone({ freq: 329.63, type: 'triangle', at: 0.36, dur: 0.22, gain: 0.03, send: 0.2 });
    });
  },

  // A kind "not quite": two soft falling notes, never a buzzer.
  playFail() {
    play(() => {
      tone({ freq: 392, type: 'triangle', dur: 0.18, gain: 0.05, send: 0.2 });
      tone({ freq: 311.13, type: 'triangle', at: 0.16, dur: 0.28, gain: 0.05, send: 0.25 });
    });
  },

  playStart() {
    play(() => {
      tone({ freq: 523.25, glide: 784, dur: 0.14, gain: 0.04, send: 0.2 });
      noise({ dur: 0.08, gain: 0.02, freq: 1800, glide: 3000 });
    });
  },

  playScenario() {
    play(() => {
      mallet(783.99, 0, 0.07);
      mallet(1046.5, 0.09, 0.07);
    });
  },

  playVictory() {
    play(() => {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => mallet(freq, i * 0.1, 0.09, 0.5));
      [523.25, 659.25, 783.99].forEach(freq => tone({ freq, type: 'triangle', at: 0.42, dur: 1.2, gain: 0.035, attack: 0.02, send: 0.4 }));
      bell(2093, 0.42, 0.03, 1.6);
    });
  },

  // Stars land one after another, each a step higher.
  playStar(index = 0) {
    play(() => {
      const note = [659.25, 783.99, 1046.5][Math.min(2, Math.max(0, index))];
      mallet(note, 0, 0.1, 0.6);
      tone({ freq: note * 2, type: 'sine', at: 0.04, dur: 0.25, gain: 0.03, send: 0.4 });
    });
  },

  playUnlock() {
    play(() => {
      [0, 2, 3, 5, 7].forEach((step, i) => tone({ freq: PENTATONIC[step], type: 'triangle', at: i * 0.07, dur: 0.35, gain: 0.04, send: 0.4 }));
      bell(PENTATONIC[9], 0.35, 0.03, 1.4);
    });
  },

  playClick() {
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    if (now - lastClickAt < 40) return;
    lastClickAt = now;
    play(() => tone({ freq: 1500, type: 'sine', dur: 0.025, gain: 0.025, send: 0 }));
  },

  playOpen() {
    play(() => noise({ dur: 0.2, gain: 0.025, freq: 500, glide: 1400, q: 0.9, attack: 0.05 }));
  }
};
