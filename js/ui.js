// small builders shared by the page scripts
import { SITE } from '../config/site.js';
import { t, L } from './i18n.js';
import { mk, safeUrl } from './util.js';

// web links, mail links, or one of this site's own pages
export const href = url => safeUrl(url) || (/^[\w-]+\.html(#[\w-]*)?$/.test(String(url || '')) ? url : '');

export function anchor(parent, cls, text, url) {
  const a = mk('a', cls, parent, text);
  const target = href(url);
  if (target) a.href = target;
  if (/^https?:/i.test(target)) { a.target = '_blank'; a.rel = 'noopener'; }
  return a;
}

export const statusChip = (parent, status) => mk('span', 'status ' + status, parent, t('status.' + status));

export const realProjects = () => SITE.projects.filter(p => !p.sample);

export function projectCard(list, p, i) {
  const card = mk('li', 'card rv tilt', list);
  card.dataset.type = p.type;
  const thumb = mk('div', 'thumb t-' + p.type, card);
  thumb.setAttribute('aria-hidden', 'true');
  if (p.image) {
    const img = mk('img', '', thumb);
    img.alt = '';
    img.loading = 'lazy';
    img.src = p.image;
    img.onerror = () => img.remove();
  }
  mk('span', 'thumb-word', thumb, t('type.' + p.type));
  if (p.sample) mk('span', 'sample', thumb, t('sample'));

  const body = mk('div', 'card-body', card);
  const meta = mk('div', 'meta', body);
  mk('span', 'chip', meta, t('type.' + p.type));
  if (p.year) mk('span', 'year', meta, String(p.year));
  mk('h3', 'card-title', body, p.title);
  mk('p', 'blurb', body, L(p.blurb));
  const tags = mk('ul', 'tags', body);
  (p.tags || []).forEach(tag => mk('li', '', tags, tag));

  const id = 'panel-' + (p.id || i) + '-' + Math.random().toString(36).slice(2, 6);
  const toggle = mk('button', 'toggle', body, t('card.details'));
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', id);
  const panel = mk('div', 'panel', body);
  panel.id = id;
  panel.hidden = true;
  const links = (p.links || []).filter(l => href(l.url));
  if (links.length) {
    const row = mk('div', 'cta', panel);
    links.forEach(l => anchor(row, 'btn', L(l.label), l.url));
  } else {
    mk('p', 'small dim', panel, t(p.sample ? 'card.sample' : 'card.nolink'));
  }
  toggle.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = t(open ? 'card.less' : 'card.details');
    card.classList.toggle('open', open);
  });
  return card;
}
