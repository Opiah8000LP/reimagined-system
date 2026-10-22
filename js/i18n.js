import { STRINGS } from './strings.js';
import { state } from './settings.js';

const COLUMN = { en: 0, ru: 1, de: 2 };

export function t(key, vars) {
  const row = STRINGS[key];
  let text = row ? row[COLUMN[state.lang]] || row[0] : key;
  if (vars) for (const name in vars) text = text.split('{' + name + '}').join(vars[name]);
  return text;
}

// text from the config files: a plain string or { en, ru, de }
export const L = value => {
  if (value && typeof value === 'object') return value[state.lang] || value.en || '';
  return value == null ? '' : String(value);
};

const ATTRIBUTES = {
  'data-i18n-aria': 'aria-label',
  'data-i18n-title': 'title',
  'data-i18n-placeholder': 'placeholder'
};

export function apply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  for (const attr in ATTRIBUTES) {
    root.querySelectorAll('[' + attr + ']').forEach(el => el.setAttribute(ATTRIBUTES[attr], t(el.getAttribute(attr))));
  }
}

export function setTitle(page) {
  document.title = t('title.' + page);
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = t('desc.' + page);
}
