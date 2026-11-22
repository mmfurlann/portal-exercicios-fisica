/* A Tal da Física · comportamento comum a todas as páginas: o menu principal.
   No celular o botão "Menu" abre e fecha o painel; em qualquer tela, cada grupo
   (Aprender, Explorar…) é um botão que abre a lista dos seus links por clique.
   Esc fecha o que estiver aberto e devolve o foco ao botão; clicar fora também fecha. */
(function () {
  const header = document.querySelector('header.top');
  if (!header) return;
  const btn = header.querySelector('.menu-btn');
  const nav = header.querySelector('nav.links');
  const toggles = nav ? Array.from(nav.querySelectorAll('.nav-toggle')) : [];
  const desktop = window.matchMedia('(min-width: 861px)');

  const isOpen = t => t.getAttribute('aria-expanded') === 'true';
  const setGroup = (t, open) => { t.setAttribute('aria-expanded', open); t.parentElement.classList.toggle('is-open', open); };
  const closeGroups = except => toggles.forEach(t => { if (t !== except) setGroup(t, false); });
  const setMenu = open => {
    if (!open) closeGroups();
    if (!btn) return;
    header.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    if (open) { // no celular, o painel já abre mostrando o grupo da página atual
      const cur = toggles.find(t => t.parentElement.classList.contains('is-current'));
      if (cur) setGroup(cur, true);
    }
  };

  if (nav) nav.classList.add('ready'); // sem JS, os grupos abrem pelo foco (regra :not(.ready) do CSS)
  if (btn) btn.addEventListener('click', () => setMenu(!header.classList.contains('open')));
  toggles.forEach(t => {
    t.addEventListener('click', () => { const open = !isOpen(t); if (desktop.matches) closeGroups(t); setGroup(t, open); });
    // no desktop, o submenu fecha quando o foco sai do grupo (Tab para fora)
    t.parentElement.addEventListener('focusout', e => {
      if (desktop.matches && !t.parentElement.contains(e.relatedTarget)) setGroup(t, false);
    });
  });
  if (nav) nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => {
    if (!header.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const t = toggles.find(isOpen);
    if (desktop.matches) { if (t) { setGroup(t, false); t.focus(); } }
    else if (header.classList.contains('open')) { setMenu(false); btn.focus(); }
  });
  // ao cruzar a largura de quebra, volta ao estado fechado
  desktop.addEventListener('change', () => setMenu(false));
})();
