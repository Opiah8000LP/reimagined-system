import * as settings from '../settings.js';
import { t } from '../i18n.js';
import { mk, copyText, rgbToHex } from '../util.js';

const { SCHEMA, state } = settings;
const SWATCHES = ['#966bff', '#3454e6', '#ff4fa3', '#ff3b5c', '#ff9a3c', '#e8e22e', '#3dff9a', '#3cd9ff'];
const PRESETS = [{ id: 'dark', base: 'dark', accent: '' }, { id: 'light', base: 'light', accent: '' }];

let syncs = [];
let host = null;

function toggle(row, item) {
  const b = mk('button', 'switch', row);
  b.type = 'button';
  b.setAttribute('role', 'switch');
  b.setAttribute('aria-labelledby', 'lbl-' + item.key);
  b.addEventListener('click', () => settings.set(item.key, !state[item.key]));
  mk('span', 'knob', b).setAttribute('aria-hidden', 'true');
  const text = mk('span', 'switch-text', b);
  text.setAttribute('aria-hidden', 'true');
  syncs.push(() => { b.setAttribute('aria-checked', String(state[item.key])); text.textContent = t(state[item.key] ? 'set.on' : 'set.off'); });
}

function range(row, item) {
  const wrap = mk('div', 'range', row);
  const input = mk('input', '', wrap);
  input.type = 'range'; input.min = item.min; input.max = item.max; input.step = item.step;
  input.setAttribute('aria-labelledby', 'lbl-' + item.key);
  const out = mk('output', '', wrap);
  input.addEventListener('input', () => settings.set(item.key, Number(input.value)));
  syncs.push(() => { input.value = state[item.key]; out.textContent = state[item.key] + item.unit; });
}

function choice(row, item) {
  const group = mk('div', 'seg', row);
  group.setAttribute('role', 'group');
  group.setAttribute('aria-labelledby', 'lbl-' + item.key);
  const buttons = item.options.map(opt => {
    const b = mk('button', '', group, t('set.' + item.key + '.' + opt));
    b.type = 'button';
    b.addEventListener('click', () => settings.set(item.key, opt));
    return [opt, b];
  });
  syncs.push(() => buttons.forEach(([opt, b]) => b.setAttribute('aria-pressed', String(state[item.key] === opt))));
}

function accent(row, item) {
  const wrap = mk('div', 'accent', row);
  const def = mk('button', 'swatch default', wrap, t('set.accent.default'));
  def.type = 'button';
  def.addEventListener('click', () => settings.set('accent', ''));
  const dots = SWATCHES.map(hex => {
    const b = mk('button', 'swatch', wrap);
    b.type = 'button';
    b.style.background = hex;
    b.setAttribute('aria-label', hex);
    b.addEventListener('click', () => settings.set('accent', hex));
    return [hex, b];
  });
  const pick = mk('input', 'picker', wrap);
  pick.type = 'color';
  pick.setAttribute('aria-label', t('set.accent.custom'));
  pick.addEventListener('input', () => settings.set('accent', pick.value));
  syncs.push(() => {
    def.setAttribute('aria-pressed', String(state.accent === ''));
    dots.forEach(([hex, b]) => b.setAttribute('aria-pressed', String(state.accent === hex)));
    pick.value = state.accent || rgbToHex(settings.accentFor(settings.resolvedBase()));
  });
}

const BUILD = { toggle, range, choice, accent };

function presets(box) {
  box.replaceChildren();
  const buttons = PRESETS.map(p => {
    const b = mk('button', 'preset ' + p.id, box);
    b.type = 'button';
    mk('span', 'preset-chip', b).setAttribute('aria-hidden', 'true');
    mk('b', '', b, t('set.preset.' + p.id));
    mk('span', 'small', b, t('set.preset.' + p.id + '.d'));
    b.addEventListener('click', () => { settings.set('base', p.base); settings.set('accent', p.accent); });
    return [p, b];
  });
  syncs.push(() => buttons.forEach(([p, b]) => b.setAttribute('aria-pressed', String(state.base === p.base && state.accent === p.accent))));
}

function groups(box) {
  box.replaceChildren();
  SCHEMA.forEach((g, gi) => {
    const sec = mk('section', 'block set-group rv', box);
    const h = mk('h2', 'h2', sec);
    mk('span', 'num', h, String(gi + 2).padStart(2, '0'));
    mk('span', '', h, t('set.g.' + g.group));
    g.items.forEach(item => {
      const row = mk('div', 'set-row', sec);
      const text = mk('div', 'set-text', row);
      const label = mk('span', 'set-label', text, t('set.' + item.key));
      label.id = 'lbl-' + item.key;
      mk('span', 'set-desc', text, t('set.' + item.key + '.d'));
      BUILD[item.type](row, item);
    });
  });
}

function sync() { syncs.forEach(fn => fn()); }

export function init(root) {
  syncs = [];
  host = root;
  presets(root.querySelector('#presets'));
  groups(root.querySelector('#groups'));
  sync();
  const code = root.querySelector('#code'), status = root.querySelector('#set-status');
  code.value = settings.exportCode();
  if (code.dataset.bound) return;
  code.dataset.bound = '1';
  root.querySelector('#code-copy').addEventListener('click', async () => {
    code.value = settings.exportCode();
    status.textContent = t(await copyText(code.value) ? 'settings.copied' : 'contact.copyfail');
  });
  root.querySelector('#code-load').addEventListener('click', () => {
    status.textContent = t(settings.importCode(code.value) ? 'settings.loaded' : 'settings.badcode');
  });
  root.querySelector('#reset').addEventListener('click', () => {
    settings.reset();
    status.textContent = t('settings.done');
  });
}

settings.onChange(() => { if (host && document.contains(host)) { sync(); const c = host.querySelector('#code'); if (c && document.activeElement !== c) c.value = settings.exportCode(); } });
