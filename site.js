/* A Tal da Física · comportamento comum a todas as páginas: abre e fecha o menu no celular. */
(function () {
  const header = document.querySelector('header.top');
  const btn = header && header.querySelector('.menu-btn');
  if (!btn) return;
  const set = open => { header.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', () => set(!header.classList.contains('open')));
  header.querySelectorAll('nav.links a').forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
})();
