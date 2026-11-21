/* Página inicial · sistema gravitacional da abertura.
   O planeta "A Tal da Física" (o logo) fica no foco comum de várias órbitas elípticas.
   Tudo segue a gravitação de Newton e as leis de Kepler:
   · a posição vem da equação de Kepler (M = E − e·sen E): mais perto, mais rápido (2ª lei);
   · os períodos respeitam T² ∝ a³ com a mesma constante para todos (3ª lei), sem depender da massa do corpo;
   · cada seta laranja é a força F = G·M·m/d² sobre o corpo, apontando para o centro,
     desenhada na MESMA escala para todos (comprimento ∝ m/d², sem limites artificiais).
   Os corpos são tratados como partículas de teste: a atração entre eles é desprezada. */
(function () {
  const svg = document.getElementById('sistema');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const F = { x: 350, y: 380 };                        // foco comum: centro do logo
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };
  const rad = d => d * Math.PI / 180;

  // órbitas: semieixo maior a, excentricidade e, direção do afélio (graus, y para baixo),
  // massa m (unidades relativas), raio r do desenho, fase inicial e o tipo de corpo
  const TB = 34;                                       // período da órbita de a = 175, em segundos (movimento lento)
  const AB = 175;
  const ORB = [
    { a: 220, e: 0.4,  dir: -85,  m: 2.0, r: 13,  fase: 2.6, tipo: 'sonho', dica: 'Um sonho grande: atrai e é atraído com força. No afélio parece longe; no periélio chega bem perto.' },
    { a: 175, e: 0.38, dir: -52,  m: 1.4, r: 10,  fase: 0.9, tipo: 'universidade', dica: 'A universidade: muita massa de conhecimento, muita atração. E a força é recíproca.' },
    { a: 155, e: 0.1,  dir: -90,  m: 1.6, r: 11,  fase: 4.4, tipo: 'lua', dica: 'A Lua: caindo desde sempre, sem nunca chegar. E sempre com a mesma face virada para o planeta.' },
    { a: 210, e: 0.45, dir: -100, m: 0.5, r: 8,   fase: 5.3, tipo: 'maca', dica: 'A maçã de Newton: a mesma queda, só que de lado.' },
    { a: 124, e: 0.03, dir: 180,  m: 0.8, r: 7,   fase: 3.5, tipo: 'satelite', dica: 'Satélite: o mais perto, o mais rápido. Antena sempre apontada para o planeta.' },
  ];
  ORB.forEach(o => {
    o.c = o.a * o.e; o.b = o.a * Math.sqrt(1 - o.e * o.e);
    o.u = { x: Math.cos(rad(o.dir)), y: Math.sin(rad(o.dir)) };   // aponta para o afélio
    o.v = { x: -o.u.y, y: o.u.x };
    o.C = { x: F.x + o.c * o.u.x, y: F.y + o.c * o.u.y };          // centro da elipse
    o.T = TB * Math.pow(o.a / AB, 1.5);                             // 3ª lei de Kepler
  });
  // escala única das setas: a maior força (no periélio) mede FMAX px; todas as outras na mesma proporção
  const FMAX = 72;
  const K = FMAX / Math.max(...ORB.map(o => o.m / Math.pow(o.a * (1 - o.e), 2)));

  // desenhos dos corpos, em torno da origem (girados conforme o corpo)
  const desenhos = {
    universidade(g) {                                  // prédio clássico: frontão, colunas e escadaria
      el('path', { d: 'M-11 -4 L 0 -11 L 11 -4 Z', fill: '#f99f29' }, g);
      el('rect', { x: -10, y: -4, width: 20, height: 2, fill: '#f4efe3' }, g);
      [-8, -3.5, 1, 5.5].forEach(cx => el('rect', { x: cx, y: -2, width: 2.5, height: 8, fill: '#f4efe3' }, g));
      el('rect', { x: -11, y: 6, width: 22, height: 2.4, fill: '#f4efe3' }, g);
      el('rect', { x: -12.5, y: 8.4, width: 25, height: 2, fill: '#d9d3c5' }, g);
    },
    sonho(g) {                                         // balão de pensamento com uma estrela dentro
      el('path', { d: 'M-9 7 C -15 7 -15 -1 -10 -1 C -11 -8 -3 -11 0 -6 C 3 -11 11 -9 10 -2 C 15 -2 15 7 9 7 Z', fill: '#cdeaf1', stroke: '#f4efe3', 'stroke-width': 1.2 }, g);
      el('path', { d: 'M0 -5 L 1.6 -0.8 L 6 -0.6 L 2.6 2.1 L 3.8 6.3 L 0 3.9 L -3.8 6.3 L -2.6 2.1 L -6 -0.6 L -1.6 -0.8 Z', fill: '#f99f29' }, g);
      el('circle', { cx: -12, cy: 11, r: 2, fill: '#cdeaf1' }, g);
      el('circle', { cx: -16, cy: 14.5, r: 1.2, fill: '#cdeaf1' }, g);
    },
    lua(g, o) {                                        // crateras fixas na face: rotação sincronizada
      el('circle', { r: o.r, fill: '#d9d3c5' }, g);
      el('circle', { cx: -3.5, cy: -2, r: 2.6, fill: '#a9a291' }, g);
      el('circle', { cx: 3, cy: 3.5, r: 1.8, fill: '#a9a291' }, g);
      el('circle', { cx: 4, cy: -4, r: 1.2, fill: '#a9a291' }, g);
    },
    maca(g, o) {
      el('path', { d: 'M0 -5 C 5 -9 10 -3 8 3 C 6 9 2 9 0 7 C -2 9 -6 9 -8 3 C -10 -3 -5 -9 0 -5 Z', fill: '#d9463a' }, g);
      el('path', { d: 'M0 -5 L 1 -10', stroke: '#6b4a1f', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M1 -9 C 4 -13 8 -11 8 -9 C 6 -8 3 -8 1 -9 Z', fill: '#a9c452' }, g);
      el('circle', { cx: -4, cy: -1, r: 1.6, fill: '#fff', opacity: 0.5 }, g);
    },
    satelite(g) {                                      // desenhado com a antena para +x; gira para apontar ao planeta
      el('rect', { x: -2, y: -15, width: 4, height: 9, fill: '#1fa9c6', stroke: '#f4efe3', 'stroke-width': 0.8 }, g);
      el('rect', { x: -2, y: 6, width: 4, height: 9, fill: '#1fa9c6', stroke: '#f4efe3', 'stroke-width': 0.8 }, g);
      el('rect', { x: -4.5, y: -5, width: 9, height: 10, fill: '#f4efe3' }, g);
      el('path', { d: 'M4.5 0 L 9 0 M 9 -3 Q 6 0 9 3', stroke: '#f4efe3', 'stroke-width': 1.3, fill: 'none' }, g);
    },
  };

  const gOrb = document.getElementById('orbitas'), gCorpos = document.getElementById('corpos');
  ORB.forEach(o => {
    el('ellipse', { class: 'orb', cx: o.C.x.toFixed(1), cy: o.C.y.toFixed(1), rx: o.a, ry: o.b.toFixed(1), transform: `rotate(${o.dir} ${o.C.x.toFixed(1)} ${o.C.y.toFixed(1)})` }, gOrb);
  });
  ORB.forEach(o => {                                   // setas por baixo de todos os corpos
    o.linha = el('line', { class: 'forca' }, gCorpos);
    o.ponta = el('polygon', { class: 'forca-ponta' }, gCorpos);
  });
  ORB.forEach(o => {
    o.g = el('g', {}, gCorpos);
    if (o.dica) el('title', {}, o.g).textContent = o.dica;
    desenhos[o.tipo](o.g, o);
  });

  function kepler(M, e) { let E = M; for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; }
  function posiciona(o, M, t) {
    const E = kepler(M, o.e), ca = Math.cos(E), sa = Math.sin(E);
    const x = o.C.x - o.a * ca * o.u.x + o.b * sa * o.v.x, y = o.C.y - o.a * ca * o.u.y + o.b * sa * o.v.y;
    const dx = F.x - x, dy = F.y - y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
    const radial = Math.atan2(uy, ux) * 180 / Math.PI;               // direção do corpo para o planeta
    let giro = 0;
    if (o.tipo === 'lua') giro = radial;                              // rotação sincronizada (face fixa)
    else if (o.tipo === 'satelite') giro = radial;                    // antena apontada para o planeta
    o.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${giro.toFixed(1)})`);

    // força gravitacional: F = G·M·m/d², para o centro; comprimento ∝ m/d² na escala comum K
    const L = K * o.m / (d * d);
    const x0 = x + ux * (o.r + 3), y0 = y + uy * (o.r + 3), x1 = x0 + ux * L, y1 = y0 + uy * L;
    const h = Math.min(9, L * 0.6), w = h * 0.55, px = -uy, py = ux;  // ponta proporcional em setas curtas
    o.linha.setAttribute('x1', x0.toFixed(1)); o.linha.setAttribute('y1', y0.toFixed(1));
    o.linha.setAttribute('x2', (x1 - ux * h * 0.8).toFixed(1)); o.linha.setAttribute('y2', (y1 - uy * h * 0.8).toFixed(1));
    o.ponta.setAttribute('points', [[x1, y1], [x1 - ux * h + px * w, y1 - uy * h + py * w], [x1 - ux * h - px * w, y1 - uy * h - py * w]].map(p => p.map(n => n.toFixed(1)).join(',')).join(' '));
  }

  const desenha = t => ORB.forEach(o => posiciona(o, o.fase + 2 * Math.PI * t / o.T, t));
  desenha(0);

  // movimento lento; parado para quem prefere menos movimento e fora da tela
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let visivel = true, t = 0, ultimo = null;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visivel = es[0].isIntersecting; }).observe(svg);
  function quadro(agora) {
    if (ultimo !== null && visivel && !document.hidden) { t += Math.min(0.05, (agora - ultimo) / 1000); desenha(t); }
    ultimo = agora; requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
})();
