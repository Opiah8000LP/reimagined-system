// runs before the modules: marks that scripts work and explains the two common ways the site fails to start
document.documentElement.classList.add('js');
if (location.protocol === 'file:') {
  document.addEventListener('DOMContentLoaded', () => {
    const p = document.createElement('p');
    p.className = 'msg';
    p.textContent = 'Open this through a web server (GitHub Pages, or run "python3 -m http.server" in this folder). Browsers block ES modules on file://.';
    document.body.prepend(p);
  });
}
setTimeout(() => {
  if (window.__rdw) return;
  document.documentElement.classList.remove('js');
  document.documentElement.classList.add('nojs');
}, 5000);
