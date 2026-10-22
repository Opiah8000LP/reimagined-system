// The animated background: one canvas, one scene per page, a glitch pass on top.
// Everything reacts to the music through audio.feat (see audio.js).
import * as audio from './audio.js';
import { state, onChange, accentFor } from './settings.js';
import { TAU, rnd, pick, clamp, lerp, mix3, rgba, smooth } from './util.js';
import { SHAPES, drawWire, crescent, circle } from './shapes.js';

const BASES = { dark: { bg: [7, 6, 12], fg: [236, 233, 247] }, light: { bg: [243, 242, 249], fg: [14, 12, 24] } };

let cv, ctx, W = 0, H = 0, dpr = 1;
let running = false, last = 0, slow = 0, fast = 0;
let current = null, previous = null, fade = 1;
const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
const glitch = { type: '', until: 0, next: 0, last: -9, edge: false };

// everything a scene needs, refreshed every frame
const S = {
  w: 0, h: 0, t: 0, a: 1, q: 1, d3: 1,
  bg: BASES.dark.bg.slice(), fg: BASES.dark.fg.slice(), acc: accentFor('dark').slice(),
  bass: 0, mid: 0, high: 0, kick: 0, tick: 0, mx: 0.5, my: 0.5
};

const alpha = (c, a) => { c.globalAlpha = clamp(a * S.a, 0, 1); };

function dome() {
  const dust = Array.from({ length: 560 }, () => {
    const th = rnd(TAU), ph = Math.acos(rnd(-1, 1));
    return [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th), rnd(0.4, 1)];
  });
  return c => {
    const cx = S.w * (S.w > 800 ? 0.64 : 0.5), cy = S.h * 0.5;
    const R = Math.min(S.w, S.h) * (S.w > 800 ? 0.4 : 0.36) * (1 + S.bass * 0.12 + S.kick * 0.08);
    const ry = S.t * 0.12 * (S.d3 ? 1 : 0.2), rx = -0.35 + (S.my - 0.5) * 0.5 * S.d3, rz = (S.mx - 0.5) * 0.6 * S.d3;
    const cyr = Math.cos(ry), syr = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx);
    const n = (dust.length * S.q) | 0;
    c.fillStyle = rgba(S.fg);
    for (let i = 0; i < n; i++) {
      const p = dust[i];
      const x1 = p[0] * cyr + p[2] * syr, z1 = -p[0] * syr + p[2] * cyr;
      const y2 = p[1] * cxr - z1 * sxr, z2 = p[1] * sxr + z1 * cxr;
      const k = 2.8 / (2.8 - z2), s = (0.5 + p[3] * 1.4 + S.high * 1.2) * k * (S.q > 0.7 ? 1 : 1.4);
      alpha(c, 0.12 + 0.5 * (z2 + 1) * p[3]);
      c.fillRect(cx + (x1 + rz * y2) * R * k - s / 2, cy + y2 * R * k - s / 2, s, s);
    }
    alpha(c, 0.55);
    c.strokeStyle = rgba(S.acc);
    c.lineWidth = 1;
    drawWire(c, SHAPES.ico, cx, cy, R * 0.4, rx * 2 + S.t * 0.15 * S.d3, ry * 2.4, S.high * 0.035);
    alpha(c, 0.25);
    c.strokeStyle = rgba(S.fg);
    c.beginPath();
    c.ellipse(cx, cy + R * 0.98, R * 1.15, R * 0.16, 0, 0, TAU);
    c.stroke();
    c.save();
    c.translate(S.w * 0.1, S.h * 0.2);
    c.rotate(-0.4 + S.t * 0.05);
    alpha(c, 0.5);
    c.strokeStyle = rgba(S.acc);
    crescent(c, 26 + S.bass * 8);
    c.restore();
  };
}

