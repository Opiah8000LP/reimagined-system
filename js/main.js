import * as settings from './settings.js';
import * as audio from './audio.js';
import * as scene from './scene.js';
import * as shell from './shell.js';
import * as router from './router.js';
import * as fx from './fx.js';
import { apply as translate, setTitle } from './i18n.js';

let page = null;

async function enter(view, first) {
  const name = view.dataset.page;
  translate(view);
  shell.markPage(name);
  scene.setPage(name);
  try { page = await import('./pages/' + name + '.js'); } catch (e) { page = null; console.warn('page script failed', e); }
  if (page && page.init) page.init(view);
  fx.texts(view, true);
  fx.reveal(view);
  fx.tilt(view);
  if (!first) {
    shell.count();
    view.focus({ preventScroll: true });
  }
}

function boot() {
  settings.apply();
  const view = document.getElementById('view');
  shell.header();
  translate(document);
  audio.init();
  scene.init(document.getElementById('scene'));
  shell.player();
  shell.drift();
  shell.titleTricks();
  fx.cursor();
  fx.whispers();
  router.init(view, enter);
  document.addEventListener('click', e => {
    if (settings.state.sfx && e.target.closest && e.target.closest('.btn, button, .filter')) audio.blip(520, 0.05, 'square', 0.02);
  });
  enter(view, true).then(() => {
    shell.count();
    shell.total();
    shell.gate();
  });

  settings.onChange(key => {
    if (key === 'lang' || key === '*') {
      translate(document);
      setTitle(view.dataset.page);
      if (page && page.refresh) page.refresh(view); else if (page && page.init) page.init(view);
      fx.texts(view, true);
      fx.reveal(view);
      fx.tilt(view);
    }
  });
  window.__rdw = { settings, audio };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
