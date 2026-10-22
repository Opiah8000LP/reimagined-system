import { SITE } from '../../config/site.js';
import { t, L } from '../i18n.js';
import { mk, store, copyText, safeUrl } from '../util.js';
import { anchor } from '../ui.js';

const field = id => document.getElementById(id);
const extras = () => store.get('extraLinks', []).filter(x => x && typeof x.label === 'string');

function item(list, c, local) {
  const li = mk('li', 'link-card rv tilt', list);
  mk('b', 'link-label', li, c.label);
  if (local) mk('span', 'chip', li, t('owner.local'));
  mk('span', 'link-handle', li, c.handle || '');
  const row = mk('div', 'cta', li);
  if (safeUrl(c.url)) anchor(row, 'btn primary', t('contact.open'), c.url);
  if (c.handle) {
    const b = mk('button', 'btn', row, t('contact.copy'));
    b.type = 'button';
    b.addEventListener('click', async () => {
      const ok = await copyText(c.handle);
      field('contact-status').textContent = ok ? t('contact.copied', { v: c.handle }) : t('contact.copyfail');
    });
  }
}

function snippet() {
  const lines = extras().map(x => `    { label: ${JSON.stringify(x.label)}, handle: ${JSON.stringify(x.handle || '')}, url: ${JSON.stringify(x.url || '')} },`);
  field('ow-snip').value = lines.length ? lines.join('\n') : t('owner.snip.empty');
}

function drawExtras() {
  const ul = field('extra');
  ul.replaceChildren();
  extras().forEach((x, i) => {
    const li = mk('li', '', ul);
    mk('span', '', li, x.label + (x.handle ? ' - ' + x.handle : ''));
    const b = mk('button', 'btn small-btn', li, t('owner.remove'));
    b.type = 'button';
    b.setAttribute('aria-label', t('owner.remove') + ': ' + x.label);
    b.addEventListener('click', () => {
      const list = extras();
      list.splice(i, 1);
      store.set('extraLinks', list);
      draw();
    });
  });
  snippet();
}

function draw() {
  const list = field('links');
  list.replaceChildren();
  SITE.contacts.forEach(c => item(list, c, false));
  if (SITE.discord && SITE.discord.handle) item(list, { label: 'Discord', handle: SITE.discord.handle, url: SITE.discord.url }, false);
  if (SITE.email) item(list, { label: t('contact.email'), handle: SITE.email, url: 'mailto:' + SITE.email }, false);
  extras().forEach(c => item(list, c, true));
  drawExtras();
  list.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
}

export function init() {
  field('note').textContent = L(SITE.note);
  draw();
  const add = field('ow-add');
  if (add.dataset.bound) return;
  add.dataset.bound = '1';
  add.addEventListener('click', () => {
    const label = field('ow-label').value.trim(), handle = field('ow-handle').value.trim(), url = field('ow-url').value.trim();
    const status = field('ow-status');
    if (!label) { status.textContent = t('owner.err.label'); field('ow-label').focus(); return; }
    if (url && !safeUrl(url)) { status.textContent = t('owner.err.url'); field('ow-url').focus(); return; }
    const list = extras();
    if (list.length >= 20) { status.textContent = t('owner.err.full'); return; }
    list.push({ label, handle, url });
    store.set('extraLinks', list);
    ['ow-label', 'ow-handle', 'ow-url'].forEach(id => { field(id).value = ''; });
    status.textContent = t('owner.added');
    draw();
  });
  field('ow-copy').addEventListener('click', async () => {
    field('ow-status').textContent = t(await copyText(field('ow-snip').value) ? 'owner.copied' : 'contact.copyfail');
  });
}