function collage() {
  const frames = Array.from({ length: 10 }, (_, i) => ({
    x: rnd(0.08, 0.92), y: rnd(0.1, 0.9), w: rnd(0.12, 0.3), h: rnd(0.1, 0.28), r: rnd(-0.2, 0.2),
    s: rnd(0.08, 0.22), ph: rnd(TAU), fill: i % 3 === 0
  }));
  return c => {
    c.lineWidth = 1;
    frames.forEach((f, i) => {
      const w = f.w * S.w * (1 + S.bass * 0.05 + (i % 2 ? S.tick * 0.08 : 0)), h = f.h * S.h * (1 + S.bass * 0.05);
      c.save();
      c.translate(f.x * S.w + Math.sin(S.t * f.s + f.ph) * S.w * 0.02, f.y * S.h + Math.cos(S.t * f.s * 0.8 + f.ph) * S.h * 0.02);
      c.rotate(f.r + Math.sin(S.t * f.s) * 0.05 * S.d3);
      if (f.fill) { alpha(c, 0.05 + S.kick * 0.1); c.fillStyle = rgba(S.acc); c.fillRect(-w / 2, -h / 2, w, h); }
      alpha(c, 0.24);
      c.strokeStyle = rgba(S.fg);
      c.strokeRect(-w / 2, -h / 2, w, h);
      alpha(c, 0.14);
      c.beginPath();
      c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, h / 2);
      c.moveTo(-8, 0); c.lineTo(8, 0); c.moveTo(0, -8); c.lineTo(0, 8);
      c.stroke();
      c.restore();
    });
    alpha(c, 0.5);
    c.strokeStyle = rgba(S.acc);
    drawWire(c, SHAPES.cube, S.w * 0.14, S.h * 0.78, Math.min(S.w, S.h) * 0.12, S.t * 0.3 * S.d3, S.t * 0.4, S.high * 0.03);
    drawWire(c, SHAPES.octa, S.w * 0.88, S.h * 0.24, Math.min(S.w, S.h) * 0.1, -S.t * 0.25 * S.d3, S.t * 0.35, S.high * 0.03);
  };
}

function pipes() {
  const lines = [
    [[0.02, 0.2], [0.3, 0.2], [0.3, 0.45], [0.55, 0.45]],
    [[0.98, 0.78], [0.7, 0.78], [0.7, 0.58], [0.5, 0.58], [0.5, 0.92]],
    [[0.1, 0.9], [0.1, 0.66], [0.38, 0.66]],
    [[0.62, 0.02], [0.62, 0.3], [0.9, 0.3], [0.9, 0.12]]
  ];
  return c => {
    lines.forEach((pl, i) => {
      c.beginPath();
      pl.forEach((p, j) => (j ? c.lineTo(p[0] * S.w, p[1] * S.h) : c.moveTo(p[0] * S.w, p[1] * S.h)));
      c.lineJoin = 'round';
      c.setLineDash([]);
      c.lineWidth = 10;
      alpha(c, 0.07);
      c.strokeStyle = rgba(S.fg);
      c.stroke();
      c.lineWidth = 1.5;
      c.setLineDash([3, 16]);
      c.lineDashOffset = -S.t * 30 * (1 + S.bass * 2) * (i % 2 ? -1 : 1);
      alpha(c, 0.7);
      c.strokeStyle = rgba(S.acc);
      c.stroke();
    });
    c.setLineDash([]);
    const cx = S.w * (S.w > 800 ? 0.7 : 0.5), cy = S.h * 0.5, R = Math.min(S.w, S.h) * 0.3 * (1 + S.bass * 0.06 + S.kick * 0.04);
    c.lineWidth = 1;
    c.strokeStyle = rgba(S.fg);
    alpha(c, 0.3);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI + S.t * 0.18 * S.d3;
      c.beginPath();
      c.ellipse(cx, cy, R * Math.abs(Math.cos(a)), R, 0, 0, TAU);
      c.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const r = (lat * Math.PI) / 180;
      c.beginPath();
      c.ellipse(cx, cy + R * Math.sin(r), R * Math.cos(r), R * Math.cos(r) * 0.2, 0, 0, TAU);
      c.stroke();
    }
    alpha(c, 0.45);
    c.strokeStyle = rgba(S.acc);
    c.beginPath();
    c.arc(cx, cy, R, 0, TAU);
    c.stroke();
  };
}

