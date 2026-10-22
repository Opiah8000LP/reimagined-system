export const TAU = Math.PI * 2;
export const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const pick = list => list[(Math.random() * list.length) | 0];
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// frame-rate independent easing with separate rise and fall speeds
export const smooth = (cur, target, up, down, dt) =>
  cur + (target - cur) * (1 - Math.pow(1 - (target > cur ? up : down), dt * 60));

export const fmtTime = s => {
  if (!isFinite(s) || s < 0) s = 0;
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
};

export function mk(tag, cls, parent, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  if (parent) parent.appendChild(el);
  return el;
}

export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('rdweeb:' + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('rdweeb:' + key, JSON.stringify(value)); } catch (e) {}
  },
  del(key) {
    try { localStorage.removeItem('rdweeb:' + key); } catch (e) {}
  }
};

// only web links and mail links are allowed anywhere on the site
export function safeUrl(url) {
  url = String(url || '').trim();
  return /^(https?:\/\/|mailto:)/i.test(url) ? url : '';
}

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
export const rgbToHex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

export const luminance = c => {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const box = mk('textarea', '', document.body);
    box.value = text;
    box.setAttribute('aria-hidden', 'true');
    box.className = 'offscreen';
    box.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) {}
    box.remove();
    return ok;
  }
}
