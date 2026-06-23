// Web Audio API Sound Effects Engine for KodMaymunu
let audioCtx = null;
let soundEnabled = true;
let ambientOsc = null;
let ambientGain = null;
let ambientInterval = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (soundEnabled && !ambientOsc) {
    playAmbient();
  }
}

function playAmbient() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (ambientOsc) return; // already playing

    // Low gentle forest background drone (wind sound)
    ambientOsc = audioCtx.createOscillator();
    ambientGain = audioCtx.createGain();

    ambientOsc.type = 'sine';
    ambientOsc.frequency.setValueAtTime(65.41, audioCtx.currentTime); // C2 (Low drone)
    
    ambientGain.gain.setValueAtTime(0.015, audioCtx.currentTime); // extremely quiet background pad
    
    ambientOsc.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);
    ambientOsc.start();

    // Periodic wind chime / pentatonic bell sounds
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C4, D4, E4, G4, A4 (Pentatonic)
    
    ambientInterval = setInterval(() => {
      if (!soundEnabled || audioCtx.state === 'suspended') return;
      
      if (Math.random() > 0.4) {
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        // Very slow attack and release chime bubble
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.008, audioCtx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.5);

        osc.start();
        osc.stop(audioCtx.currentTime + 3.5);
      }
    }, 4000);

  } catch (e) {
    console.warn("Ambient play error", e);
  }
}

function stopAmbient() {
  if (ambientOsc) {
    try {
      ambientOsc.stop();
      ambientOsc.disconnect();
    } catch(e) {}
    ambientOsc = null;
  }
  if (ambientGain) {
    try {
      ambientGain.disconnect();
    } catch(e) {}
    ambientGain = null;
  }
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}

export const soundEngine = {
  toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      playAmbient();
    } else {
      stopAmbient();
    }
    return soundEnabled;
  },

  isSoundEnabled() {
    return soundEnabled;
  },


  playStep() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'triangle';
      // Quick pitch slide down for a stepping sound
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  },

  playCoin() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      // Double note arpeggio for collecting banana
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.setValueAtTime(0.1, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  },

  playVictory() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const now = audioCtx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50]; // C4, E4, G4, C5, E5, C6
      const duration = 0.12;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * duration);

        gain.gain.setValueAtTime(0, now + idx * duration);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * duration + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * duration + duration + 0.1);

        osc.start(now + idx * duration);
        osc.stop(now + idx * duration + duration + 0.1);
      });
    } catch (e) {
      console.warn("Audio play error", e);
    }
  },

  playFail() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sawtooth';
      // Low tone pitch drop
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }
};
