/* Biblioteca de Fórmulas: interface.
   Os dados vêm de formulas/dados/*.js, que preenchem window.FORMULAS = { areas: [...], formulas: [...] }.
   Cada fórmula: id, area, sub, topico, nome, tex, alt [[nome, tex]], vars [[símbolo, descrição, unidade]],
   uso, val (validade), obs, ex [enunciado, resolução], top (muito cobrada), tags, ver [[texto, link]]. */
(function () {
const DATA = window.FORMULAS || { areas: [], formulas: [] };
const AREAS = DATA.areas, LIST = DATA.formulas;
const $ = id => document.getElementById(id);
const content = $('content');
const MACROS = { '\\sen': '\\operatorname{sen}', '\\tg': '\\operatorname{tg}', '\\cotg': '\\operatorname{cotg}' };

/* ---------- utilidades ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const norm = s => String(s).normalize('NFKD').replace(/[̀-ͯ⃗]/g, '').toLowerCase();
function tex(s, display) {
  if (window.katex) {
    try { return katex.renderToString(s, { displayMode: !!display, throwOnError: false, macros: MACROS, strict: false }); } catch (e) {}
  }
  return '<code>' + esc(plain(s)) + '</code>';
}
/* texto com matemática entre $...$ e **negrito** */
function rich(s) {
  if (!s) return '';
  return String(s).split(/(\$[^$]+\$)/).map(part => {
    if (part.length > 1 && part[0] === '$' && part[part.length - 1] === '$') return tex(part.slice(1, -1), false);
    return esc(part).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }).join('');
}

/* LaTeX → texto simples (para copiar e para a busca) */
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ' };
const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'h': 'ₕ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'p': 'ₚ', 's': 'ₛ', 't': 'ₜ', 'i': 'ᵢ', 'r': 'ᵣ', 'u': 'ᵤ', 'v': 'ᵥ', 'j': 'ⱼ' };
const SYM = { Delta: 'Δ', delta: 'δ', theta: 'θ', omega: 'ω', Omega: 'Ω', alpha: 'α', beta: 'β', gamma: 'γ', pi: 'π', mu: 'μ', rho: 'ρ', eta: 'η',
  tau: 'τ', lambda: 'λ', varphi: 'φ', phi: 'φ', Phi: 'Φ', epsilon: 'ε', varepsilon: 'ε', sigma: 'σ', Sigma: 'Σ', sum: 'Σ', kappa: 'κ', nu: 'ν', psi: 'ψ',
  cdot: '·', times: '×', approx: '≈', le: '≤', leq: '≤', ge: '≥', geq: '≥', neq: '≠', Rightarrow: '⇒', Leftrightarrow: '⇔', rightarrow: '→', to: '→',
  propto: '∝', infty: '∞', pm: '±', perp: '⊥', parallel: '∥', degree: '°', circ: '°', ell: 'ℓ', hbar: 'ℏ', cdots: '⋯', ldots: '…', int: '∫', partial: '∂',
  sen: ' sen ', cos: ' cos ', tg: ' tg ', cotg: ' cotg ', ln: ' ln ', log: ' log ', quad: ' ; ', qquad: ' ; ', ',': ' ', ';': ' ', ':': ' ', '!': '', ' ': ' ',
  '%': '%', '{': '{', '}': '}', '_': '_', '#': '#', left: '', right: '', big: '', Big: '', displaystyle: '', textstyle: '' };
function plain(t) {
  let i = 0;
  const skip = () => { while (t[i] === ' ') i++; };
  const wrap = s => (/^[\p{L}\p{N}₀-₉⁰-⁹.,′]+$/u.test(s) ? s : '(' + s + ')');
  function name() { const m = t.slice(i).match(/^([a-zA-Z]+|.)/); i += m[1].length; return m[1]; }
  function atom() {
    skip();
    if (t[i] === '{') { i++; return group(); }
    if (t[i] === '\\') { i++; return cmd(name()); }
    return t[i++] || '';
  }
  function script(a, sup) {
    const map = sup ? SUP : SUB, ch = [...a];
    if (ch.length && ch.every(c => map[c])) return ch.map(c => map[c]).join('');
    return (sup ? '^' : '_') + wrap(a);
  }
  function cmd(n) {
    if (n === 'frac' || n === 'dfrac' || n === 'tfrac') { const a = atom(), b = atom(); return wrap(a) + '/' + wrap(b); }
    if (n === 'sqrt') { let k = ''; if (t[i] === '[') { const j = t.indexOf(']', i); k = t.slice(i + 1, j); i = j + 1; } const a = atom(); return (k ? script(k, true) : '') + '√' + wrap(a); }
    if (n === 'vec') return atom() + '⃗';
    if (n === 'overset' || n === 'underset' || n === 'stackrel') { atom(); return atom(); }
    if (['text', 'mathrm', 'operatorname', 'textrm', 'mathbf', 'boldsymbol', 'mathit', 'textit', 'textbf', 'overline', 'bar', 'hat'].includes(n)) return atom();
    return n in SYM ? SYM[n] : n;
  }
  function group() {
    let out = '';
    while (i < t.length) {
      const c = t[i];
      if (c === '}') { i++; return out; }
      if (c === '{') { i++; out += group(); continue; }
      if (c === '\\') { i++; out += cmd(name()); continue; }
      if (c === '^' || c === '_') { i++; out += script(atom(), c === '^'); continue; }
      if (c === '~') { out += ' '; i++; continue; }
      out += c; i++;
    }
    return out;
  }
  return group().replace(/\s+/g, ' ').replace(/\s*([=+·×/])\s*/g, ' $1 ').replace(/ \/ /g, '/').replace(/Δ /g, 'Δ')
    .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/(\s*;\s*)+/g, ' ; ').replace(/\s+/g, ' ').replace(/^ ; | ; $/g, '').trim();
}

/* ---------- favoritos ---------- */

/* ---------- índices ---------- */
const byId = new Map(LIST.map(f => [f.id, f]));
const areaById = new Map(AREAS.map(a => [a.id, a]));
const subName = (a, s) => ((areaById.get(a) || { subs: [] }).subs.find(x => x.id === s) || { nome: s }).nome;
LIST.forEach((f, k) => {
  f._ord = k;
  const a = areaById.get(f.area);
  f._search = norm([f.nome, f.topico, subName(f.area, f.sub), a ? a.nome : '', f.tags || '', plain(f.tex),
    (f.alt || []).map(x => x[0] + ' ' + plain(x[1])).join(' '), (f.vars || []).map(v => plain(v[0]) + ' ' + v[1]).join(' ')].join(' | '));
  f._name = norm(f.nome + ' ' + (f.tags || ''));
});

/* ---------- cartão ---------- */
function card(f) {
  const area = areaById.get(f.area);
  const alt = (f.alt || []).length ? `<div class="fb-alt">${f.alt.map(x => `<div><span class="fb-al">${rich(x[0])}</span><span class="fb-ae">${tex(x[1], true)}</span></div>`).join('')}</div>` : '';
  const vars = (f.vars || []).length ? `<div><p class="fb-k">Variáveis</p><div class="fb-vars">${f.vars.map(v =>
    `<span class="s">${tex(v[0], false)}</span><span class="d">${rich(v[1])}</span><span class="u">${esc(v[2] || '')}</span>`).join('')}</div></div>` : '';
  const fig = f.ex && window.ILUSTRACAO ? window.ILUSTRACAO(f.id) : '';
  const ex = f.ex ? `<details class="fb-ex"><summary>Exemplo resolvido</summary><div>${fig ? `<figure class="fb-fig">${fig}</figure>` : ''}<p>${rich(f.ex[0])}</p><div class="fb-sol">${rich(f.ex[1])}</div></div></details>` : '';
  // links internos (#área ou #f/id) só aparecem se o destino já existir nos dados
  const ver = (f.ver || []).filter(v => !v[1].startsWith('#') || areaById.has(v[1].slice(1).split('/')[0]) || (v[1].startsWith('#f/') && byId.has(v[1].slice(3))));
  const see = ver.length ? `<p class="fb-see">Veja também: ${ver.map(v => v[1].startsWith('#')
    ? `<a href="${esc(v[1])}">${esc(v[0])}</a>` : `<a href="${esc(v[1])}">${esc(v[0])} ↗</a>`).join(' · ')}</p>` : '';
  return `<article class="fb-card" id="f-${f.id}">
  <div class="fb-head">
    <div><h4>${rich(f.nome)}</h4>
      <div class="fb-tags">${f.top ? '<span class="fb-tag top">★ Muito cobrada</span>' : ''}<span class="fb-tag">${esc(area ? area.nome : '')} · ${esc(f.topico || subName(f.area, f.sub))}</span></div></div>
  </div>
  <div class="fb-eq">${tex(f.tex, true)}</div>
  ${alt}${vars}
  <div class="fb-info">
    ${f.uso ? `<p><b>Quando usar.</b> ${rich(f.uso)}</p>` : ''}
    ${f.val ? `<p class="fb-valid"><b>Validade.</b> ${rich(f.val)}</p>` : ''}
    ${f.obs ? `<p><b>Atenção.</b> ${rich(f.obs)}</p>` : ''}
  </div>
  ${ex}${see}
</article>`;
}

/* ---------- vistas ---------- */
let current = { view: 'area', area: AREAS[0] && AREAS[0].id };
// se a página está rolada para baixo do início do conteúdo, volta para o topo dele
function toTop() {
  const top = $('main').getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 64) - 12;
  if (window.scrollY > top) window.scrollTo(0, top);
}
function setHead(label, title, count) {
  $('view-label').textContent = label; $('view-title').textContent = title;
  $('view-count').textContent = count == null ? '' : count + (count === 1 ? ' fórmula' : ' fórmulas');
}
function groupedHTML(fs, withAreaHead) {
  // agrupa por área > subárea > tópico, na ordem dos dados
  let html = '', lastA = '', lastS = '', lastT = '';
  fs.slice().sort((a, b) => a._ord - b._ord).forEach(f => {
    if (withAreaHead && f.area !== lastA) { html += `${lastA ? '</section>' : ''}<section class="fb-sec"><h3>${esc(areaById.get(f.area).nome)}</h3>`; lastA = f.area; lastS = ''; lastT = ''; }
    if (withAreaHead && f.sub !== lastS) { html += `<p class="fb-group">${esc(subName(f.area, f.sub))}</p>`; lastS = f.sub; lastT = ''; }
    html += card(f);
  });
  return html + (withAreaHead && lastA ? '</section>' : '');
}
function renderArea(areaId, subId) {
  const a = areaById.get(areaId) || AREAS[0];
  const fs = LIST.filter(f => f.area === a.id);
  setHead('Área', a.nome, fs.length);
  let html = `<p class="fb-areaintro">${rich(a.intro || '')}</p><nav class="fb-subnav" aria-label="Assuntos de ${esc(a.nome)}">${a.subs.map(s => `<a href="#${a.id}/${s.id}">${esc(s.nome)}</a>`).join('')}</nav>`;
  a.subs.forEach(s => {
    const sf = fs.filter(f => f.sub === s.id);
    html += `<section class="fb-sec" id="sec-${a.id}-${s.id}"><h3>${esc(s.nome)} <small>${sf.length} fórmulas</small></h3>`;
    const topics = s.topicos || [];
    const order = t => { const k = topics.indexOf(t); return k < 0 ? 999 : k; };
    let lastT = null;
    sf.slice().sort((x, y) => order(x.topico) - order(y.topico) || x._ord - y._ord).forEach(f => {
      if (f.topico !== lastT) { html += `<p class="fb-topic">${esc(f.topico || '')}</p>`; lastT = f.topico; }
      html += card(f);
    });
    html += '</section>';
  });
  content.innerHTML = html;
  current = { view: 'area', area: a.id };
  markNav(a.id, subId);
  if (subId) { const el = document.getElementById(`sec-${a.id}-${subId}`); if (el) el.scrollIntoView(); } else toTop();
}
function renderSet(label, title, fs, empty) {
  setHead(label, title, fs.length);
  content.innerHTML = fs.length ? groupedHTML(fs, true) : `<div class="fb-empty">${empty}</div>`;
  markNav(null); toTop();
}
function renderIndex() {
  const fs = LIST.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
  const groups = new Map();
  fs.forEach(f => { const L = norm(f.nome).replace(/[^a-z]/g, '')[0].toUpperCase() || '#'; if (!groups.has(L)) groups.set(L, []); groups.get(L).push(f); });
  setHead('Índice', 'Índice alfabético', fs.length);
  content.innerHTML = `<nav class="fb-letters" aria-label="Letras">${[...groups.keys()].map(L => `<a href="#indice/${L}">${L}</a>`).join('')}</nav>
  <div class="fb-index">${[...groups].map(([L, g]) => `<section id="idx-${L}"><h3>${L}</h3><ul>${g.map(f =>
    `<li><a href="#f/${f.id}">${rich(f.nome)}</a><small>${esc(areaById.get(f.area).nome)}</small></li>`).join('')}</ul></section>`).join('')}</div>`;
  markNav(null, null, 'chip-idx'); toTop();
}
function search(q) {
  const toks = norm(q).split(/\s+/).filter(Boolean);
  const full = norm(q).trim();
  return LIST.map(f => {
    if (!toks.every(t => f._search.includes(t))) return null;
    let s = 0;
    if (f._name.includes(full)) s += 10;
    toks.forEach(t => { if (f._name.includes(t)) s += 3; if (new RegExp('(^|[^a-z])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z])').test(f._name)) s += 6; });
    if (f.top) s += 1;
    return [s, f];
  }).filter(Boolean).sort((a, b) => b[0] - a[0] || a[1]._ord - b[1]._ord).map(x => x[1]);
}
function renderSearch(q) {
  const fs = search(q);
  setHead('Busca', `“${q.trim()}”`, fs.length);
  content.innerHTML = fs.length ? fs.map(card).join('') : `<div class="fb-empty">Nenhuma fórmula encontrada para “${esc(q)}”. Tente outra palavra, como o nome da grandeza (potência, pressão), da lei (Torricelli, Snell) ou uma variável.</div>`;
  markNav(null); toTop();
}

