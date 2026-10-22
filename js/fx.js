// small visual helpers: text scramble, scroll reveal, card tilt, dream whispers and the cursor
import { state, onChange } from './settings.js';
import { t } from './i18n.js';
import { rnd, pick, mk, lerp } from './util.js';

const GLYPHS = '▓▒░█/\\|[]<>+*#%&01';
const still = () => state.motion === 'off';
const calm = () => state.motion !== 'on';

export function scramble(el, text = el.textContent) {
  const token = (el._scramble = {});
  if (still() || !text) { el.textContent = text; return; }
  const total = state.motion === 'reduced' ? 12 : 26;
  let frame = 0;
  const step = () => {
    if (el._scramble !== token) return;
    const done = (frame / total) * text.length;
    let out = '';
    for (let i = 0; i < text.length; i++) out += text[i] === ' ' || i < done ? text[i] : pick(GLYPHS);
    el.textContent = out;
    if (frame++ < total) requestAnimationFrame(step);
    else el.textContent = text;
  };
  step();
}

// sets how many letters a giant word has so the css can size it to fit the screen
export function fit(root) {
  root.querySelectorAll('.mega').forEach(el => el.style.setProperty('--len', Math.max(4, el.textContent.trim().length)));
}

export function texts(root, animate = true) {
  fit(root);
  if (animate) root.querySelectorAll('[data-scramble]').forEach(el => scramble(el));
}

let observer = null;
export function reveal(root) {
  const items = [...root.querySelectorAll('.rv')];
  if (!('IntersectionObserver' in window) || still()) { items.forEach(el => el.classList.add('in')); return; }
  if (!observer) {
    observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      observer.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
  }
  items.forEach((el, i) => {
    el.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
    observer.observe(el);
  });
}

export function tilt(root) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  root.querySelectorAll('.tilt').forEach(el => {
    if (el.dataset.tilt) return;
    el.dataset.tilt = '1';
    el.addEventListener('pointermove', e => {
      if (calm() || !state.scene3d) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 9 + 'deg');
      el.style.setProperty('--rx', (0.5 - (e.clientY - r.top) / r.height) * 7 + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

// faint sentences that drift past, in the language of the page
let whisperTimer = 0, whisperIndex = (Math.random() * 12) | 0;
const WHISPERS = 12;
export function whispers() {
  clearTimeout(whisperTimer);
  const layer = document.getElementById('whispers');
  if (!layer) return;
  const next = () => {
    if (!calm() && !document.hidden && layer.children.length < 2) {
      const span = mk('span', 'whisper', layer, t('dream.' + (whisperIndex++ % WHISPERS)));
      span.style.left = rnd(4, 70) + '%';
      span.style.top = rnd(14, 84) + '%';
      span.addEventListener('animationend', () => span.remove());
    }
    whisperTimer = setTimeout(next, rnd(9000, 16000));
  };
  whisperTimer = setTimeout(next, 5000);
}

export function cursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const ring = mk('div', 'cursor', document.body);
  ring.setAttribute('aria-hidden', 'true');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, seen = false;
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    if (!seen) { seen = true; rx = x; ry = y; ring.classList.add('on'); }
    ring.classList.toggle('hot', !!e.target.closest && !!e.target.closest('a, button, input, select, textarea, summary, label, [role="button"]'));
  });
  document.addEventListener('pointerleave', () => ring.classList.remove('on'));
  const loop = () => {
    rx = lerp(rx, x, 0.22); ry = lerp(ry, y, 0.22);
    ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
    requestAnimationFrame(loop);
  };
  loop();
}

onChange(key => { if (key === 'motion' || key === '*') whispers(); });
