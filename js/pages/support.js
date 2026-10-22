import { SITE } from '../../config/site.js';
import { t, L } from '../i18n.js';
import { mk } from '../util.js';
import { href, anchor } from '../ui.js';

export function init(root) {
  const kofi = href(SITE.kofi);
  if (kofi) root.querySelector('#kofi-btn').href = kofi;
  const list = root.querySelector('#more-support');
  list.replaceChildren();
  SITE.support.forEach(s => {
    const li = mk('li', 'card rv tilt plain-card', list);
    const body = mk('div', 'card-body', li);
    mk('h3', 'card-title', body, L(s.label));
    mk('p', 'blurb', body, L(s.note));
    const row = mk('div', 'cta', body);
    if (href(s.url)) anchor(row, 'btn', t('support.go'), s.url);
    else anchor(row, 'btn', t('support.ask'), 'contact.html');
  });
}
