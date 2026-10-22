import { SITE } from '../../config/site.js';
import { t } from '../i18n.js';
import { mk } from '../util.js';
import { projectCard } from '../ui.js';

let filter = 'all';

export function init(root) {
  const bar = root.querySelector('#filters');
  const list = root.querySelector('#cards');
  const empty = root.querySelector('#empty');
  const archive = root.querySelector('#archive');
  if (archive && SITE.github) archive.href = SITE.github + '?tab=repositories';

  const types = ['all', ...new Set(SITE.projects.map(p => p.type))];
  if (!types.includes(filter)) filter = 'all';

  const draw = () => {
    bar.replaceChildren();
    types.forEach(type => {
      const b = mk('button', 'filter', bar, t(type === 'all' ? 'filter.all' : 'type.' + type));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(type === filter));
      b.addEventListener('click', () => { filter = type; draw(); });
    });
    list.replaceChildren();
    const shown = SITE.projects.filter(p => filter === 'all' || p.type === filter);
    shown.forEach((p, i) => projectCard(list, p, i));
    empty.hidden = shown.length > 0;
    requestAnimationFrame(() => list.querySelectorAll('.rv').forEach(el => el.classList.add('in')));
  };
  draw();
}
