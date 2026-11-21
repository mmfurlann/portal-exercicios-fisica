/* FÍSICA QUEST · motor · regras de pontuação (funções puras, sem tela).
   Acerto: +100 pontos. Erro: 0 e a sequência volta a zero.
   Bônus de sequência: +25 a cada três acertos seguidos (no 3º, 6º, 9º… acerto).
   Pontuação máxima de N questões: 100·N + 25·⌊N/3⌋ (todas certas, com todos os bônus). */
(function () {
  const QUEST = (window.QUEST = window.QUEST || {});
  const PONTOS_ACERTO = 100;
  const BONUS_SEQUENCIA = 25;
  const TAMANHO_SEQUENCIA = 3;

  // Calcula o que um acerto (ou erro) rende, dado o tamanho da sequência anterior.
  function pontuar(sequenciaAnterior, acertou) {
    if (!acertou) return { ganho: 0, bonus: 0, sequencia: 0 };
    const sequencia = sequenciaAnterior + 1;
    const bonus = sequencia % TAMANHO_SEQUENCIA === 0 ? BONUS_SEQUENCIA : 0;
    return { ganho: PONTOS_ACERTO, bonus: bonus, sequencia: sequencia };
  }

  // Pontuação máxima possível para n questões respondidas.
  function maximo(n) {
    return PONTOS_ACERTO * n + BONUS_SEQUENCIA * Math.floor(n / TAMANHO_SEQUENCIA);
  }

  // Percentual de aproveitamento: pontos obtidos sobre a pontuação máxima.
  function aproveitamento(pontos, n) {
    const m = maximo(n);
    return m > 0 ? Math.round((pontos / m) * 100) : 0;
  }

  // Quantos acertos seguidos faltam para o próximo bônus de sequência.
  function faltamParaBonus(sequencia) {
    return TAMANHO_SEQUENCIA - (sequencia % TAMANHO_SEQUENCIA);
  }

  QUEST.pontuacao = {
    PONTOS_ACERTO: PONTOS_ACERTO,
    BONUS_SEQUENCIA: BONUS_SEQUENCIA,
    TAMANHO_SEQUENCIA: TAMANHO_SEQUENCIA,
    pontuar: pontuar,
    maximo: maximo,
    aproveitamento: aproveitamento,
    faltamParaBonus: faltamParaBonus
  };
})();
