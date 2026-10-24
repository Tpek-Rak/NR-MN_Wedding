// Web Audio API Procedural Audio Engine
let audioCtx = null;
let masterGain = null;
let bgMusicAudio = null;
let synthMusicState = null;
let isAudioActive = false;
let audioUrlChecked = null;

const initAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.8;
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play realistic paper unfold sound
export const playPaperSound = () => {
  const ctx = initAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.45;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2400;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.value = 0.12;

  source.connect(filter).connect(gain).connect(masterGain);
  source.start(now);
};

// Play crystal chime note
const playBellNote = (freq, time, vol = 0.07) => {
  if (!audioCtx) return;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const noteGain = audioCtx.createGain();

  osc1.type = "sine";
  osc2.type = "triangle";
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 2.01;

  const harmGain = audioCtx.createGain();
  harmGain.gain.value = 0.18;

  osc1.connect(noteGain);
  osc2.connect(harmGain).connect(noteGain);
  noteGain.connect(masterGain);

  noteGain.gain.setValueAtTime(0, time);
  noteGain.gain.linearRampToValueAtTime(vol, time + 0.01);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 2.6);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 2.7);
  osc2.stop(time + 2.7);
};

// Play triple ceremonial chime
export const playChimeSound = () => {
  const ctx = initAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playBellNote(659.25, now + 0.05, 0.08);
  playBellNote(783.99, now + 0.22, 0.07);
  playBellNote(1046.50, now + 0.42, 0.06);
};

// Play water ripple droplet sound
export const playWaterDropSound = () => {
  const ctx = initAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

  osc.connect(gain).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.32);
};

// Generative ambient meditative chime synthesis
const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

const startSynthMusic = () => {
  const ctx = initAudioContext();
  if (!ctx) return;

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0;
  droneGain.connect(masterGain);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;
  filter.connect(droneGain);

  const droneOscs = [130.81, 196.00, 131.20].map((freq) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    o.connect(filter);
    o.start();
    return o;
  });

  droneGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 3);

  let timer = null;
  const scheduleNote = () => {
    const time = ctx.currentTime + 0.05;
    const note = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
    playBellNote(note, time, 0.04);
    if (Math.random() < 0.35) {
      const harm = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      playBellNote(harm, time + 0.32, 0.03);
    }
    timer = setTimeout(scheduleNote, 1600 + Math.random() * 2400);
  };
  scheduleNote();

  synthMusicState = {
    stop() {
      clearTimeout(timer);
      droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setTimeout(() => droneOscs.forEach((o) => o.stop()), 1400);
    }
  };
};

const checkAudioUrl = async (url) => {
  if (audioUrlChecked !== null) return audioUrlChecked;
  try {
    const res = await fetch(url, { method: "HEAD" });
    audioUrlChecked = res.ok;
  } catch {
    audioUrlChecked = false;
  }
  return audioUrlChecked;
};

const fadeVolume = (audioEl, targetVol, callback) => {
  const startVol = audioEl.volume;
  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / 1200);
    audioEl.volume = startVol + (targetVol - startVol) * progress;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (callback) {
      callback();
    }
  };
  requestAnimationFrame(step);
};

export const setMusicActive = async (active, url = "/audio/music.mp3") => {
  isAudioActive = active;
  if (active) {
    initAudioContext();
    const hasAudioFile = await checkAudioUrl(url);
    if (hasAudioFile) {
      if (!bgMusicAudio) {
        bgMusicAudio = new Audio(url);
        bgMusicAudio.loop = true;
        bgMusicAudio.volume = 0;
      }
      bgMusicAudio.play().catch(() => {});
      fadeVolume(bgMusicAudio, 0.55);
    } else {
      if (!synthMusicState) {
        startSynthMusic();
      }
    }
  } else {
    if (bgMusicAudio) {
      fadeVolume(bgMusicAudio, 0, () => bgMusicAudio.pause());
    }
    if (synthMusicState) {
      synthMusicState.stop();
      synthMusicState = null;
    }
  }
  return isAudioActive;
};

export const getMusicActive = () => isAudioActive;
