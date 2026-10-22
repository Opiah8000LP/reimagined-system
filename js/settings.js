import { store, hexToRgb, luminance, rgbToHex } from './util.js';

const osReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const osLang = (navigator.language || 'en').slice(0, 2).toLowerCase();

// one list drives the defaults, the validation and the settings page
export const SCHEMA = [
  { group: 'look', items: [
    { key: 'base', type: 'choice', options: ['dark', 'light', 'system', 'drift'], def: 'dark' },
    { key: 'accent', type: 'accent', def: '' },
    { key: 'glitch', type: 'choice', options: ['mix', 'rgb', 'slice', 'noise', 'melt', 'off'], def: 'mix' },
    { key: 'glitchAmt', type: 'range', min: 0, max: 100, step: 5, unit: '%', def: 60 },
    { key: 'motion', type: 'choice', options: ['on', 'reduced', 'off'], def: osReduced ? 'reduced' : 'on' }
  ] },
  { group: 'scene', items: [
    { key: 'beat', type: 'toggle', def: true },
    { key: 'beatAmt', type: 'range', min: 0, max: 200, step: 10, unit: '%', def: 100 },
    { key: 'scene3d', type: 'toggle', def: true },
    { key: 'grain', type: 'toggle', def: true },
    { key: 'transitions', type: 'toggle', def: true },
    { key: 'cursor', type: 'toggle', def: true }
  ] },
  { group: 'access', items: [
    { key: 'textSize', type: 'range', min: 80, max: 160, step: 5, unit: '%', def: 100 },
    { key: 'font', type: 'choice', options: ['default', 'readable', 'mono'], def: 'default' },
    { key: 'spacing', type: 'choice', options: ['normal', 'relaxed'], def: 'normal' },
    { key: 'contrast', type: 'choice', options: ['normal', 'high'], def: 'normal' },
    { key: 'focus', type: 'choice', options: ['normal', 'strong'], def: 'normal' },
    { key: 'underline', type: 'toggle', def: false },
    { key: 'targets', type: 'toggle', def: false },
    { key: 'plain', type: 'toggle', def: false },
    { key: 'safe', type: 'toggle', def: true }
  ] },
  { group: 'sound', items: [
    { key: 'gate', type: 'toggle', def: true },
    { key: 'autoplay', type: 'toggle', def: false },
    { key: 'sfx', type: 'toggle', def: true }
  ] },
  { group: 'language', items: [
    { key: 'lang', type: 'choice', options: ['en', 'ru', 'de'], def: ['en', 'ru', 'de'].includes(osLang) ? osLang : 'en' }
  ] }
];

const items = SCHEMA.flatMap(g => g.items);
export const DEFAULTS = Object.fromEntries(items.map(i => [i.key, i.def]));
export const state = { ...DEFAULTS };

function accept(item, value) {
  if (item.type === 'toggle') return typeof value === 'boolean';
  if (item.type === 'range') return typeof value === 'number' && isFinite(value);
  if (item.type === 'choice') return item.options.includes(value);
  if (item.type === 'accent') return value === '' || !!hexToRgb(value);
  return false;
}
function clean(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const item of items) {
    let value = raw[item.key];
    if (!accept(item, value)) continue;
    if (item.type === 'range') value = Math.min(item.max, Math.max(item.min, value));
    out[item.key] = value;
  }
  return out;
}
Object.assign(state, clean(store.get('settings', {})));

const listeners = [];
export const onChange = fn => listeners.push(fn);

export function set(key, value) {
  const item = items.find(i => i.key === key);
  if (!item || !accept(item, value)) return;
  state[key] = value;
  save();
  apply();
  listeners.forEach(fn => fn(key));
}
export function reset() {
  Object.assign(state, DEFAULTS);
  store.del('settings');
  apply();
  listeners.forEach(fn => fn('*'));
}
function save() {
  const changed = {};
  for (const key in state) if (state[key] !== DEFAULTS[key]) changed[key] = state[key];
  store.set('settings', changed);
}

// a short code people can copy to move their settings to another device
export const exportCode = () => btoa(JSON.stringify(Object.fromEntries(Object.keys(state).filter(k => state[k] !== DEFAULTS[k]).map(k => [k, state[k]]))));
export function importCode(code) {
  try {
    const data = clean(JSON.parse(atob(code.trim())));
    Object.assign(state, DEFAULTS, data);
    save();
    apply();
    listeners.forEach(fn => fn('*'));
    return true;
  } catch (e) { return false; }
}

// dark / light after resolving "system"; drift starts dark and the scene swaps it
export function resolvedBase() {
  if (state.base === 'system') return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  return state.base === 'light' ? 'light' : 'dark';
}

// default accents: purple on black, blue on white. a custom accent replaces both
export const DEFAULT_ACCENT = { dark: [150, 107, 255], light: [52, 84, 230] };
export function accentFor(base) {
  return hexToRgb(state.accent) || DEFAULT_ACCENT[base];
}

export function apply() {
  const root = document.documentElement, body = document.body;
  root.style.fontSize = state.textSize + '%';
  root.style.setProperty('--gl', state.glitchAmt / 100);
  const d = root.dataset;
  d.motion = state.motion;
  d.glitch = state.glitchAmt === 0 ? 'off' : state.glitch;
  d.contrast = state.contrast;
  d.font = state.font;
  d.spacing = state.spacing;
  d.focus = state.focus;
  root.classList.toggle('underline', state.underline);
  root.classList.toggle('targets', state.targets);
  root.classList.toggle('plain', state.plain);
  root.classList.toggle('no-grain', !state.grain);
  root.classList.toggle('no-cursor', !state.cursor);
  root.lang = state.lang;
  if (body) body.dataset.base = resolvedBase();
  paintAccent(resolvedBase());
}

export function paintAccent(base) {
  const rgb = accentFor(base);
  const root = document.documentElement.style;
  root.setProperty('--accent', rgbToHex(rgb));
  root.setProperty('--on-accent', luminance(rgb) > 0.42 ? '#0b0a12' : '#ffffff');
}