function orbits() {
  const rings = Array.from({ length: 7 }, (_, i) => ({ r: 0.1 + i * 0.075, tilt: rnd(-0.5, 0.5), flat: rnd(0.35, 1), v: rnd(0.15, 0.5) * (i % 2 ? -1 : 1), ph: rnd(TAU) }));
  return c => {
    const cx = S.w * (S.w > 800 ? 0.68 : 0.5), cy = S.h * 0.5, base = Math.min(S.w, S.h);
    c.lineWidth = 1;
    rings.forEach((o, i) => {
      const r = base * o.r * (1 + S.bass * 0.05 * (i % 3) + S.kick * 0.03);
      const tilt = o.tilt + (S.mx - 0.5) * 0.3 * S.d3, flat = lerp(1, o.flat, S.d3);
      alpha(c, 0.2);
      c.strokeStyle = rgba(S.fg);
      c.beginPath();
      c.ellipse(cx, cy, r, r * flat, tilt, 0, TAU);
      c.stroke();
      const a = o.ph + S.t * o.v;
      const px = Math.cos(a) * r, py = Math.sin(a) * r * flat;
      const x = cx + px * Math.cos(tilt) - py * Math.sin(tilt), y = cy + px * Math.sin(tilt) + py * Math.cos(tilt);
      alpha(c, 0.9);
      c.fillStyle = rgba(i % 2 ? S.acc : S.fg);
      c.beginPath();
      c.arc(x, y, 3 + S.high * 3 + (i === 3 ? S.kick * 6 : 0), 0, TAU);
      c.fill();
      alpha(c, 0.4);
      c.strokeStyle = rgba(S.acc);
      circle(c, x, y, 9 + S.tick * 8);
    });
    c.save();
    c.translate(cx, cy);
    c.rotate(S.t * 0.08);
    alpha(c, 0.7);
    c.strokeStyle = rgba(S.acc);
    crescent(c, base * 0.05 * (1 + S.bass * 0.2));
    c.restore();
  };
}

function blobs() {
  const soft = Array.from({ length: 6 }, (_, i) => ({ x: rnd(0.1, 0.9), y: rnd(0.1, 0.9), r: rnd(0.18, 0.34), s: rnd(0.04, 0.1), ph: rnd(TAU), acc: i % 2 === 0 }));
  const stars = Array.from({ length: 30 }, () => ({ x: rnd(), y: rnd(), s: rnd(3, 9), ph: rnd(TAU), v: rnd(0.6, 1.8) }));
  const rings = [];
  return c => {
    if (glitch.edge && S.kick > 0.15 && rings.length < 4) rings.push({ x: S.w * rnd(0.3, 0.8), y: S.h * rnd(0.3, 0.7), r: 10, a: 0.5 });
    const base = Math.min(S.w, S.h);
    soft.forEach(b => {
      const x = (b.x + Math.sin(S.t * b.s + b.ph) * 0.06) * S.w, y = (b.y + Math.cos(S.t * b.s * 1.2 + b.ph) * 0.06) * S.h;
      const r = b.r * base * (1 + S.bass * 0.12);
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      const col = b.acc ? S.acc : S.fg;
      g.addColorStop(0, rgba(col, 0.3 * S.a));
      g.addColorStop(1, rgba(col, 0));
      c.globalAlpha = 1;
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    });
    stars.forEach(s => {
      const tw = 0.5 + 0.5 * Math.sin(S.t * s.v + s.ph), k = s.s * (0.5 + tw) * (1 + S.high * 0.6);
      const x = s.x * S.w, y = s.y * S.h;
      alpha(c, 0.15 + tw * 0.6);
      c.strokeStyle = rgba(S.fg);
      c.beginPath();
      c.moveTo(x - k, y); c.lineTo(x + k, y); c.moveTo(x, y - k); c.lineTo(x, y + k);
      c.stroke();
    });
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += (60 + S.bass * 80) * S.dt; r.a -= S.dt * 0.35;
      if (r.a <= 0) { rings.splice(i, 1); continue; }
      alpha(c, r.a);
      c.strokeStyle = rgba(S.acc);
      circle(c, r.x, r.y, r.r);
    }
  };
}

