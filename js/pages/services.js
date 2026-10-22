import { SITE } from '../../config/site.js';
import { t, L } from '../i18n.js';
import { mk, copyText } from '../util.js';
import { href, anchor, statusChip } from '../ui.js';

const field = id => document.getElementById(id);

function cards(root) {
  const list = root.querySelector('#svc');
  list.replaceChildren();
  SITE.services.forEach((s, i) => {
    const li = mk('li', 'svc-card rv tilt ' + s.status, list);
    li.id = 'svc-' + s.id;
    const head = mk('div', 'svc-head', li);
    mk('span', 'svc-n', head, String(i + 1).padStart(2, '0'));
    mk('h2', 'svc-name', head, t('svc.' + s.id));
    statusChip(head, s.status);
    mk('p', 'prose', li, L(s.blurb));
    if (s.status === 'closed') {
      mk('p', 'note-box', li, L(s.note) || t('svc.closed.note'));
      return;
    }
    const facts = mk('dl', 'facts', li);
    mk('dt', '', facts, t('svc.price'));
    mk('dd', '', facts, s.price ? L(s.price) : t('svc.tba'));
    mk('dt', '', facts, t('svc.time'));
    mk('dd', '', facts, s.time ? L(s.time) : t('svc.tba'));
    if (s.gets && s.gets.length) {
      mk('h3', 'mini', li, t('svc.gets'));
      const ul = mk('ul', 'ticks', li);
      s.gets.forEach(g => mk('li', '', ul, L(g)));
    }
    if (s.status === 'open') {
      const b = mk('button', 'btn primary', li, t('svc.request'));
      b.type = 'button';
      b.addEventListener('click', () => {
        field('rq-svc').value = s.id;
        message();
        field('request').scrollIntoView({ behavior: 'smooth' });
        field('rq-what').focus({ preventScroll: true });
      });
    } else {
      const b = mk('button', 'btn', li, t('svc.soon'));
      b.type = 'button';
      b.disabled = true;
    }
  });
}

function payments(root) {
  const ul = root.querySelector('#paylist');
  ul.replaceChildren();
  const row = (ok, name, note) => {
    const li = mk('li', ok ? 'yes' : 'no', ul);
    mk('span', 'mark', li, ok ? '+' : '-').setAttribute('aria-hidden', 'true');
    mk('b', '', li, name);
    mk('span', '', li, note);
  };
  row(true, 'Ko-fi', t('pay.kofi'));
  if (SITE.payments.robux) row(true, 'Robux', t('pay.robux'));
  row(false, t('pay.others'), t('pay.others.d'));
}

function options() {
  const select = field('rq-svc');
  const keep = select.value;
  select.replaceChildren();
  SITE.services.filter(s => s.status === 'open').forEach(s => {
    const o = mk('option', '', select, t('svc.' + s.id));
    o.value = s.id;
  });
  if (keep) select.value = keep;
}

function message() {
  const id = field('rq-svc').value;
  const val = k => field('rq-' + k).value.trim();
  const lines = [t('req.tpl.hi'), t('req.tpl.svc', { svc: id ? t('svc.' + id) : '-' })];
  if (val('name')) lines.push(t('req.tpl.name', { v: val('name') }));
  lines.push('', t('req.tpl.what'), val('what') || t('req.tpl.empty'), '');
  if (val('budget')) lines.push(t('req.tpl.budget', { v: val('budget') }));
  if (val('when')) lines.push(t('req.tpl.when', { v: val('when') }));
  lines.push('', t('req.tpl.pay'));
  field('rq-out').value = lines.join('\n');
}

export function init(root) {
  cards(root);
  payments(root);
  options();
  const kofi = href(SITE.kofi);
  if (kofi) field('rq-kofi').href = kofi;
  message();
  if (field('rq-out').dataset.bound) return;
  field('rq-out').dataset.bound = '1';
  ['svc', 'name', 'what', 'budget', 'when'].forEach(k => field('rq-' + k).addEventListener('input', message));
  field('rq-copy').addEventListener('click', async () => {
    const ok = await copyText(field('rq-out').value);
    field('rq-status').textContent = t(ok ? 'req.copied' : 'req.copyfail');
  });
}
