/* Renderiza em LaTeX (KaTeX) todo elemento com data-tex. O texto que já está dentro do elemento
   fica como alternativa caso o KaTeX não carregue. Macros em português: \sen, \tg, \cotg. */
(function () {
  const MACROS = { '\\sen': '\\operatorname{sen}', '\\tg': '\\operatorname{tg}', '\\cotg': '\\operatorname{cotg}' };
  function render() {
    if (!window.katex) return;
    /* data-tex: fórmula em bloco · data-tex-i: fórmula na linha do texto */
    document.querySelectorAll('[data-tex], [data-tex-i]').forEach(function (el) {
      if (el.dataset.texOk) return;
      const inline = el.hasAttribute('data-tex-i');
      try {
        el.innerHTML = katex.renderToString(inline ? el.dataset.texI : el.dataset.tex, { displayMode: !inline, throwOnError: false, macros: MACROS, strict: false });
        el.dataset.texOk = '1';
        if (!inline) el.classList.add('tex');
      } catch (e) { /* mantém o texto simples */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
