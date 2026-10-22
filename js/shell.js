// the parts of the page that never change between pages: header, language buttons, player, gate, counter
import { SITE } from '../config/site.js';
import * as audio from './audio.js';
import * as settings from './settings.js';
import { t, apply as translate, setTitle } from './i18n.js';
import { mk, store, fmtTime, clamp } from './util.js';

const $ = (sel, root = document) => root.querySelector(sel);

export function header() {
  const btn = $('.menu-btn'), menu = $('#menu');
  const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); };
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { close(); btn.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 1080) close(); });

  document.querySelectorAll('.lang button').forEach(b => {
    b.addEventListener('click', () => settings.set('lang', b.dataset.lang));
  });
  const gh = $('#gh-all');
  if (gh && SITE.github) gh.href = SITE.github + '?tab=repositories';
  markLang();
  settings.onChange(key => { if (key === 'lang' || key === '*') markLang(); });
}

function markLang() {
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === settings.state.lang)));
}

export function markPage(page) {
  document.querySelectorAll('#menu nav a').forEach(a => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  setTitle(page);
}

export function drift() {
  let timer = 0;
  const run = () => {
    clearTimeout(timer);
    if (settings.state.base !== 'drift' || settings.state.motion === 'off') return;
    timer = setTimeout(() => {
      document.body.dataset.base = document.body.dataset.base === 'dark' ? 'light' : 'dark';
      settings.paintAccent(document.body.dataset.base);
      run();
    }, 40000);
  };
  settings.onChange(key => { if (key === 'base' || key === 'motion' || key === '*') run(); });
  run();
}

// counts the visit with GoatCounter and shows the total in the footer
const skipFlag = () => {
  const me = new URLSearchParams(location.search).get('me');
  if (me === '1') store.set('skipcount', true);
  if (me === '0') store.del('skipcount');
  return store.get('skipcount', false);
};
export function count() {
  const code = SITE.goatcounter;
  if (!code || skipFlag() || location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  const path = location.pathname.replace(/\/index\.html$/, '/') || '/';
  new Image().src = `https://${code}.goatcounter.com/count?p=${encodeURIComponent(path)}&t=${encodeURIComponent(document.title)}&rnd=${Math.random().toString(36).slice(2)}`;
}
export function total() {
  const out = $('#visits'), code = SITE.goatcounter;
  if (!out) return;
  if (!code || location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') { out.textContent = '-'; return; }
  fetch(`https://${code}.goatcounter.com/counter/TOTAL.json`)
    .then(r => r.json())
    .then(d => { out.textContent = d.count || '-'; })
    .catch(() => { out.textContent = '-'; });
}

export function titleTricks() {
  let original = document.title;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { original = document.title; document.title = t('tab.away'); }
    else document.title = original;
  });
}

export function gate() {
  const entered = (() => { try { return sessionStorage.getItem('rdweeb:in'); } catch (e) { return null; } })();
  const remember = () => { try { sessionStorage.setItem('rdweeb:in', '1'); } catch (e) {} };
  const kickoff = () => {
    audio.unlock();
    if (settings.state.autoplay && !audio.state.playing) audio.play();
  };
  if (!settings.state.gate || entered) {
    if (settings.state.autoplay) {
      const once = () => { removeEventListener('pointerdown', once); removeEventListener('keydown', once); kickoff(); };
      addEventListener('pointerdown', once);
      addEventListener('keydown', once);
    }
    return;
  }
  const box = mk('div', 'gate', document.body);
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-labelledby', 'gate-h');
  const inner = mk('div', 'gate-in', box);
  mk('p', 'chip', inner, t('gate.chip'));
  const h = mk('h1', 'gate-h', inner, SITE.name.toUpperCase());
  h.id = 'gate-h';
  mk('p', 'lead', inner, t('gate.p'));
  const warn = mk('p', 'small', inner, t('gate.warn') + ' ');
  const link = mk('a', '', warn, t('gate.settings'));
  link.href = 'settings.html';
  const row = mk('div', 'cta', inner);
  const yes = mk('button', 'btn primary', row, t('gate.sound'));
  const no = mk('button', 'btn', row, t('gate.quiet'));
  const leave = play => {
    remember();
    box.classList.add('out');
    document.body.classList.remove('gated');
    setTimeout(() => box.remove(), 500);
    if (play) { audio.unlock(); audio.play(); }
  };
  yes.addEventListener('click', () => leave(true));
  no.addEventListener('click', () => leave(false));
  link.addEventListener('click', () => { remember(); box.remove(); document.body.classList.remove('gated'); });
  box.addEventListener('keydown', e => { if (e.key === 'Escape') leave(false); });
  document.body.classList.add('gated');
  yes.focus();
}

export function player() {
  const box = mk('aside', 'player', document.body);
  box.setAttribute('aria-label', t('player.label'));
  let pos = store.get('player', null);
  const head = mk('div', 'p-head', box);
  const grip = mk('span', 'p-grip', head, '::');
  grip.setAttribute('aria-hidden', 'true');
  const cover = mk('img', 'p-cover', head);
  cover.alt = '';
  const meta = mk('div', 'p-meta', head);
  const title = mk('b', 'p-title', meta);
  const artist = mk('span', 'p-artist', meta);
  const fold = mk('button', 'p-btn p-fold', head);
  const body = mk('div', 'p-body', box);
  const seek = mk('input', 'p-seek', body);
  seek.type = 'range'; seek.min = 0; seek.max = 1000; seek.value = 0;
  const times = mk('div', 'p-times', body);
  const cur = mk('span', '', times, '0:00'), dur = mk('span', '', times, '0:00');
  const row = mk('div', 'p-row', body);
  const prev = mk('button', 'p-btn', row, '|<');
  const play = mk('button', 'p-btn p-play', row);
  const next = mk('button', 'p-btn', row, '>|');
  const mute = mk('button', 'p-btn', row);
  const vol = mk('input', 'p-vol', row);
  vol.type = 'range'; vol.min = 0; vol.max = 100;

  const labels = () => {
    prev.setAttribute('aria-label', t('player.prev'));
    next.setAttribute('aria-label', t('player.next'));
    seek.setAttribute('aria-label', t('player.seek'));
    vol.setAttribute('aria-label', t('player.volume'));
    box.setAttribute('aria-label', t('player.label'));
    state();
  };
  const state = () => {
    play.textContent = audio.state.playing ? '||' : '>';
    play.setAttribute('aria-label', t(audio.state.playing ? 'player.pause' : 'player.play'));
    mute.textContent = audio.state.muted ? 'x' : 'o';
    mute.setAttribute('aria-label', t(audio.state.muted ? 'player.unmute' : 'player.mute'));
    mute.setAttribute('aria-pressed', String(audio.state.muted));
    vol.value = Math.round(audio.state.vol * 100);
    const folded = box.classList.contains('folded');
    fold.textContent = folded ? '+' : '-';
    fold.setAttribute('aria-label', t(folded ? 'player.open' : 'player.fold'));
    fold.setAttribute('aria-expanded', String(!folded));
    box.classList.toggle('playing', audio.state.playing);
  };
  const track = () => {
    const tr = audio.current();
    title.textContent = tr.title;
    artist.textContent = tr.artist;
    cover.hidden = !tr.cover;
    cover.onerror = () => { cover.hidden = true; };
    if (tr.cover) cover.src = tr.cover;
    dur.textContent = fmtTime(audio.duration());
  };
  box.classList.toggle('folded', store.get('playerFold', true));
  play.addEventListener('click', () => { audio.unlock(); audio.toggle(); });
  prev.addEventListener('click', () => audio.prev());
  next.addEventListener('click', () => audio.next());
  mute.addEventListener('click', () => { audio.toggleMute(); });
  vol.addEventListener('input', () => audio.setVolume(vol.value / 100));
  seek.addEventListener('input', () => audio.seekRatio(seek.value / 1000));
  fold.addEventListener('click', () => {
    box.classList.toggle('folded');
    store.set('playerFold', box.classList.contains('folded'));
    state();
    place();
  });
  audio.on('state', state); audio.on('volume', state); audio.on('track', track);
  audio.el.addEventListener('loadedmetadata', track);
  audio.el.addEventListener('timeupdate', () => {
    cur.textContent = fmtTime(audio.el.currentTime);
    const d = audio.duration();
    if (d && document.activeElement !== seek) seek.value = Math.round((audio.el.currentTime / d) * 1000);
  });
  settings.onChange(key => { if (key === 'lang' || key === '*') labels(); });

  // drag it by the header on wide screens, and keep it on screen
  function place() {
    if (innerWidth < 700 || !pos) { box.style.left = box.style.top = ''; return; }
    const r = box.getBoundingClientRect();
    box.style.left = clamp(pos.x, 8, innerWidth - r.width - 8) + 'px';
    box.style.top = clamp(pos.y, 8, innerHeight - r.height - 8) + 'px';
  }
  let drag = null;
  head.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || innerWidth < 700) return;
    const r = box.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    head.setPointerCapture(e.pointerId);
    box.classList.add('dragging');
  });
  head.addEventListener('pointermove', e => {
    if (!drag) return;
    const r = box.getBoundingClientRect();
    box.style.left = clamp(e.clientX - drag.dx, 8, innerWidth - r.width - 8) + 'px';
    box.style.top = clamp(e.clientY - drag.dy, 8, innerHeight - r.height - 8) + 'px';
  });
  head.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    box.classList.remove('dragging');
    const r = box.getBoundingClientRect();
    store.set('player', { x: r.left, y: r.top });
    pos = { x: r.left, y: r.top };
    box.classList.remove('docked');
  });
  addEventListener('resize', place);
  labels(); track(); place();
  box.classList.toggle('docked', !pos);
  return box;
}

export function translateAll() { translate(document); }
