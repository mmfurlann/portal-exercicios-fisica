/* FÍSICA QUEST · motor · sorteio de questões.
   Dentro de uma sessão nunca há repetição: cada questão entra no máximo uma vez.
   Entre sessões, as questões ainda não vistas têm preferência; as já vistas só
   entram quando o banco de questões inéditas acaba. rng é injetável para testes. */
(function () {
  const QUEST = (window.QUEST = window.QUEST || {});

  // Embaralhamento de Fisher-Yates; devolve uma cópia.
  function embaralhar(lista, rng) {
    const a = lista.slice();
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Escolhe até n questões de pool, sem repetição, preferindo as não vistas (conjunto vistas: ids).
  function escolher(pool, n, opcoes) {
    const o = opcoes || {};
    const vistas = o.vistas || new Set();
    const rng = o.rng || Math.random;
    const novas = embaralhar(pool.filter(q => !vistas.has(q.id)), rng);
    const antigas = embaralhar(pool.filter(q => vistas.has(q.id)), rng);
    return novas.concat(antigas).slice(0, Math.min(n, pool.length));
  }

  // Ordem de exibição das alternativas: a interface mostra A–D embaralhados a cada apresentação.
  function ordemDasOpcoes(total, rng) {
    return embaralhar(Array.from({ length: total }, (_, i) => i), rng || Math.random);
  }

  QUEST.sorteio = { embaralhar: embaralhar, escolher: escolher, ordemDasOpcoes: ordemDasOpcoes };
})();
