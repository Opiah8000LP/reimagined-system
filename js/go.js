// 404 page: rdweeb.xyz/<name> forwards to a link from SITE.shortLinks, anything else shows the lost page
import { SITE } from '../config/site.js';
import { safeUrl } from './util.js';

const name = location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
const target = safeUrl((SITE.shortLinks || {})[name]);
if (target) location.replace(target);
else {
  document.body.dataset.base = 'dark';
  document.querySelector('.mega').style.setProperty('--len', 5);
}