function floor() {
  return c => {
    const hy = S.h * 0.56, vx = S.w * (0.5 + (S.mx - 0.5) * 0.12 * S.d3);
    c.lineWidth = 1;
    c.strokeStyle = rgba(S.acc);
    for (let i = -14; i <= 14; i++) {
      alpha(c, 0.28);
      c.beginPath();
      c.moveTo(vx + i * S.w * 0.012, hy);
      c.lineTo(vx + i * S.w * 0.2, S.h);
      c.stroke();
    }
    const speed = 0.12 + S.bass * 0.25;
    S.floorPos = ((S.floorPos || 0) + speed * S.dt) % 1;
    for (let i = 0; i < 12; i++) {
      const k = Math.pow((i + S.floorPos) / 12, 2.2), y = hy + (S.h - hy) * k;
      alpha(c, 0.1 + k * 0.4);
      c.beginPath();
      c.moveTo(0, y); c.lineTo(S.w, y);
      c.stroke();
    }
    c.strokeStyle = rgba(S.fg);
    alpha(c, 0.8);
    c.beginPath();
    const n = 64, f = audio.feat;
    for (let i = 0; i <= n; i++) {
      const v = f.real ? f.freq[(i * 3 + 2) | 0] / 255 : 0.12 + 0.1 * Math.sin(S.t * 1.4 + i * 0.5) * Math.sin(i * 0.2);
      const x = (i / n) * S.w, y = hy - v * S.h * 0.18 * (state.beat ? 1 : 0.4);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    [[0.2, 0.3, 0.14, 0.18], [0.78, 0.22, 0.1, 0.22], [0.55, 0.4, 0.06, 0.12]].forEach((s, i) => {
      const w = s[2] * S.w, h = s[3] * S.h, y = s[1] * S.h + Math.sin(S.t * 0.6 + i * 2) * 10;
      alpha(c, 0.08 + S.kick * 0.1);
      c.fillStyle = rgba(S.acc);
      c.fillRect(s[0] * S.w - w / 2, y - h / 2, w, h);
      alpha(c, 0.35);
      c.strokeStyle = rgba(S.fg);
      c.strokeRect(s[0] * S.w - w / 2, y - h / 2, w, h);
    });
  };
}

function sky() {
  const clouds = Array.from({ length: 8 }, () => ({ x: rnd(), y: rnd(0.08, 0.6), r: rnd(0.1, 0.22), s: rnd(0.004, 0.012) }));
  const stars = Array.from({ length: 40 }, () => ({ x: rnd(), y: rnd(0.7), ph: rnd(TAU) }));
  return c => {
    const g = c.createLinearGradient(0, 0, 0, S.h);
    g.addColorStop(0, rgba(S.acc, 0.22 * S.a));
    g.addColorStop(1, rgba(S.acc, 0));
    c.globalAlpha = 1;
    c.fillStyle = g;
    c.fillRect(0, 0, S.w, S.h);
    stars.forEach(s => {
      alpha(c, 0.15 + 0.5 * Math.abs(Math.sin(S.t * 0.8 + s.ph)));
      c.fillStyle = rgba(S.fg);
      c.fillRect(s.x * S.w, s.y * S.h, 1.5, 1.5);
    });
    clouds.forEach(cl => {
      const x = ((cl.x + S.t * cl.s) % 1.3 - 0.15) * S.w, y = cl.y * S.h, r = cl.r * Math.min(S.w, S.h) * (1 + S.bass * 0.08);
      for (let i = 0; i < 4; i++) {
        const gx = x + (i - 1.5) * r * 0.7, gy = y + Math.sin(i * 2) * r * 0.2;
        const rg = c.createRadialGradient(gx, gy, 0, gx, gy, r);
        rg.addColorStop(0, rgba(S.fg, 0.16 * S.a));
        rg.addColorStop(1, rgba(S.fg, 0));
        c.fillStyle = rg;
        c.globalAlpha = 1;
        c.fillRect(gx - r, gy - r, r * 2, r * 2);
      }
    });
    c.strokeStyle = rgba(S.fg);
    c.lineWidth = 1;
    [0.16, 0.84].forEach((px, i) => {
      const x = px * S.w, top = S.h * 0.28;
      alpha(c, 0.55);
      c.beginPath();
      c.moveTo(x, top); c.lineTo(x, S.h);
      c.moveTo(x - 26, top + 22); c.lineTo(x + 26, top + 22);
      c.moveTo(x - 18, top + 48); c.lineTo(x + 18, top + 48);
      c.stroke();
      for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(x - 4, top + 70 + k * 26); c.lineTo(x + 4, top + 70 + k * 26); c.stroke(); }
    });
    for (let k = 0; k < 3; k++) {
      alpha(c, 0.4);
      c.beginPath();
      c.moveTo(S.w * 0.16 + 26 * (k ? 1 : -1) * 0, S.h * 0.28 + 22 + k * 13);
      c.quadraticCurveTo(S.w * 0.5, S.h * (0.4 + k * 0.05) + Math.sin(S.t * 0.5 + k) * 6 + S.bass * 12, S.w * 0.84, S.h * 0.28 + 22 + k * 13);
      c.stroke();
    }
  };
}

