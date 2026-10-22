// One <audio> element, a playlist around it, and a beat detector on the live spectrum.
// Two onset detectors watch the sound: low (kicks, 40-220 Hz) and high (hats and snares, 3-12 kHz).
// They compare how much new energy appeared against a running average, so any song and volume works.
import { PLAYLIST } from '../config/playlist.js';
import { SITE } from '../config/site.js';
import { clamp, smooth, store } from './util.js';

const FFT = 2048, BINS = FFT / 2;
const bins = new Uint8Array(BINS);
const before = new Float32Array(BINS);

// read by the scene every frame
export const feat = { bass: 0, mid: 0, high: 0, level: 0, beat: 0, tick: 0, lowN: 0, tickN: 0, real: false, freq: bins };

const listeners = {};
const emit = (name, data) => (listeners[name] || []).forEach(fn => fn(data));
export const on = (name, fn) => (listeners[name] = listeners[name] || []).push(fn);
const beatHandlers = [];
export const onBeat = fn => beatHandlers.push(fn);          // fn('low' | 'high', strength)

export const tracks = PLAYLIST.map((t, i) => ({
  title: t.title || 'Track ' + (i + 1), artist: t.artist || SITE.name,
  file: t.file, cover: t.cover || '', duration: 0, ok: null
}));

export const el = new Audio();
el.preload = 'metadata';
el.setAttribute('playsinline', '');

export const state = {
  index: 0, playing: false, want: false,
  vol: store.get('vol', 0.8), muted: store.get('muted', false)
};

let ctx = null, analyser = null, master = null, ready = false;

function context() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}
export function resume() {
  const c = context();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}
function connect() {
  if (ready) return;
  const c = context();
  if (!c) return;
  try {
    const src = c.createMediaElementSource(el);
    analyser = c.createAnalyser();
    analyser.fftSize = FFT;
    analyser.smoothingTimeConstant = 0.35;
    master = c.createGain();
    src.connect(analyser);
    analyser.connect(master);
    master.connect(c.destination);
    ready = true;
    applyVolume();
  } catch (e) { console.warn('beat detection unavailable', e); }
}
function applyVolume() {
  const v = state.muted ? 0 : Math.pow(state.vol, 1.6);
  if (ready) { master.gain.setTargetAtTime(v, ctx.currentTime, 0.03); el.volume = 1; }
  else el.volume = clamp(v, 0, 1);
}

// small interface blips, made with an oscillator so there are no sound files
export function blip(freq = 220, len = 0.08, type = 'square', gain = 0.03) {
  if (!ctx || state.muted || ctx.state !== 'running') return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + len);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + len);
}

export const current = () => tracks[state.index] || { title: '-', artist: '', cover: '', ok: false };

export function load(i, autoplay = false) {
  if (!tracks.length) return;
  state.index = ((i % tracks.length) + tracks.length) % tracks.length;
  el.src = tracks[state.index].file;
  el.loop = tracks.length === 1;
  el.load();
  emit('track', current());
  mediaSession();
  if (autoplay) play();
}
export function play() {
  if (!tracks.length) return;
  state.want = true;
  connect();
  resume();
  const p = el.play();
  if (p && p.catch) p.catch(err => { if (err && err.name === 'NotAllowedError') { state.want = false; emit('state'); } });
}
export const pause = () => { state.want = false; el.pause(); };
export const toggle = () => (el.paused ? play() : pause());
export const next = () => load(state.index + 1, state.want);
export const prev = () => { if (el.currentTime > 3) el.currentTime = 0; else load(state.index - 1, state.want); };
export const duration = () => (isFinite(el.duration) ? el.duration : 0);
export const seekRatio = r => { if (duration()) el.currentTime = clamp(r, 0, 1) * duration(); };

export function setVolume(v) {
  state.vol = clamp(v, 0, 1);
  if (state.vol > 0) state.muted = false;
  saveVolume();
}
export function toggleMute() { state.muted = !state.muted; saveVolume(); return state.muted; }
function saveVolume() { applyVolume(); store.set('vol', state.vol); store.set('muted', state.muted); emit('volume'); }

// browsers only allow sound after a tap, call this inside one
export function unlock() { connect(); resume(); }

el.addEventListener('play', () => { state.playing = true; emit('state'); });
el.addEventListener('pause', () => { state.playing = false; emit('state'); });
el.addEventListener('ended', () => { if (tracks.length > 1) load(state.index + 1, true); });
el.addEventListener('loadedmetadata', () => { tracks[state.index].duration = duration(); tracks[state.index].ok = true; emit('list'); });
el.addEventListener('error', () => {
  if (!el.getAttribute('src')) return;
  tracks[state.index].ok = false;
  state.playing = false;
  emit('list');
  emit('state');
  if (state.want && tracks.some(t => t.ok !== false)) setTimeout(next, 1000);
});

