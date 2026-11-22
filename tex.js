/* Renderiza em LaTeX (KaTeX) todo elemento com data-tex. O texto que já está dentro do elemento
   fica como alternativa caso o KaTeX não carregue. Macros em português: \sen, \tg, \cotg. */
(function () {
  const MACROS = { '\\sen': '\\operatorname{sen}', '\\tg': '\\operatorname{tg}', '\\cotg': '\\operatorname{cotg}' };
  function render() {
    if (!window.katex) return;
    document.querySelectorAll('[data-tex]').forEach(function (el) {
      if (el.dataset.texOk) return;
      try {
        el.innerHTML = katex.renderToString(el.dataset.tex, { displayMode: true, throwOnError: false, macros: MACROS, strict: false });
        el.dataset.texOk = '1';
        el.classList.add('tex');
      } catch (e) { /* mantém o texto simples */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