const MAKERS = { home: dome, portfolio: collage, services: pipes, contact: orbits, support: blobs, settings: floor, credits: sky };
const cache = {};
const sceneFor = name => cache[name] || (cache[name] = (MAKERS[name] || dome)());

export function setPage(name) {
  const next = sceneFor(name);
  if (next === current) return;
  previous = current;
  current = next;
  fade = previous ? 0 : 1;
  wake();
}

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 1.5);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  S.w = W; S.h = H;
  wake();
}

function palette(dt) {
  const base = document.body.dataset.base === 'light' ? 'light' : 'dark';
  const k = state.motion === 'off' ? 1 : 1 - Math.exp(-dt * 5);
  S.bg = mix3(S.bg, BASES[base].bg, k);
  S.fg = mix3(S.fg, BASES[base].fg, k);
  S.acc = mix3(S.acc, accentFor(base), k);
}

function readAudio(dt) {
  const f = audio.feat;
  const amt = state.beat ? (state.beatAmt / 100) * (state.motion === 'on' ? 1 : 0.3) : 0;
  const idle = 0.5 + 0.5 * Math.sin(S.t * 1.1);
  const idleOn = !f.real && state.motion === 'on';
  S.bass = clamp(f.bass * amt + (idleOn ? idle * 0.1 : 0), 0, 1.4);
  S.mid = f.mid * amt;
  S.high = f.high * amt;
  S.kick = f.beat * amt;
  S.tick = f.tick * amt;
  glitch.edge = f.lowN !== readAudio.lastN;
  readAudio.lastN = f.lowN;
}
readAudio.lastN = 0;

function startGlitch(now) {
  const amt = state.glitchAmt / 100;
  if (state.motion !== 'on' || state.glitch === 'off' || amt === 0) return;
  const gap = state.safe ? 0.45 : 0.12;
  const fromBeat = glitch.edge && S.kick > 0.25 && Math.random() < amt * 0.7;
  const fromTimer = now > glitch.next;
  if (!(fromBeat || fromTimer) || now - glitch.last < gap) return;
  glitch.type = state.glitch === 'mix' ? pick(['rgb', 'slice', 'noise', 'melt']) : state.glitch;
  glitch.until = now + rnd(0.08, 0.2) * (0.6 + amt);
  glitch.last = now;
  glitch.next = now + rnd(3, 8) / (0.3 + amt);
}

