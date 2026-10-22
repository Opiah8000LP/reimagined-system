import { SITE } from '../../config/site.js';
import * as audio from '../audio.js';
import { t, L } from '../i18n.js';
import { mk } from '../util.js';
import { anchor, statusChip, projectCard, realProjects } from '../ui.js';

const WORDS = ['breakcore', 'dreamcore', 'websites', 'glitch', 'games', 'video edits', 'cover art', 'hand-coded', 'no frameworks', 'open for requests'];

export function init(root) {
  const marquee = root.querySelector('#marquee');
  marquee.replaceChildren();
  for (let k = 0; k < 2; k++) WORDS.forEach(w => mk('span', '', marquee, w));

  const skills = root.querySelector('#skills');
  skills.replaceChildren();
  SITE.services.filter(s => s.id !== 'art').forEach((s, i) => {
    const li = mk('li', 'skill rv tilt', skills);
    const a = anchor(li, 'skill-link', '', 'services.html#svc-' + s.id);
    mk('span', 'skill-n', a, String(i + 1).padStart(2, '0'));
    mk('b', 'skill-name', a, t('svc.' + s.id));
    mk('span', 'skill-d', a, L(s.blurb));
  });

  const board = root.querySelector('#board');
  board.replaceChildren();
  SITE.services.forEach(s => {
    const li = mk('li', '', board);
    const a = anchor(li, 'board-row', '', 'services.html#svc-' + s.id);
    mk('span', 'board-name', a, t('svc.' + s.id));
    statusChip(a, s.status);
  });

  const latest = root.querySelector('#latest');
  latest.replaceChildren();
  realProjects().slice(0, 2).forEach((p, i) => projectCard(latest, p, i));

  nowPlaying(root.querySelector('#now'));
}

function nowPlaying(box) {
  box.replaceChildren();
  const art = mk('div', 'art', box);
  art.setAttribute('aria-hidden', 'true');
  const layers = ['r', 'g', 'b'].map(c => mk('img', 'art-' + c, art));
  layers.forEach(img => { img.alt = ''; img.onerror = () => { art.classList.add('empty'); }; });
  const info = mk('div', 'now-info', box);
  const h = mk('p', 'chip', info, t('now.h'));
  h.id = 'now-h';
  const title = mk('b', 'now-title', info);
  const artist = mk('span', 'now-artist', info);
  const btn = mk('button', 'btn primary', info);
  btn.type = 'button';

  const draw = () => {
    const tr = audio.current();
    title.textContent = tr.title;
    artist.textContent = tr.artist;
    art.classList.toggle('empty', !tr.cover);
    layers.forEach(img => { if (tr.cover) img.src = tr.cover; });
    btn.textContent = t(audio.state.playing ? 'player.pause' : 'now.play');
    art.classList.toggle('on', audio.state.playing);
  };
  const live = fn => () => { if (document.contains(box)) fn(); };
  audio.on('track', live(draw));
  audio.on('state', live(draw));
  btn.addEventListener('click', () => { audio.unlock(); audio.toggle(); });
  draw();
}
