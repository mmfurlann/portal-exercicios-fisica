/* FÍSICA QUEST · menu de atividades e painel do aluno (página quest.html). */
(function () {
  const QUEST = window.QUEST;
  const UI = QUEST.ui;
  const ST = QUEST.armazenamento;

  function infoDaAtividade(a, dados) {
    const st = dados.atividades[a.id];
    return st && st.sessoes ? 'Recorde: ' + st.recorde + ' pontos' : 'Ainda sem sessões';
  }

  function desenhar() {
    const dados = ST.carregar();
    const cards = QUEST.registro.ativas().map(a => UI.ActivityCard({ numero: a.numero, nome: a.nome, frase: a.frase,
      pagina: a.pagina, disponivel: true, info: infoDaAtividade(a, dados) }));
    const futuras = QUEST.registro.planejadas().map(p => UI.ActivityCard({ numero: p.numero, nome: p.nome, frase: p.frase, disponivel: false }));
    document.getElementById('fq-cards').innerHTML = cards.concat(futuras).join('');
    document.getElementById('fq-progresso').innerHTML = UI.ResumoProgresso(ST.totais(dados));
  }

  document.getElementById('fq-reiniciar').addEventListener('click', () => {
    if (window.confirm('Apagar seu progresso neste navegador? Pontos, sessões e recordes serão zerados.')) {
      ST.limpar();
      desenhar();
    }
  });

  document.querySelectorAll('[data-cenario]').forEach(el => {
    el.innerHTML = UI.FOGUETE_V + UI.FOGUETE_V + UI.FOGUETE_V;
  });

  desenhar();
})();