/* ---------- navegação ---------- */
function buildTree() {
  $('tree').innerHTML = AREAS.map(a => {
    const n = LIST.filter(f => f.area === a.id).length;
    return `<details data-area="${a.id}"><summary><span class="sym">${esc(a.sym || '')}</span><span>${esc(a.nome)}</span><span class="n">${n}</span></summary>
      <ul><li><a href="#${a.id}" data-area-link="${a.id}">Visão geral da área</a></li>${a.subs.map(s => `<li><a href="#${a.id}/${s.id}" data-sub="${a.id}/${s.id}">${esc(s.nome)}</a></li>`).join('')}</ul></details>`;
  }).join('');
}
function markNav(areaId, subId, chip) {
  document.querySelectorAll('#tree details').forEach(d => { const on = d.dataset.area === areaId; d.classList.toggle('on', on); if (on) d.open = true; });
  document.querySelectorAll('#tree a').forEach(x => x.removeAttribute('aria-current'));
  if (areaId) {
    const sel = subId ? `[data-sub="${areaId}/${subId}"]` : `[data-area-link="${areaId}"]`;
    const el = document.querySelector('#tree a' + sel); if (el) el.setAttribute('aria-current', 'true');
  }
  ['chip-top', 'chip-idx'].forEach(c => $(c).setAttribute('aria-current', c === chip ? 'true' : 'false'));
}
function route() {
  const q = $('q').value.trim();
  if (q) return renderSearch(q);
  const h = decodeURIComponent(location.hash.slice(1));
  const [p, s] = h.split('/');
  if (p === 'cobradas') { renderSet('Filtro', 'Muito cobradas nos vestibulares', LIST.filter(f => f.top), ''); markNav(null, null, 'chip-top'); return; }
  if (p === 'indice') { renderIndex(); if (s) { const el = $('idx-' + s); if (el) el.scrollIntoView(); } return; }
  if (p === 'f' && byId.has(s)) {
    const f = byId.get(s);
    if (current.view !== 'area' || current.area !== f.area || !document.getElementById('f-' + s)) renderArea(f.area);
    const el = document.getElementById('f-' + s);
    if (el) { el.scrollIntoView({ block: 'start' }); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
    return;
  }
  if (areaById.has(p)) {
    if (current.view === 'area' && current.area === p && content.childElementCount) { markNav(p, s); if (s) { const el = $(`sec-${p}-${s}`); if (el) el.scrollIntoView(); } else window.scrollTo(0, 0); return; }
    return renderArea(p, s);
  }
  renderArea(AREAS[0].id);
}

/* ---------- busca ---------- */
let qT;
$('q').addEventListener('input', () => { clearTimeout(qT); qT = setTimeout(() => { route(); }, 140); });
$('q').addEventListener('keydown', e => { if (e.key === 'Escape') { $('q').value = ''; route(); } });
window.addEventListener('hashchange', () => { if ($('q').value) $('q').value = ''; route(); });
// abre os exemplos para a impressão e fecha depois
let opened = [];
window.addEventListener('beforeprint', () => {
  opened = [...document.querySelectorAll('.fb-ex:not([open])')]; opened.forEach(d => d.open = true);
  // cabeçalho do PDF: o que está sendo impresso e quando
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  $('print-meta').textContent = [$('view-title').textContent, $('view-count').textContent, 'gerado em ' + hoje].filter(Boolean).join(' · ');
});
window.addEventListener('afterprint', () => { opened.forEach(d => d.open = false); opened = []; });
/* PDF só para quem se cadastrou com e-mail. O arquivo pdf/ok.json fica atrás do Cloudflare Access:
   quem já confirmou o e-mail recebe o JSON; quem não confirmou recebe um redirecionamento para a tela de entrada.
   No teste local (sem Access) tudo aparece liberado; para ver o estado bloqueado, use ?simular=bloqueado. */
/* Chave geral do PDF: enquanto o Cloudflare Access de /pdf não estiver configurado, o botão fica escondido e o
   Ctrl+P imprime só um aviso de "em breve". Para religar, troque para true. */
const PDF_ATIVO = false;
let pdfLiberado = false;
const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
const checaPdf = local && new URLSearchParams(location.search).get('simular') === 'bloqueado' ? Promise.resolve(false)
  : fetch('pdf/ok.json', { cache: 'no-store', credentials: 'same-origin', redirect: 'manual' })
    .then(r => (r.ok ? r.json() : null)).then(d => !!(d && d.liberado)).catch(() => false);
function setPdf(ok) {
  pdfLiberado = ok;
  document.documentElement.classList.toggle('pdf-liberado', ok);
  $('print').textContent = ok ? 'Imprimir / PDF' : 'Gerar PDF · cadastro grátis';
}
function abrirCadastro() {
  const link = $('pdf-cadastro'), dlg = $('pdf-dlg');
  link.href = 'pdf/?volta=' + encodeURIComponent(location.hash); // depois do cadastro, volta para esta mesma vista
  if (dlg.showModal) dlg.showModal(); else location.href = link.href;
}
if (!PDF_ATIVO) document.documentElement.classList.add('pdf-desligado');
else checaPdf.then(ok => {
  $('print').hidden = false;
  setPdf(ok);
  const q = new URLSearchParams(location.search);
  if (!q.has('pdf')) return;            // chegou de pdf/ depois do cadastro: gera o PDF
  q.delete('pdf');
  history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  if (ok) document.fonts.ready.then(() => setTimeout(() => window.print(), 700)); else abrirCadastro();
});
$('print').addEventListener('click', () => (pdfLiberado ? window.print() : abrirCadastro()));
$('pdf-dlg').addEventListener('close', () => $('print').focus()); // ao fechar o aviso, o foco volta ao botão

/* altura do cabeçalho fixo, para a navegação lateral e a rolagem até as âncoras */
const hdr = document.querySelector('header.top');
const setHdr = () => document.documentElement.style.setProperty('--hdr', hdr.offsetHeight + 'px');
setHdr(); window.addEventListener('resize', setHdr);
// no celular a árvore de áreas começa fechada
const mq = matchMedia('(max-width: 900px)');
const syncTree = () => { $('treebox').open = !mq.matches; };
syncTree(); mq.addEventListener('change', syncTree);
// ao escolher uma área no celular, fecha a árvore
$('tree').addEventListener('click', e => { if (mq.matches && e.target.closest('a')) $('treebox').open = false; });

buildTree(); route();
window.FORMULAS_PLAIN = plain; // usado nos testes da página
})();
