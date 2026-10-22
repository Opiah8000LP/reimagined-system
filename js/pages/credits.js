import { SITE } from '../../config/site.js';
import { tracks } from '../audio.js';
import { t, L } from '../i18n.js';
import { mk } from '../util.js';
import { anchor } from '../ui.js';

function entry(list, name, by, what, licence, url) {
  const li = mk('li', 'credit rv', list);
  const head = mk('div', 'credit-head', li);
  mk('b', 'credit-name', head, name);
  if (licence) mk('span', 'chip', head, licence);
  const dl = mk('dl', '', li);
  const row = (k, v) => { if (!v) return; mk('dt', '', dl, t(k)); mk('dd', '', dl, v); };
  row('credits.by', by);
  row('credits.used', what);
  if (url) {
    mk('dt', '', dl, t('credits.source'));
    anchor(mk('dd', '', dl), '', url.replace(/^https?:\/\//, ''), url);
  }
}

export function init(root) {
  const list = root.querySelector('#credits');
  list.replaceChildren();
  SITE.credits.forEach(c => entry(list, c.name, c.by, L(c.what), c.license || t('credits.nolicence'), c.url));
  const songs = root.querySelector('#songs');
  songs.replaceChildren();
  tracks.forEach(tr => entry(songs, tr.title, tr.artist, t('credits.song.what'), t('credits.song.licence'), ''));
}