function mediaSession() {
  if (!('mediaSession' in navigator)) return;
  const t = current();
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title, artist: t.artist, album: SITE.name,
      artwork: t.cover ? [{ src: new URL(t.cover, document.baseURI).href }] : []
    });
  } catch (e) {}
}

// ---------- beat detection ----------
class Band {
  constructor(loHz, hiHz, gap, k, floor, memory) {
    Object.assign(this, { loHz, hiHz, gap, k, floor, memory, hist: [], last: -9, lo: 0, hi: 0, energy: 0 });
  }
  range(sampleRate) {
    const hz = sampleRate / 2 / BINS;
    this.lo = Math.max(1, Math.floor(this.loHz / hz));
    this.hi = Math.min(BINS - 1, Math.ceil(this.hiHz / hz));
  }
  step(now) {
    let flux = 0, energy = 0;
    for (let i = this.lo; i <= this.hi; i++) {
      const v = bins[i] / 255, d = v - before[i];
      if (d > 0) flux += d;
      energy += v;
      before[i] = v;
    }
    const n = this.hi - this.lo + 1;
    flux /= n;
    this.energy = energy / n;
    const mean = this.hist.length ? this.hist.reduce((a, b) => a + b, 0) / this.hist.length : 0;
    this.hist.push(flux);
    if (this.hist.length > this.memory) this.hist.shift();
    const limit = mean * this.k + this.floor;
    if (flux > limit && this.energy > 0.04 && now - this.last > this.gap) {
      this.last = now;
      return clamp(0.35 + (flux - limit) * 14, 0.35, 1);
    }
    return 0;
  }
}
const LOW = new Band(40, 220, 0.22, 1.7, 0.012, 36);
const MID = new Band(220, 3000, 1, 99, 99, 1);
const HIGH = new Band(3000, 12000, 0.05, 1.45, 0.006, 24);

// called once per frame by the scene. `fake` gives a slow idle pulse when nothing plays
export function update(dt, now) {
  let b = 0, m = 0, h = 0, real = false;
  if (ready && state.playing && ctx.state === 'running') {
    analyser.getByteFrequencyData(bins);
    let sum = 0;
    for (let i = 1; i < 300; i++) sum += bins[i];
    if (sum > 0) {
      real = true;
      [LOW, MID, HIGH].forEach(band => band.range(ctx.sampleRate));
      const lo = LOW.step(now), hi = HIGH.step(now);
      MID.step(now);
      b = LOW.energy; m = MID.energy; h = HIGH.energy;
      if (lo) { feat.beat = Math.max(feat.beat, lo); feat.lowN++; beatHandlers.forEach(f => f('low', lo)); }
      if (hi) { feat.tick = Math.max(feat.tick, hi); feat.tickN++; beatHandlers.forEach(f => f('high', hi)); }
    }
  }
  feat.real = real;
  feat.bass = smooth(feat.bass, clamp(b * 1.6, 0, 1), 0.3, 0.05, dt);
  feat.mid = smooth(feat.mid, clamp(m * 1.8, 0, 1), 0.4, 0.1, dt);
  feat.high = smooth(feat.high, clamp(h * 3.2, 0, 1), 0.75, 0.38, dt);
  feat.level = feat.bass * 0.5 + feat.mid * 0.3 + feat.high * 0.2;
  feat.beat *= Math.exp(-dt * 3.2);
  feat.tick *= Math.exp(-dt * 22);
}

export function init() {
  applyVolume();
  if ('mediaSession' in navigator) {
    const set = (action, fn) => { try { navigator.mediaSession.setActionHandler(action, fn); } catch (e) {} };
    set('play', play); set('pause', pause); set('previoustrack', prev); set('nexttrack', next);
  }
  load(store.get('track', 0), false);
  on('track', () => store.set('track', state.index));
  // quietly check every file once so the playlist can show durations and missing files
  setTimeout(() => tracks.forEach((t, i) => {
    if (i === state.index) return;
    const a = new Audio();
    a.preload = 'metadata';
    a.addEventListener('loadedmetadata', () => { t.duration = a.duration; t.ok = true; emit('list'); });
    a.addEventListener('error', () => { t.ok = false; emit('list'); });
    a.src = t.file;
  }), 600);
}