function glitchPass(c, now) {
  if (now > glitch.until) return;
  const amt = state.glitchAmt / 100, w = cv.width, h = cv.height;
  c.save();
  c.globalAlpha = 1;
  if (glitch.type === 'slice') {
    for (let i = 0, n = 3 + ((amt * 6) | 0); i < n; i++) {
      const y = rnd(h), sh = rnd(8, 60 * amt + 10);
      c.drawImage(cv, 0, y, w, sh, rnd(-70, 70) * amt * dpr, y, w, sh);
    }
  } else if (glitch.type === 'melt') {
    const cols = 16, cw = Math.ceil(w / cols);
    for (let i = 0; i < cols; i++) c.drawImage(cv, i * cw, 0, cw, h, i * cw, rnd(0, 36) * amt * dpr, cw, h);
  } else if (glitch.type === 'noise') {
    for (let i = 0; i < 40 * amt + 6; i++) {
      c.fillStyle = rgba(pick([S.acc, S.fg, S.bg]), rnd(0.2, 0.7));
      c.fillRect(rnd(w), rnd(h), rnd(6, 90) * dpr, rnd(2, 12) * dpr);
    }
  }
  c.restore();
}

// the red/cyan split is drawn as two ghost copies of the scene, so it works on dark and light
function ghosts(c, now, draw) {
  if (glitch.type !== 'rgb' || now > glitch.until) return;
  const d = 3 + 10 * (state.glitchAmt / 100);
  const keep = [S.fg, S.acc];
  [[[255, 50, 90], -d], [[40, 220, 255], d]].forEach(([col, dx]) => {
    S.fg = col; S.acc = col;
    c.save();
    c.translate(dx, 0);
    S.a *= 0.5;
    draw(c);
    c.restore();
  });
  [S.fg, S.acc] = keep;
}

function frame(ts) {
  if (!running) return;
  if (state.plain) { running = false; return; }
  const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
  last = ts;
  const still = state.motion === 'off';
  S.dt = dt;
  S.t += dt * (state.motion === 'reduced' ? 0.35 : still ? 0 : 1);
  S.d3 = state.scene3d && !still ? 1 : 0;
  mouse.x = smooth(mouse.x, mouse.tx, 0.08, 0.08, dt);
  mouse.y = smooth(mouse.y, mouse.ty, 0.08, 0.08, dt);
  S.mx = mouse.x; S.my = mouse.y;
  audio.update(dt, ts / 1000);
  palette(dt);
  readAudio(dt);
  startGlitch(ts / 1000);

  // keep the frame rate up on slow machines by drawing fewer particles
  slow = dt > 0.034 ? slow + 1 : 0;
  fast = dt < 0.02 ? fast + 1 : 0;
  if (slow > 40) { S.q = Math.max(0.35, S.q - 0.2); slow = 0; }
  if (fast > 400) { S.q = Math.min(1, S.q + 0.2); fast = 0; }

  const c = ctx;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.globalAlpha = 1;
  c.fillStyle = rgba(S.bg);
  c.fillRect(0, 0, S.w, S.h);
  const hx = S.mx * S.w, hy = S.my * S.h, hr = Math.max(S.w, S.h) * 0.5;
  const haze = c.createRadialGradient(hx, hy, 0, hx, hy, hr);
  haze.addColorStop(0, rgba(S.acc, 0.14 + S.bass * 0.06));
  haze.addColorStop(1, rgba(S.acc, 0));
  c.fillStyle = haze;
  c.fillRect(0, 0, S.w, S.h);

  fade = Math.min(1, fade + dt / 0.9);
  const draws = [];
  if (previous && fade < 1) draws.push([previous, 1 - fade]);
  draws.push([current, fade]);
  draws.forEach(([draw, a]) => {
    S.a = a;
    draw(c);
    ghosts(c, ts / 1000, draw);
    S.a = a;
  });
  c.globalAlpha = 1;
  c.setLineDash([]);
  glitchPass(c, ts / 1000);

  if (document.hidden) running = false;
  else if (still && fade >= 1 && S.settled) running = false;
  else { S.settled = still && fade >= 1 ? true : false; requestAnimationFrame(frame); }
}

function wake() {
  if (!cv || running || state.plain) return;
  running = true;
  S.settled = false;
  last = performance.now();
  requestAnimationFrame(frame);
}
export const requestDraw = wake;

export function init(canvas) {
  cv = canvas;
  ctx = cv.getContext('2d');
  if (!ctx) return;
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth; mouse.ty = e.clientY / innerHeight; if (state.motion === 'off') return; });
  document.addEventListener('visibilitychange', wake);
  onChange(wake);
  wake();
}
