/* A Tal da Física · abertura 3D: carregador, rolagem, legendas e fallback.
 *
 * Fluxo: o HTML (título, texto, botões) já está na página e é o conteúdo real.
 * Depois do carregamento e com o navegador ocioso, este arquivo importa cena.js (e o Three.js)
 * sob demanda. Se não houver WebGL, módulos/importmap, ou algo falhar, o fallback estático
 * (data-estado="estatico") permanece e a página funciona do mesmo jeito.
 * Estados em <section id="abertura" data-estado>: carregando · pronto · reduzido · estatico.
 */
(function () {
  const sec = document.getElementById('abertura');
  if (!sec) return;
  const canvas = sec.querySelector('.ab3d-canvas');
  const pista = sec.querySelector('.ab3d-pista');
  const palco = sec.querySelector('.ab3d-palco');
  const legenda = sec.querySelector('.ab3d-legenda');
  const elCena = legenda.querySelector('.cena'), elTitulo = legenda.querySelector('.titulo'), elNota = legenda.querySelector('.nota'), elLeitura = legenda.querySelector('.leitura');
  const cab = document.querySelector('header.top');
  const params = new URLSearchParams(location.search);
  // ?movimento=reduzido força o modo de movimento reduzido (para testes); o padrão segue o sistema
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches || params.get('movimento') === 'reduzido';
  const set = e => { sec.dataset.estado = e; };

  const CENAS = {
    A: ['A', 'Terra', 'Gira de oeste para leste, uma volta a cada 23 h 56 min. Tempo acelerado nesta animação.'],
    B: ['B', 'Terra e Lua', 'Lua a 384 400 km do centro da Terra (distância comprimida 3,8× para caber na tela; tamanhos em escala). Terra e Lua giram em torno do baricentro, que fica dentro da Terra.'],
    C: ['C', 'A maçã', 'A aceleração da queda aponta para o centro da Terra: g ≈ 9,81 m/s². Câmera lenta (0,25×).'],
    D: ['D', 'A mesma lei', 'F = G·M·m / d²: a Terra atrai a Lua e a Lua atrai a Terra com forças de mesmo módulo (setas fora de escala).'],
  };

  function temWebGL() {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  }
  if (params.get('3d') === 'off' || !temWebGL() || !('noModule' in HTMLScriptElement.prototype)) { set('estatico'); return; }

  set('carregando');
  const ocioso = cb => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 400));
  const depoisDoLoad = cb => (document.readyState === 'complete' ? ocioso(cb) : addEventListener('load', () => ocioso(cb), { once: true }));

  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  depoisDoLoad(async () => {
    let cena;
    try {
      const m = await import('./cena.js');
      let ultimaCena = '', ultimaLeitura = '', ultimoTexto = -1, ultimoVeu = -1;
      cena = await m.criarCena(canvas, {
        animar: !reduz,
        aoPerderContexto: () => set('estatico'),
        aoRestaurarContexto: () => set(reduz ? 'reduzido' : 'pronto'),
        aoEstado: s => {
          if (s.cena !== ultimaCena) {
            ultimaCena = s.cena; const [k, t, n] = CENAS[s.cena];
            elCena.textContent = k; elTitulo.textContent = t; elNota.textContent = n; legenda.dataset.cena = k;
          }
          if (s.leitura !== ultimaLeitura) { ultimaLeitura = s.leitura; elLeitura.textContent = s.leitura; }
          const veu = Math.round(s.veu * 100) / 100;
          if (veu !== ultimoVeu) { ultimoVeu = veu; palco.style.setProperty('--veu', veu); }
          const txt = Math.round((1 - sstep(0.05, 0.15, s.p)) * 100) / 100;
          if (txt !== ultimoTexto) {
            ultimoTexto = txt; palco.style.setProperty('--texto', txt);
            sec.dataset.texto = txt < 0.02 ? 'off' : 'on';          // 'off' => visibility:hidden (fora da ordem de foco)
          }
        },
      });
    } catch (e) {
      console.warn('[abertura 3D] fallback estático:', e && e.message ? e.message : e);
      set('estatico'); return;
    }

    set(reduz ? 'reduzido' : 'pronto');
    sec.dataset.texto = 'on';

    const calcCab = () => { const h = cab ? Math.round(cab.getBoundingClientRect().height + (parseFloat(getComputedStyle(cab).top) || 0)) : 62; sec.style.setProperty('--cab', h + 'px'); return h; };
    let alturaCab = calcCab();
    const progresso = () => {
      if (reduz) return 0;
      const r = pista.getBoundingClientRect(), total = r.height - palco.offsetHeight;
      return total > 0 ? Math.min(1, Math.max(0, (alturaCab - r.top) / total)) : 0;
    };
    const aoRolar = () => cena.definirProgresso(progresso());
    addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();

    const ro = new ResizeObserver(() => { alturaCab = calcCab(); cena.redimensiona(palco.clientWidth, palco.clientHeight); aoRolar(); });
    ro.observe(palco);

    const io = new IntersectionObserver(es => cena.definirVisivel(es[0].isIntersecting), { rootMargin: '100px' });
    io.observe(pista);

    // perspectiva leve: só mouse/dedo em movimento sobre o palco; nunca cancela eventos nem bloqueia os botões
    if (!reduz) {
      palco.addEventListener('pointermove', e => { const r = palco.getBoundingClientRect(); cena.definirPonteiro(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1); }, { passive: true });
      palco.addEventListener('pointerleave', () => cena.definirPonteiro(0, 0), { passive: true });
    }

    addEventListener('pagehide', () => { ro.disconnect(); io.disconnect(); cena.destruir(); }, { once: true });
    window.__abertura3d = cena;       // diagnóstico: __abertura3d.diagnostico()
  });
})();
