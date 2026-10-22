// Soft navigation: the pages are real files with real urls, but links swap only <main>,
// so the music and the animated background keep going between pages.
import { state } from './settings.js';

const PAGES = ['index', 'portfolio', 'services', 'contact', 'support', 'settings', 'credits'];
const folder = path => path.slice(0, path.lastIndexOf('/') + 1);

function leaf(url) {
  if (url.origin !== location.origin || folder(url.pathname) !== folder(location.pathname)) return null;
  const name = url.pathname.slice(url.pathname.lastIndexOf('/') + 1).replace(/\.html$/, '') || 'index';
  return PAGES.includes(name) ? name : null;
}

export function init(view, onPage) {
  let busy = false;

  async function go(url, push) {
    if (busy) return;
    busy = true;
    try {
      const res = await fetch(url.href, { credentials: 'omit' });
      if (!res.ok) throw new Error(res.status);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const next = doc.querySelector('#view');
      if (!next) throw new Error('no view');
      const animate = state.transitions && state.motion !== 'off';
      if (animate) { view.classList.add('leaving'); await new Promise(r => setTimeout(r, 200)); }
      view.replaceChildren(...[...next.childNodes].map(n => document.importNode(n, true)));
      view.dataset.page = next.dataset.page;
      if (push) history.pushState({}, '', url.href);
      scrollTo(0, 0);
      view.classList.remove('leaving');
      if (animate) { view.classList.add('entering'); setTimeout(() => view.classList.remove('entering'), 600); }
      await onPage(view, false);
      if (url.hash) document.getElementById(url.hash.slice(1))?.scrollIntoView();
    } catch (e) {
      location.href = url.href;
    }
    busy = false;
  }

  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    const name = leaf(url);
    if (!name) return;
    const same = url.pathname === location.pathname || (name === 'index' && location.pathname === folder(location.pathname));
    if (same && url.search === location.search) {
      if (url.hash) return;
      e.preventDefault();
      scrollTo({ top: 0, behavior: state.motion === 'off' ? 'auto' : 'smooth' });
      return;
    }
    e.preventDefault();
    go(url, true);
  });
  addEventListener('popstate', () => go(new URL(location.href), false));
}
