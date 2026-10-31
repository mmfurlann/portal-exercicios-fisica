/*
 * A Jornada até Einstein — banco de questões
 * ------------------------------------------------------------
 * 50 questões originais, inspiradas no formato pedagógico do ENEM.
 * Nível (level) 1..5 = região do tabuleiro em que a questão aparece.
 *
 * Campos de cada questão:
 *   id, theme, level, kind ('conceito' | 'calculo' | 'lab'), big, final,
 *   statement, figure?, alternatives[5], correct (índice 0..4),
 *   solution (resolução comentada, parágrafos separados por \n),
 *   distractors[5] (null na correta; {kind, text} nas demais),
 *   hint (opcional)
 *
 * Marcação leve nos textos:  ^{2} = sobrescrito,  _{0} = subscrito.
 * Ao carregar, espaços entre grupos de milhares viram espaços sem quebra.
 * Salvo indicação, adote g = 10 m/s².
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.JE = root.JE || {}; root.JE.Questions = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var THEMES = {
    grandezas:    { id: 'grandezas',    label: 'Grandezas e medidas' },
    cinematica:   { id: 'cinematica',   label: 'Cinemática e gráficos do movimento' },
    newton:       { id: 'newton',       label: 'Leis de Newton' },
    energia:      { id: 'energia',      label: 'Trabalho, energia e potência' },
    gravitacao:   { id: 'gravitacao',   label: 'Gravitação' },
    termologia:   { id: 'termologia',   label: 'Termologia e calorimetria' },
    ondas:        { id: 'ondas',        label: 'Ondulatória e acústica' },
    optica:       { id: 'optica',       label: 'Óptica' },
    eletrostatica:{ id: 'eletrostatica',label: 'Eletrostática' },
    circuitos:    { id: 'circuitos',    label: 'Circuitos elétricos' },
    magnetismo:   { id: 'magnetismo',   label: 'Magnetismo e eletromagnetismo' },
    moderna:      { id: 'moderna',      label: 'Física moderna' },
    aplicacoes:   { id: 'aplicacoes',   label: 'Aplicações tecnológicas e ambientais' }
  };

  var C = 'conceitual';
  var K = 'calculo';
  function d(kind, text) { return { kind: kind, text: text }; }

  var RAW = [];
  function add(q) { RAW.push(q); }

  /* ===================================================================
   * NÍVEL 1 — Curiosidade científica (fácil)
   * =================================================================== */

  add({
    id: 'Q01', theme: 'grandezas', level: 1, kind: 'conceito',
    statement: 'Em uma feira de ciências, uma equipe mediu a massa de uma mochila escolar com uma balança, o tempo que um carrinho de brinquedo levou para atravessar uma mesa e o comprimento dessa mesa.\nNo Sistema Internacional de Unidades (SI), as unidades de base adequadas para registrar essas três grandezas são, respectivamente:',
    alternatives: [
      'grama (g), minuto (min) e centímetro (cm)',
      'newton (N), hora (h) e metro (m)',
      'quilograma (kg), segundo (s) e metro (m)',
      'quilograma (kg), segundo (s) e quilômetro (km)',
      'litro (L), segundo (s) e metro (m)'
    ],
    correct: 2,
    solution: 'O SI define uma unidade de base para cada grandeza fundamental: massa → quilograma (kg); tempo → segundo (s); comprimento → metro (m).\nGramas, minutos e centímetros são unidades muito usadas no dia a dia, mas não são as unidades de base. O newton mede força e o litro mede volume — outras grandezas.\nAo registrar medidas em um experimento, usar as unidades de base evita erros de conversão nos cálculos.',
    distractors: [
      d(C, 'São unidades métricas comuns, mas não são as unidades de base do SI. O SI usa o quilograma, o segundo e o metro.'),
      d(C, 'O newton é a unidade de força, não de massa. Massa e força são grandezas diferentes.'),
      null,
      d(C, 'O quilômetro é um múltiplo do metro. A unidade de base do SI para comprimento é o metro.'),
      d(C, 'O litro mede volume (capacidade), não massa.')
    ],
    hint: 'O SI tem sete unidades de base; massa, tempo e comprimento estão entre elas.'
  });

  add({
    id: 'Q02', theme: 'grandezas', level: 1, kind: 'calculo', big: true,
    statement: 'Em uma avenida, a velocidade máxima permitida é 54 km/h. Para comparar esse limite com a velocidade de um ciclista que pedala a 12 m/s, um estudante converteu o limite para m/s.\nQual é o valor correto da conversão e a conclusão adequada da comparação?',
    alternatives: [
      '194,4 m/s; o limite da avenida é muito maior que a velocidade do ciclista.',
      '15 m/s; o ciclista é mais rápido que o limite da avenida.',
      '15 m/s; o limite da avenida é maior que a velocidade do ciclista.',
      '0,9 m/s; o ciclista é mais rápido que o limite da avenida.',
      '54 m/s; o limite da avenida é muito maior que a velocidade do ciclista.'
    ],
    correct: 2,
    solution: 'Como 1 km = 1 000 m e 1 h = 3 600 s, temos 1 km/h = 1 000/3 600 m/s = 1/3,6 m/s. Para passar de km/h para m/s, divide-se por 3,6.\n54 km/h ÷ 3,6 = 15 m/s.\nComparando: 15 m/s > 12 m/s, logo o limite da avenida é maior que a velocidade do ciclista.',
    distractors: [
      d(K, 'Multiplicar por 3,6 faz a conversão no sentido contrário (de m/s para km/h). Aqui é preciso dividir.'),
      d(C, 'A conversão está certa, mas a conclusão foi invertida: 15 m/s é maior que 12 m/s.'),
      null,
      d(K, 'Dividir por 60 transforma km/h em km/min, não em m/s. O fator correto é 3,6.'),
      d(C, 'Km/h e m/s são unidades diferentes: sem conversão não é possível comparar os valores.')
    ],
    hint: 'Para passar de km/h para m/s, divida por 3,6.'
  });

  add({
    id: 'Q03', theme: 'cinematica', level: 1, kind: 'lab',
    statement: 'Em uma aula de laboratório, um estudante cronometrou o tempo que um carrinho levou para percorrer diferentes distâncias em uma pista reta e plana. Os resultados estão na tabela.\nA partir desses dados, é correto afirmar que o carrinho se moveu com:',
    figure: {
      type: 'table', caption: 'Medidas do carrinho na pista',
      headers: ['Distância percorrida (m)', 'Tempo (s)'],
      rows: [['1,0', '2,0'], ['2,0', '4,0'], ['3,0', '6,0']]
    },
    alternatives: [
      'velocidade constante de 2,0 m/s, obtida dividindo-se o tempo pela distância.',
      'aceleração constante de 0,50 m/s², pois a velocidade aumenta 0,50 m/s a cada segundo.',
      'velocidade constante de 0,50 m/s, pois a razão entre a distância e o tempo é a mesma nas três medidas.',
      'velocidade variável, pois quanto maior a distância percorrida, maior é a velocidade.',
      'velocidade de 0,50 m/s somente no primeiro trecho, passando a acelerar depois.'
    ],
    correct: 2,
    solution: 'A velocidade média é a razão entre a distância percorrida e o tempo gasto: v = Δs/Δt.\n1,0/2,0 = 0,50 m/s; 2,0/4,0 = 0,50 m/s; 3,0/6,0 = 0,50 m/s.\nComo a razão é a mesma em todas as medidas, a distância é proporcional ao tempo: o movimento é uniforme, com velocidade constante de 0,50 m/s.',
    distractors: [
      d(K, 'Dividir tempo por distância inverte a razão: o resultado seria em s/m, não em m/s.'),
      d(C, 'A tabela não indica variação de velocidade. Uma aceleração (m/s²) exigiria que a razão distância/tempo mudasse.'),
      null,
      d(C, 'Distância maior com tempo proporcionalmente maior mantém a mesma velocidade. Maior distância não significa maior velocidade.'),
      d(C, 'As três medidas têm a mesma razão distância/tempo; não há mudança de comportamento ao longo do movimento.')
    ],
    hint: 'Calcule distância ÷ tempo para cada linha da tabela e compare.'
  });

  add({
    id: 'Q04', theme: 'termologia', level: 1, kind: 'conceito',
    statement: 'Em uma manhã fria, uma pessoa toca com a mão a maçaneta metálica e a porta de madeira de uma sala. Ambas estão em equilíbrio térmico com o ambiente, à mesma temperatura, mas a maçaneta parece mais fria.\nEssa sensação ocorre porque:',
    alternatives: [
      'o metal está a uma temperatura menor que a da madeira.',
      'o metal conduz calor melhor que a madeira e retira energia da mão com maior rapidez.',
      'o frio passa da maçaneta para a mão, e a madeira não transmite frio.',
      'o metal é isolante térmico e, por isso, não aquece ao ser tocado.',
      'a madeira possui mais calor armazenado que o metal e aquece a mão.'
    ],
    correct: 1,
    solution: 'O enunciado diz que os dois objetos estão à mesma temperatura. A diferença está na condutividade térmica: o metal é bom condutor e, ao ser tocado, retira calor da mão (mais quente) rapidamente. A madeira é má condutora e retira calor devagar.\nNossa pele sente a rapidez com que perdemos energia, não a temperatura do objeto. Por isso o metal “parece” mais frio.',
    distractors: [
      d(C, 'O enunciado informa que os dois objetos têm a mesma temperatura.'),
      null,
      d(C, 'Não existe “frio” que se transfere. O que flui é calor, do corpo mais quente (a mão) para o mais frio.'),
      d(C, 'Os metais são excelentes condutores térmicos, não isolantes.'),
      d(C, 'Calor é energia em trânsito, e não algo “armazenado”. A madeira está à mesma temperatura do metal.')
    ],
    hint: 'Pense em quem conduz melhor o calor: metal ou madeira.'
  });

  add({
    id: 'Q05', theme: 'optica', level: 1, kind: 'conceito',
    statement: 'Uma lanterna acesa ilumina uma bola de futebol colocada entre ela e uma parede, formando uma sombra circular na parede. Mantendo a lanterna e a parede fixas, um estudante aproxima a bola da lanterna.\nConsiderando que a luz se propaga em linha reta, o tamanho da sombra na parede:',
    alternatives: [
      'diminui, pois a bola fica mais perto da fonte e bloqueia menos raios.',
      'permanece o mesmo, pois a bola não mudou de tamanho.',
      'aumenta, pois os raios que tangenciam a bola formam um cone de luz que se abre mais até chegar à parede.',
      'desaparece, pois a luz contorna a bola quando ela está muito próxima da lanterna.',
      'fica mais nítida, mas com o mesmo tamanho, pois a sombra depende só da bola.'
    ],
    correct: 2,
    solution: 'Como a luz se propaga em linha reta, os raios que passam rente à borda da bola delimitam a sombra. Esses raios partem da lanterna e se afastam uns dos outros.\nQuanto mais perto da lanterna está a bola, mais aberto é o feixe que ela intercepta, e maior é a região sem luz na parede: a sombra aumenta.',
    distractors: [
      d(C, 'Perto da fonte, a bola intercepta um feixe mais aberto, e não menos raios.'),
      d(C, 'O tamanho da sombra depende também da posição da bola em relação à fonte e à parede, e não só do tamanho da bola.'),
      null,
      d(C, 'A luz não contorna objetos grandes como uma bola; ela se propaga em linha reta.'),
      d(C, 'A posição da bola altera as proporções do cone de sombra; o tamanho muda.')
    ],
    hint: 'Desenhe os raios que tocam a borda da bola, saindo da lanterna.'
  });

  add({
    id: 'Q06', theme: 'ondas', level: 1, kind: 'conceito',
    statement: 'Em uma cena de ficção científica, uma nave explode no espaço sideral e a tripulação de outra nave, a quilômetros de distância, ouve um grande estrondo.\nDo ponto de vista da Física, a cena é inadequada porque:',
    alternatives: [
      'a luz da explosão chegaria depois do som, o que não é mostrado na cena.',
      'o som é uma onda mecânica e precisa de um meio material para se propagar, o que não existe no vácuo do espaço.',
      'o som é uma onda eletromagnética, que seria absorvida pelo vácuo.',
      'a baixíssima temperatura do espaço congelaria as ondas sonoras.',
      'explosões só produzem luz, nunca som, em qualquer ambiente.'
    ],
    correct: 1,
    solution: 'O som é uma onda mecânica: propaga-se pela vibração das partículas de um meio material (ar, água, sólidos). No vácuo não há partículas para vibrar, e o som não se propaga.\nJá a luz é uma onda eletromagnética e se propaga no vácuo, por isso vemos as estrelas, mas não “ouvimos” explosões no espaço.',
    distractors: [
      d(C, 'Na verdade a luz é muito mais rápida que o som e chegaria antes — e o problema da cena é outro: no vácuo o som nem se propaga.'),
      null,
      d(C, 'O som não é onda eletromagnética: é onda mecânica e longitudinal. A luz é que é eletromagnética.'),
      d(C, 'Ondas sonoras não “congelam”. A temperatura não é o fator que impede a propagação: o que falta é um meio material.'),
      d(C, 'Explosões no ar, na água ou em sólidos produzem som. O problema, na cena, é a ausência de meio no espaço.')
    ],
    hint: 'Som precisa de um meio para se propagar. E no espaço?'
  });

  add({
    id: 'Q07', theme: 'eletrostatica', level: 1, kind: 'lab',
    statement: 'Em um experimento, um estudante atritou um pente de plástico em cabelo seco e, em seguida, aproximou o pente de pedacinhos de papel sobre uma mesa. Os pedaços de papel foram atraídos pelo pente.\nQual explicação é adequada para o fenômeno?',
    alternatives: [
      'O atrito criou cargas elétricas a partir do nada, e elas atraem o papel.',
      'O pente se transformou em um ímã, que atrai o papel por magnetismo.',
      'O atrito transferiu elétrons e eletrizou o pente; o pente eletrizado polariza o papel, que é atraído.',
      'O calor do atrito aqueceu o ar, que empurra o papel até o pente.',
      'A atração gravitacional do pente aumentou depois de atritado.'
    ],
    correct: 2,
    solution: 'No atrito, elétrons passam de um material para o outro: o pente fica eletrizado (com excesso ou falta de elétrons). Cargas não são criadas, apenas transferidas (conservação da carga).\nO pente eletrizado causa uma separação de cargas no papel neutro (polarização): as cargas de sinal oposto ficam mais próximas do pente. A atração sobre elas é maior que a repulsão sobre as de mesmo sinal, e o papel é atraído.',
    distractors: [
      d(C, 'A carga elétrica não é criada: no atrito, elétrons são transferidos de um corpo para outro.'),
      d(C, 'O papel não é atraído por ímãs, e o pente não virou ímã. O fenômeno é eletrostático, não magnético.'),
      null,
      d(C, 'Correntes de ar não explicam uma atração tão específica e imediata. O efeito está ligado a forças elétricas.'),
      d(C, 'A força gravitacional entre objetos tão pequenos é desprezível e não muda com o atrito.')
    ],
    hint: 'O atrito transfere elétrons. O que acontece com o papel neutro perto de um corpo eletrizado?'
  });

  add({
    id: 'Q08', theme: 'aplicacoes', level: 1, kind: 'calculo', big: true,
    statement: 'Uma lâmpada de LED de 9 W produz a mesma iluminação que uma lâmpada incandescente de 60 W. Em uma casa, cada lâmpada fica acesa por 5 h por dia.\nAo substituir uma lâmpada incandescente por uma de LED, a economia de energia elétrica em um dia é de:',
    alternatives: [
      '0,045 kWh',
      '0,255 kWh',
      '0,300 kWh',
      '2,55 kWh',
      '0,255 kW'
    ],
    correct: 1,
    solution: 'Energia = potência × tempo. A diferença de potência é 60 W − 9 W = 51 W.\nEconomia = 51 W × 5 h = 255 Wh = 0,255 kWh por dia, para cada lâmpada trocada.\nAo longo de um mês, isso significa cerca de 7,7 kWh economizados por lâmpada.',
    distractors: [
      d(C, '0,045 kWh (9 W × 5 h) é o consumo diário do LED, não a economia.'),
      null,
      d(C, '0,300 kWh (60 W × 5 h) é o consumo diário da incandescente, não a economia.'),
      d(K, 'Houve erro ao converter Wh para kWh: 255 Wh = 0,255 kWh (divide-se por 1 000).'),
      d(C, 'O kW é unidade de potência. A economia de energia deve ser expressa em unidades de energia, como o kWh.')
    ],
    hint: 'Economia = (diferença de potência) × (tempo de uso).'
  });

  add({
    id: 'Q09', theme: 'gravitacao', level: 1, kind: 'conceito',
    statement: 'Na superfície da Lua, a aceleração da gravidade é aproximadamente um sexto da terrestre. Um astronauta de massa 90 kg, que na Terra tem peso de 900 N, vai à Lua.\nNesse local, sua massa e seu peso valem, respectivamente:',
    alternatives: [
      '15 kg e 150 N',
      '90 kg e 900 N',
      '90 kg e 150 N',
      '90 kg e 5 400 N',
      '15 kg e 25 N'
    ],
    correct: 2,
    solution: 'Massa é a quantidade de matéria do corpo e não depende do lugar: continua 90 kg.\nPeso é a força gravitacional, P = m·g. Na Lua, g vale 1/6 do valor terrestre, então o peso também é 1/6: 900 N ÷ 6 = 150 N.',
    distractors: [
      d(C, 'A massa não muda de um lugar para outro. Só o peso depende da gravidade local.'),
      d(C, 'O peso depende de g. Como a gravidade lunar é menor, o peso também é menor.'),
      null,
      d(K, 'A gravidade lunar é menor que a terrestre; o peso diminui (÷ 6), não aumenta (× 6).'),
      d(C, 'A massa não varia com o local, e a redução de 1/6 se aplica ao peso uma única vez.')
    ],
    hint: 'Massa é uma propriedade do corpo; peso é uma força que depende de g.'
  });

  add({
    id: 'Q10', theme: 'magnetismo', level: 1, kind: 'conceito',
    statement: 'Dois ímãs em forma de barra são aproximados por uma de suas extremidades e se repelem.\nCom base nessa observação, é correto concluir que:',
    alternatives: [
      'as extremidades que se aproximaram têm polos de nomes diferentes.',
      'as extremidades que se aproximaram têm polos de mesmo nome.',
      'um dos objetos não é ímã, pois ímãs só se atraem.',
      'a repulsão ocorre porque as duas barras têm cargas elétricas de mesmo sinal.',
      'a repulsão ocorre porque os ímãs têm massas diferentes.'
    ],
    correct: 1,
    solution: 'Entre polos magnéticos vale uma regra semelhante à das cargas elétricas: polos de mesmo nome (norte-norte ou sul-sul) se repelem; polos de nomes diferentes se atraem.\nComo houve repulsão, as extremidades aproximadas têm o mesmo polo. A explicação não envolve carga elétrica nem massa.',
    distractors: [
      d(C, 'Polos de nomes diferentes se atraem, e não se repelem.'),
      null,
      d(C, 'Ímãs podem se atrair ou se repelir, dependendo dos polos aproximados.'),
      d(C, 'Ímãs são, em geral, eletricamente neutros. A interação aqui é magnética, não eletrostática.'),
      d(C, 'A massa não determina a repulsão magnética. O que importa são os polos.')
    ],
    hint: 'Pense na regra “polos iguais se repelem”.'
  });

  /* ===================================================================
   * NÍVEL 2 — Aprendiz de Física (fácil a intermediário)
   * =================================================================== */

  add({
    id: 'Q11', theme: 'cinematica', level: 2, kind: 'calculo',
    statement: 'Um drone de entrega desloca-se em linha reta com velocidade constante. Sua posição, medida em metros a partir da central de entregas, é dada por s = 50 + 20·t, com t em segundos.\nO drone passará pela posição 450 m no instante:',
    alternatives: [
      '9 050 s',
      '22,5 s',
      '20 s',
      '25 s',
      '400 s'
    ],
    correct: 2,
    solution: 'Substituímos s = 450 m na função horária: 450 = 50 + 20·t.\n20·t = 450 − 50 = 400, logo t = 400/20 = 20 s.\nVerificação: s(20) = 50 + 20·20 = 450 m.',
    distractors: [
      d(C, 'Foi colocado 450 no lugar do tempo. O valor 450 é uma posição (s), e queremos descobrir o instante t.'),
      d(K, 'Ignorou-se a posição inicial de 50 m: 450/20 não resolve 450 = 50 + 20·t.'),
      null,
      d(K, 'A posição inicial deve ser subtraída: (450 − 50)/20. Somar resulta em 25 s.'),
      d(C, '400 m é o deslocamento do drone, e não um tempo. Falta dividir pela velocidade (20 m/s).')
    ],
    hint: 'Substitua s = 450 na equação e isole t.'
  });

  add({
    id: 'Q12', theme: 'newton', level: 2, kind: 'calculo',
    statement: 'Um carro de 1 200 kg parte do repouso e adquire aceleração constante de 2,5 m/s² em uma estrada reta e horizontal. Desprezando as resistências ao movimento, a força resultante sobre o carro tem intensidade de:',
    alternatives: [
      '480 N',
      '1 202,5 N',
      '3 000 N',
      '12 000 N',
      '30 000 N'
    ],
    correct: 2,
    solution: 'Segunda lei de Newton: a força resultante é igual ao produto da massa pela aceleração, F_{R} = m·a.\nF_{R} = 1 200 kg × 2,5 m/s² = 3 000 N.',
    distractors: [
      d(K, 'Dividir a massa pela aceleração não dá uma força. A relação correta é F = m·a.'),
      d(C, 'Massa e aceleração têm unidades diferentes e não podem ser somadas. O correto é multiplicar.'),
      null,
      d(C, '12 000 N é o peso do carro (m·g, com g = 10 m/s²). A força resultante usa a aceleração do movimento.'),
      d(K, 'Há um erro de potência de dez no produto: 1 200 × 2,5 = 3 000.')
    ],
    hint: 'F = m · a.'
  });

  add({
    id: 'Q13', theme: 'energia', level: 2, kind: 'calculo',
    statement: 'Um ciclista de 80 kg (somando a massa da bicicleta) desloca-se em linha reta com velocidade de 5,0 m/s.\nA energia cinética do conjunto ciclista-bicicleta é de:',
    alternatives: [
      '200 J',
      '400 J',
      '1 000 J',
      '2 000 J',
      '4 000 J'
    ],
    correct: 2,
    solution: 'A energia cinética é E_{c} = ½·m·v^{2}.\nE_{c} = ½ × 80 × (5,0)^{2} = 40 × 25 = 1 000 J.\nO quadrado da velocidade mostra que dobrar a velocidade quadruplica a energia — por isso a velocidade pesa tanto na segurança do trânsito.',
    distractors: [
      d(K, 'A velocidade deve ser elevada ao quadrado. Usar ½·m·v dá um valor menor que o correto.'),
      d(C, 'O produto m·v é a quantidade de movimento (kg·m/s), e não energia.'),
      null,
      d(K, 'Faltou o fator ½ da fórmula E_{c} = ½·m·v^{2}.'),
      d(K, 'Foi usado 2·m·v^{2}, invertendo o fator ½.')
    ],
    hint: 'E_{c} = ½ m v^{2}.'
  });

  add({
    id: 'Q14', theme: 'termologia', level: 2, kind: 'lab', big: true,
    statement: 'Em um experimento de calorimetria, uma resistência de imersão aquece 0,50 kg de água, de 20 °C a 60 °C, em um recipiente bem isolado. O calor específico da água é 4 200 J/(kg·°C).\nA quantidade de calor absorvida pela água é de:',
    alternatives: [
      '84 J',
      '2 100 J',
      '84 000 J',
      '126 000 J',
      '168 000 J'
    ],
    correct: 2,
    solution: 'O calor sensível absorvido é Q = m·c·ΔT, em que ΔT é a variação de temperatura (final − inicial).\nΔT = 60 − 20 = 40 °C.\nQ = 0,50 × 4 200 × 40 = 84 000 J (84 kJ).',
    distractors: [
      d(K, 'Houve erro de unidade: o cálculo resulta em 84 kJ, isto é, 84 000 J.'),
      d(C, 'Foi calculado apenas m·c. Falta multiplicar pela variação de temperatura.'),
      null,
      d(C, 'Usou-se a temperatura final (60 °C) como se fosse a variação. É preciso subtrair a temperatura inicial.'),
      d(C, 'As temperaturas foram somadas (80 °C). A variação é a diferença: 60 − 20 = 40 °C.')
    ],
    hint: 'Q = m · c · ΔT, com ΔT = T_{final} − T_{inicial}.'
  });

  add({
    id: 'Q15', theme: 'grandezas', level: 2, kind: 'lab',
    statement: 'Um perito precisa identificar de que material é feita uma peça maciça e homogênea. Ele mediu a massa da peça, 395 g, e, mergulhando-a em água, obteve seu volume: 50 cm^{3}. A tabela mostra a densidade de alguns metais.\nO material mais provável da peça é:',
    figure: {
      type: 'table', caption: 'Densidade de alguns metais',
      headers: ['Metal', 'Densidade (g/cm³)'],
      rows: [['Alumínio', '2,7'], ['Ferro', '7,9'], ['Cobre', '8,9'], ['Chumbo', '11,3']]
    },
    alternatives: [
      'alumínio',
      'ferro',
      'cobre',
      'chumbo',
      'não é possível identificar o material apenas com massa e volume.'
    ],
    correct: 1,
    solution: 'A densidade é a razão entre massa e volume: d = m/V.\nd = 395 g ÷ 50 cm³ = 7,9 g/cm³, valor que corresponde ao do ferro na tabela.\nComo cada substância tem uma densidade característica, medir massa e volume é um bom caminho para identificá-la.',
    distractors: [
      d(C, 'Se a peça fosse de alumínio, 50 cm³ teriam apenas 135 g (2,7 × 50), e não 395 g.'),
      null,
      d(C, 'Se a peça fosse de cobre, 50 cm³ teriam 445 g (8,9 × 50).'),
      d(C, 'Se a peça fosse de chumbo, 50 cm³ teriam 565 g (11,3 × 50).'),
      d(C, 'A densidade (massa ÷ volume) é uma propriedade característica das substâncias e permite identificá-las.')
    ],
    hint: 'Calcule a densidade da peça e compare com a tabela.'
  });

  add({
    id: 'Q16', theme: 'circuitos', level: 2, kind: 'calculo',
    statement: 'Uma lanterna usa duas pilhas em série que fornecem, ao todo, 3,0 V. A lâmpada tem resistência de 5,0 Ω, considerada constante.\nA corrente elétrica que percorre a lâmpada é de:',
    alternatives: [
      '0,30 A',
      '0,60 A',
      '1,7 A',
      '8,0 A',
      '15 A'
    ],
    correct: 1,
    solution: 'Pela primeira lei de Ohm, U = R·i, logo i = U/R.\ni = 3,0 V ÷ 5,0 Ω = 0,60 A.',
    distractors: [
      d(K, 'Há um erro de potência de dez: 3,0 ÷ 5,0 = 0,60 (e não 0,30).'),
      null,
      d(K, 'A razão foi invertida (R/U). A corrente é a tensão dividida pela resistência.'),
      d(C, 'Tensão (V) e resistência (Ω) não podem ser somadas. A relação é i = U/R.'),
      d(C, 'Multiplicar U por R não dá a corrente. Da lei de Ohm, i = U/R.')
    ],
    hint: 'U = R · i.'
  });

  add({
    id: 'Q17', theme: 'energia', level: 2, kind: 'calculo', big: true,
    statement: 'Em um parque, uma criança de 30 kg desce um escorregador, a partir do repouso, de uma altura de 1,8 m em relação ao solo. Considere o atrito desprezível e g = 10 m/s².\nA velocidade da criança ao chegar ao solo é de:',
    alternatives: [
      '4,2 m/s',
      '6,0 m/s',
      '18 m/s',
      '36 m/s',
      '540 m/s'
    ],
    correct: 1,
    solution: 'Sem atrito, a energia mecânica se conserva: toda a energia potencial gravitacional inicial vira energia cinética.\nm·g·h = ½·m·v^{2}, e a massa se cancela: v = √(2·g·h) = √(2 × 10 × 1,8) = √36 = 6,0 m/s.\nA massa da criança não influencia a velocidade final.',
    distractors: [
      d(K, 'Foi usada v = √(g·h), esquecendo o fator 2 de v = √(2·g·h).'),
      null,
      d(K, 'g·h = 18 é o valor de v^{2}/2; falta calcular a velocidade a partir da conservação.'),
      d(K, 'Esqueceu-se de extrair a raiz quadrada: 36 é v^{2}, e não v.'),
      d(C, '540 é a energia potencial em joules (m·g·h), e não uma velocidade.')
    ],
    hint: 'Energia potencial no alto = energia cinética embaixo.'
  });

  add({
    id: 'Q18', theme: 'ondas', level: 2, kind: 'calculo',
    statement: 'Uma boia no mar sobe e desce completando uma oscilação a cada 4,0 s, enquanto passam por ela ondas cujas cristas consecutivas estão separadas por 12 m (comprimento de onda).\nA velocidade de propagação dessas ondas é de:',
    alternatives: [
      '0,33 m/s',
      '3,0 m/s',
      '8,0 m/s',
      '16 m/s',
      '48 m/s'
    ],
    correct: 1,
    solution: 'A equação fundamental da ondulatória é v = λ·f.\nO período é T = 4,0 s, então a frequência é f = 1/T = 0,25 Hz.\nv = 12 m × 0,25 Hz = 3,0 m/s (equivalente a v = λ/T = 12/4,0).',
    distractors: [
      d(K, 'A razão foi invertida (T/λ). A velocidade é comprimento de onda dividido pelo período.'),
      null,
      d(C, 'Subtrair período e comprimento de onda não faz sentido físico: as grandezas são diferentes.'),
      d(C, 'Somar período e comprimento de onda também não faz sentido físico.'),
      d(C, 'Multiplicar λ pelo período confunde período com frequência. A velocidade é λ·f, ou λ/T.')
    ],
    hint: 'v = λ · f, e f = 1/T.'
  });

  add({
    id: 'Q19', theme: 'optica', level: 2, kind: 'calculo',
    statement: 'Uma pessoa está parada a 2,0 m de um espelho plano vertical. Em seguida, ela se aproxima 0,50 m do espelho.\nApós essa aproximação, a distância entre a pessoa e a sua imagem é de:',
    alternatives: [
      '1,5 m',
      '2,5 m',
      '3,0 m',
      '4,0 m',
      '5,0 m'
    ],
    correct: 2,
    solution: 'No espelho plano, a imagem é simétrica ao objeto: fica à mesma distância do espelho, só que do lado de trás.\nDepois de se aproximar, a pessoa está a 2,0 − 0,50 = 1,5 m do espelho, e a imagem também está a 1,5 m, atrás dele.\nDistância entre pessoa e imagem = 1,5 + 1,5 = 3,0 m.',
    distractors: [
      d(C, '1,5 m é só a distância da pessoa ao espelho. A imagem está a mais 1,5 m, atrás do espelho.'),
      d(K, 'Ao se aproximar, a distância diminui: 2,0 − 0,50, e não 2,0 + 0,50.'),
      null,
      d(C, '4,0 m era a distância inicial entre pessoa e imagem; ela se reduz quando a pessoa se aproxima.'),
      d(C, '5,0 m corresponde a um afastamento de 0,50 m (2 × 2,5 m) e não a uma aproximação.')
    ],
    hint: 'A imagem em espelho plano fica tão atrás do espelho quanto o objeto está na frente.'
  });

  add({
    id: 'Q20', theme: 'aplicacoes', level: 2, kind: 'calculo',
    statement: 'Um painel fotovoltaico de 2,0 m² de área recebe radiação solar de intensidade 1 000 W/m² e converte 20% da energia recebida em energia elétrica.\nA potência elétrica gerada pelo painel é de:',
    alternatives: [
      '40 W',
      '200 W',
      '400 W',
      '2 000 W',
      '10 000 W'
    ],
    correct: 2,
    solution: 'Potência solar recebida: 1 000 W/m² × 2,0 m² = 2 000 W.\nO rendimento é de 20% = 0,20, então a potência elétrica é 0,20 × 2 000 W = 400 W.\nO restante, 1 600 W, é perdido principalmente na forma de calor.',
    distractors: [
      d(K, 'O resultado ficou dez vezes menor que o correto: 0,20 × 2 000 = 400.'),
      d(C, 'A área do painel (2,0 m²) foi ignorada: ela multiplica a intensidade da radiação.'),
      null,
      d(C, '2 000 W é a potência solar recebida. Falta aplicar o rendimento de 20%.'),
      d(K, 'Multiplicou-se por 20 em vez de por 0,20 (20% = 0,20).')
    ],
    hint: 'Primeiro calcule a potência recebida; depois aplique o rendimento.'
  });

  /* ===================================================================
   * NÍVEL 3 — Jovem cientista (intermediário)
   * =================================================================== */

  add({
    id: 'Q21', theme: 'newton', level: 3, kind: 'calculo', big: true,
    statement: 'Uma pessoa de 60 kg está em pé sobre uma balança dentro de um elevador que sobe com aceleração constante de 2,0 m/s², a partir do repouso. Adote g = 10 m/s².\nNessas condições, a leitura da balança, que indica a força normal exercida sobre a pessoa, é de:',
    alternatives: [
      '480 N',
      '600 N',
      '720 N',
      '120 N',
      '1 200 N'
    ],
    correct: 2,
    solution: 'Sobre a pessoa agem duas forças verticais: a normal N (para cima, exercida pela balança) e o peso P = m·g (para baixo).\nComo o elevador acelera para cima, a resultante aponta para cima: N − P = m·a.\nN = m·(g + a) = 60 × (10 + 2,0) = 720 N.\nA balança indica mais que os 600 N do peso em repouso: a pessoa “se sente mais pesada”.',
    distractors: [
      d(C, 'Subtrair a aceleração de g vale para um elevador que acelera para baixo. Aqui a aceleração é para cima, e a normal é maior que o peso.'),
      d(C, '600 N é o peso (m·g) em repouso. Como o elevador acelera, a normal difere do peso.'),
      null,
      d(C, '120 N é m·a, a parte da normal que excede o peso — e não a normal total, que é N = m·g + m·a.'),
      d(K, 'Multiplicar g por a não tem sentido físico; deve-se somar: N = m·(g + a).')
    ],
    hint: 'Aplique F_{R} = m·a ao eixo vertical: N − P = m·a.'
  });

  add({
    id: 'Q22', theme: 'cinematica', level: 3, kind: 'lab',
    statement: 'O gráfico mostra a velocidade de um trem de metrô, em linha reta, durante os 20 s seguintes à sua saída de uma estação.\nA distância percorrida pelo trem nesse intervalo de tempo é de:',
    figure: {
      type: 'graph', caption: 'Velocidade do trem em função do tempo',
      alt: 'Gráfico da velocidade em função do tempo. A velocidade cresce linearmente de 0 a 10 m/s entre 0 e 5 s, permanece constante em 10 m/s até 15 s e decresce linearmente até zero em 20 s.',
      xLabel: 't (s)', yLabel: 'v (m/s)',
      points: [[0, 0], [5, 10], [15, 10], [20, 0]],
      xMax: 20, yMax: 12, xStep: 5, yStep: 2
    },
    alternatives: [
      '10 m',
      '50 m',
      '100 m',
      '150 m',
      '200 m'
    ],
    correct: 3,
    solution: 'Em um gráfico v × t, a distância percorrida é numericamente igual à área sob a curva.\nO gráfico forma um trapézio com base maior de 20 s (de 0 a 20 s), base menor de 10 s (de 5 s a 15 s) e altura de 10 m/s.\nÁrea = (20 + 10)/2 × 10 = 150 m.\nOutra forma: 25 m (rampa de subida) + 100 m (trecho constante) + 25 m (rampa de descida) = 150 m.',
    distractors: [
      d(C, '10 m/s é a velocidade máxima, e não uma distância. A distância é dada pela área sob o gráfico.'),
      d(K, '50 m corresponde apenas à soma das duas rampas (25 m + 25 m); falta o trecho de velocidade constante.'),
      d(C, '100 m corresponde apenas ao trecho de velocidade constante (10 m/s × 10 s); faltam as duas rampas.'),
      null,
      d(C, '200 m supõe 10 m/s durante os 20 s inteiros, mas o trem acelera no início e freia no fim.')
    ],
    hint: 'Distância = área sob o gráfico v × t.'
  });

  add({
    id: 'Q23', theme: 'energia', level: 3, kind: 'calculo', big: true,
    statement: 'Um guindaste eleva, com velocidade constante, uma carga de 500 kg até uma altura de 12 m em 20 s. Adote g = 10 m/s².\nA potência útil média desenvolvida pelo guindaste nessa tarefa é de:',
    alternatives: [
      '250 W',
      '300 W',
      '3 000 W',
      '6 000 W',
      '60 000 W'
    ],
    correct: 2,
    solution: 'Com velocidade constante, o trabalho do guindaste é igual ao ganho de energia potencial gravitacional: τ = m·g·h = 500 × 10 × 12 = 60 000 J.\nPotência média é trabalho dividido pelo tempo: P = τ/Δt = 60 000/20 = 3 000 W.',
    distractors: [
      d(C, 'A altura foi esquecida: 500 × 10 / 20 = 250. O trabalho depende de m·g·h.'),
      d(K, 'A aceleração da gravidade (g = 10 m/s²) foi omitida no cálculo do trabalho.'),
      null,
      d(K, 'Foi usado um tempo de 10 s em vez de 20 s.'),
      d(C, '60 000 é o trabalho em joules. Para obter a potência, ainda é preciso dividir pelo tempo.')
    ],
    hint: 'Potência = trabalho ÷ tempo, e o trabalho aqui é m·g·h.'
  });

  add({
    id: 'Q24', theme: 'circuitos', level: 3, kind: 'lab',
    statement: 'Em uma montagem de laboratório, três resistores de 10 Ω, 20 Ω e 30 Ω foram ligados em série a uma fonte ideal de 12 V, como mostra a figura.\nA tensão elétrica nos terminais do resistor de 30 Ω é de:',
    figure: {
      type: 'svg', caption: 'Três resistores em série com uma fonte de 12 V',
      alt: 'Circuito em série: fonte de 12 volts ligada a três resistores em sequência, de 10, 20 e 30 ohms.',
      viewBox: '0 0 360 170',
      body: '<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M40 70 V40 H60 M110 40 H140 M190 40 H220 M270 40 H320 V130 H40 V80"/>' +
        '<rect x="60" y="30" width="50" height="20" rx="3"/><rect x="140" y="30" width="50" height="20" rx="3"/><rect x="220" y="30" width="50" height="20" rx="3"/>' +
        '<path d="M24 70 H56"/><path d="M32 80 H48" stroke-width="5"/></g>' +
        '<g fill="currentColor" font-size="14" font-family="system-ui, sans-serif" font-weight="600">' +
        '<g text-anchor="middle"><text x="85" y="22">10 Ω</text><text x="165" y="22">20 Ω</text><text x="245" y="22">30 Ω</text></g>' +
        '<text x="62" y="82">12 V</text><text x="10" y="74">+</text><text x="12" y="88">−</text></g>'
    },
    alternatives: [
      '0,20 V',
      '2,0 V',
      '4,0 V',
      '6,0 V',
      '12 V'
    ],
    correct: 3,
    solution: 'Em série, as resistências se somam: R_{eq} = 10 + 20 + 30 = 60 Ω.\nA corrente é a mesma em todos os resistores: i = U/R_{eq} = 12/60 = 0,20 A.\nA tensão no resistor de 30 Ω é U = R·i = 30 × 0,20 = 6,0 V.\nConferência: 2,0 V + 4,0 V + 6,0 V = 12 V (soma das tensões = tensão da fonte).',
    distractors: [
      d(C, '0,20 V é o valor numérico da corrente (0,20 A), e não da tensão no resistor.'),
      d(C, '2,0 V é a tensão no resistor de 10 Ω (10 × 0,20), e não no de 30 Ω.'),
      d(C, 'A tensão não se divide igualmente: ela se divide em proporção às resistências, pois a corrente é a mesma.'),
      null,
      d(C, '12 V é a tensão da fonte, aplicada ao conjunto. Em série, cada resistor recebe apenas uma parte dela.')
    ],
    hint: 'Em série, a corrente é a mesma. Ache-a primeiro com R_{eq}.'
  });

  add({
    id: 'Q25', theme: 'ondas', level: 3, kind: 'calculo',
    statement: 'Um barco de pesquisa emite um pulso sonoro verticalmente para baixo e registra o eco vindo do fundo do mar 0,40 s depois. A velocidade do som na água do mar é de 1 500 m/s.\nA profundidade do local é de:',
    alternatives: [
      '150 m',
      '300 m',
      '600 m',
      '1 500 m',
      '3 750 m'
    ],
    correct: 1,
    solution: 'O pulso vai até o fundo e volta: nos 0,40 s ele percorre o dobro da profundidade.\n2·h = v·Δt = 1 500 × 0,40 = 600 m.\nh = 600/2 = 300 m.\nEsse é o princípio do sonar usado por barcos e submarinos.',
    distractors: [
      d(K, 'Foi dividido por 2 duas vezes. Basta uma divisão por 2 (ida e volta).'),
      null,
      d(C, '600 m é o caminho total percorrido pelo pulso (ida e volta). A profundidade é a metade.'),
      d(C, '1 500 m/s é a velocidade do som, e não uma distância.'),
      d(K, 'Foi feita a divisão v/Δt (1 500/0,40), em vez do produto v·Δt.')
    ],
    hint: 'O som percorre ida e volta até o fundo.'
  });

  add({
    id: 'Q26', theme: 'optica', level: 3, kind: 'calculo',
    statement: 'Um feixe de luz de uma única cor passa do ar, onde sua velocidade é 3,0×10^{8} m/s, para um vidro, onde a velocidade passa a ser 2,0×10^{8} m/s.\nO índice de refração do vidro e o que ocorre com a frequência e com o comprimento de onda da luz ao entrar no vidro são, respectivamente:',
    alternatives: [
      '1,5; a frequência permanece a mesma e o comprimento de onda diminui.',
      '0,67; a frequência permanece a mesma e o comprimento de onda diminui.',
      '1,5; a frequência diminui e o comprimento de onda permanece o mesmo.',
      '1,5; a frequência aumenta e o comprimento de onda diminui.',
      '0,67; a frequência diminui e o comprimento de onda aumenta.'
    ],
    correct: 0,
    solution: 'O índice de refração é n = c/v = (3,0×10^{8})/(2,0×10^{8}) = 1,5 (sempre maior ou igual a 1).\nA frequência é determinada pela fonte e não muda ao mudar de meio. Como v = λ·f, se v diminui e f é constante, o comprimento de onda λ diminui na mesma proporção.',
    distractors: [
      null,
      d(K, 'O índice de refração é c/v, e não v/c. Como v < c no vidro, n é maior que 1.'),
      d(C, 'Na refração é a frequência que se mantém, e o comprimento de onda é que se altera.'),
      d(C, 'A frequência não aumenta na refração: ela é determinada pela fonte da onda.'),
      d(K, 'n = v/c está invertido, e a frequência não diminui: ela permanece constante.')
    ],
    hint: 'n = c/v. A frequência não depende do meio.'
  });

  add({
    id: 'Q27', theme: 'termologia', level: 3, kind: 'calculo', big: true,
    statement: 'Em uma cozinha, 200 g de água a 80 °C são misturados a 300 g de água a 20 °C em um recipiente termicamente isolado. Desprezando a capacidade térmica do recipiente e perdas de calor, a temperatura final de equilíbrio da mistura é de:',
    alternatives: [
      '44 °C',
      '50 °C',
      '56 °C',
      '60 °C',
      '100 °C'
    ],
    correct: 0,
    solution: 'Em um sistema isolado, o calor cedido pela água quente é igual ao calor recebido pela água fria: Q_{1} + Q_{2} = 0.\n200·c·(T − 80) + 300·c·(T − 20) = 0. O calor específico c se cancela.\n200T − 16 000 + 300T − 6 000 = 0, então 500T = 22 000 e T = 44 °C.\nA temperatura final fica mais perto da água fria porque há mais massa dela.',
    distractors: [
      null,
      d(C, '50 °C é a média aritmética simples das temperaturas. Ela só vale se as massas forem iguais.'),
      d(K, 'As massas foram trocadas na média ponderada: a água quente (200 g) tem menos massa que a fria (300 g).'),
      d(K, 'Subtrair as temperaturas iniciais (80 − 20) não fornece a temperatura de equilíbrio.'),
      d(C, 'Somar as temperaturas não faz sentido. A temperatura final deve ficar entre 20 °C e 80 °C.')
    ],
    hint: 'Calor cedido + calor recebido = 0.'
  });

  add({
    id: 'Q28', theme: 'gravitacao', level: 3, kind: 'conceito',
    statement: 'Em transmissões ao vivo da Estação Espacial Internacional (ISS), que orbita a cerca de 400 km de altitude, os astronautas aparecem flutuando dentro da estação.\nA explicação física correta para esse fato é que:',
    alternatives: [
      'a força gravitacional da Terra é nula nessa altitude.',
      'a estação está fora da atração gravitacional da Terra, que só atua dentro da atmosfera.',
      'os astronautas e a estação estão em queda livre contínua ao redor da Terra, o que anula a sensação de peso.',
      'a ausência de ar no espaço faz com que os corpos flutuem.',
      'a rotação da Terra cria uma força que equilibra exatamente o peso dos astronautas.'
    ],
    correct: 2,
    solution: 'A gravidade a 400 km de altitude ainda é cerca de 90% da gravidade na superfície. A estação e os astronautas são atraídos pela Terra e “caem” o tempo todo, mas, como a estação se move lateralmente a cerca de 7,7 km/s, o chão da Terra “curva-se” sob eles: eles estão em órbita, em queda livre.\nComo tudo cai com a mesma aceleração, o astronauta não pressiona o piso da estação: não sente peso (ausência de peso aparente).',
    distractors: [
      d(C, 'A gravidade a 400 km ainda é cerca de 90% da gravidade na superfície; ela não é nula.'),
      d(C, 'A gravidade não depende da atmosfera: ela alcança grandes distâncias, e é ela que mantém a estação em órbita.'),
      null,
      d(C, 'Mesmo com ar, um corpo em queda livre “flutua” em relação ao ambiente em queda. A ausência de ar não explica o fenômeno.'),
      d(C, 'Não há uma força da rotação terrestre equilibrando o peso. A sensação de ausência de peso vem da queda livre.')
    ],
    hint: 'A gravidade lá em cima é quase a mesma. O que acontece com quem está em órbita?'
  });

  add({
    id: 'Q29', theme: 'magnetismo', level: 3, kind: 'lab',
    statement: 'Em uma atividade prática, estudantes enrolaram fio de cobre esmaltado em um prego de ferro, ligaram as extremidades do fio a uma pilha e contaram quantos clipes de aço o prego atraía. Repetiram o procedimento com diferentes números de espiras, sempre com a mesma pilha. Os resultados estão na tabela.\nA conclusão mais adequada a partir dos dados é que:',
    figure: {
      type: 'table', caption: 'Clipes atraídos pelo eletroímã',
      headers: ['Número de espiras', 'Clipes atraídos'],
      rows: [['10', '3'], ['20', '6'], ['30', '9'], ['40', '12']]
    },
    alternatives: [
      'o número de clipes atraídos independe do número de espiras.',
      'o fio de cobre é ferromagnético e atrai os clipes diretamente.',
      'ao aumentar o número de espiras, o campo magnético do eletroímã fica mais intenso e o número de clipes atraídos cresce proporcionalmente.',
      'o número de clipes diminui quando se acrescentam espiras, pois a corrente se esgota.',
      'o prego atrai clipes mesmo sem corrente elétrica, bastando enrolar o fio nele.'
    ],
    correct: 2,
    solution: 'A corrente elétrica no fio produz um campo magnético. Enrolar o fio em espiras reforça esse campo, e o prego de ferro, magnetizado, o intensifica ainda mais: temos um eletroímã.\nNa tabela, dobrando as espiras (10 → 20), o número de clipes também dobra (3 → 6); triplicando, triplica. Portanto, a intensidade do campo — e a força de atração — cresce com o número de espiras, de forma aproximadamente proporcional.',
    distractors: [
      d(C, 'Os dados mostram o contrário: o número de clipes aumenta quando o número de espiras aumenta.'),
      d(C, 'O cobre não é ferromagnético. É o campo magnético criado pela corrente que magnetiza o prego de ferro.'),
      null,
      d(C, 'Os dados mostram aumento do número de clipes com o número de espiras. A pilha é a mesma em todas as medidas.'),
      d(C, 'Sem corrente elétrica não há campo magnético do enrolamento: o eletroímã só funciona enquanto há corrente.')
    ],
    hint: 'Compare como o número de clipes varia quando o número de espiras dobra.'
  });

  add({
    id: 'Q30', theme: 'moderna', level: 3, kind: 'conceito',
    statement: 'Em um experimento, luz vermelha de alta intensidade incide sobre uma placa metálica e não consegue arrancar elétrons dela. Já a luz ultravioleta, mesmo de baixa intensidade, arranca elétrons da mesma placa.\nSegundo o modelo quântico da luz (efeito fotoelétrico), o resultado é explicado porque:',
    alternatives: [
      'a energia da luz é transferida em pacotes (fótons) de energia E = h·f; só os fótons ultravioleta, de maior frequência, têm energia suficiente para arrancar elétrons, e a intensidade apenas altera o número de fótons.',
      'a luz se comporta somente como onda contínua, e aumentar a intensidade da luz vermelha sempre acumularia energia suficiente para arrancar elétrons.',
      'a luz ultravioleta aquece mais a placa, e o calor libera os elétrons.',
      'a luz vermelha é absorvida pela placa e a ultravioleta é refletida, por isso só a ultravioleta libera elétrons.',
      'os elétrons só são arrancados por luz de baixa intensidade.'
    ],
    correct: 0,
    solution: 'Segundo Einstein (1905), a luz transfere energia aos elétrons em quantidades discretas: fótons com energia E = h·f. Um elétron só escapa se absorver, de um único fóton, energia maior que a função trabalho do metal.\nFótons de luz vermelha (menor frequência) têm energia insuficiente, e aumentar a intensidade só aumenta o número de fótons, e não a energia de cada um. Fótons ultravioleta (maior frequência) têm energia suficiente, mesmo que cheguem poucos.\nO modelo ondulatório clássico não explicava esse resultado; a explicação rendeu a Einstein o Nobel de Física de 1921.',
    distractors: [
      null,
      d(C, 'No modelo ondulatório clássico, a intensidade acumularia energia. Os experimentos mostram que isso não ocorre: o que importa é a frequência.'),
      d(C, 'A emissão fotoelétrica ocorre por absorção de fótons individuais, e não por aquecimento da placa.'),
      d(C, 'Não é uma questão de absorver ou refletir: ambas incidem na placa. O que muda é a energia de cada fóton.'),
      d(C, 'A intensidade não é a condição para arrancar elétrons: o fator decisivo é a frequência (energia do fóton).')
    ],
    hint: 'Pense em E = h·f. O que a intensidade da luz muda: a energia de cada fóton ou o número de fótons?'
  });

  /* ===================================================================
   * NÍVEL 4 — Mestre dos fenômenos (intermediário a avançado)
   * =================================================================== */

  add({
    id: 'Q31', theme: 'cinematica', level: 4, kind: 'lab', big: true,
    statement: 'O gráfico representa a posição de um carro, medida ao longo de uma estrada reta a partir do ponto de partida, durante uma viagem de 4,5 h.\nCom base no gráfico, assinale a alternativa correta.',
    figure: {
      type: 'graph', caption: 'Posição do carro em função do tempo',
      alt: 'Gráfico da posição em função do tempo. A posição cresce linearmente de 0 a 120 quilômetros entre 0 e 2 horas, fica constante em 120 quilômetros até 2,5 horas e diminui linearmente até 60 quilômetros em 4,5 horas.',
      xLabel: 't (h)', yLabel: 's (km)',
      points: [[0, 0], [2, 120], [2.5, 120], [4.5, 60]],
      xMax: 5, yMax: 140, xStep: 1, yStep: 20
    },
    alternatives: [
      'Entre 2,0 h e 2,5 h o carro esteve parado; a velocidade escalar média no percurso total foi de 40 km/h e o módulo da velocidade vetorial média foi de cerca de 13,3 km/h.',
      'Entre 2,0 h e 2,5 h o carro esteve parado; a velocidade escalar média no percurso total foi de 13,3 km/h, igual ao módulo da velocidade vetorial média.',
      'Entre 2,0 h e 2,5 h o carro se moveu com velocidade constante de 120 km/h; a velocidade escalar média foi de 40 km/h e a velocidade vetorial média, de cerca de 13,3 km/h.',
      'Entre 2,0 h e 2,5 h o carro esteve parado; a velocidade escalar média foi de 26,7 km/h e a velocidade vetorial média, de cerca de 13,3 km/h.',
      'No trecho horizontal do gráfico o carro atingiu sua velocidade máxima; a velocidade escalar média foi de 40 km/h e a velocidade vetorial média, de cerca de 13,3 km/h.'
    ],
    correct: 0,
    solution: 'Trecho horizontal (2,0 h a 2,5 h): a posição não varia, então o carro está parado.\nDistância total percorrida: ida de 0 a 120 km (120 km) + volta de 120 km a 60 km (60 km) = 180 km. Velocidade escalar média = 180/4,5 = 40 km/h.\nDeslocamento: posição final 60 km − posição inicial 0 = 60 km. Velocidade vetorial média = 60/4,5 ≈ 13,3 km/h.\nA velocidade escalar usa a distância total percorrida; a vetorial usa o deslocamento.',
    distractors: [
      null,
      d(C, 'A velocidade escalar média usa a distância total (180 km), e não o deslocamento (60 km); portanto vale 40 km/h.'),
      d(C, 'No gráfico s × t, o valor 120 km no eixo vertical é uma posição, e não uma velocidade. O trecho horizontal indica repouso.'),
      d(K, 'Os 120 km da ida foram considerados como distância total, mas o carro ainda percorreu mais 60 km na volta.'),
      d(C, 'No gráfico da posição, um trecho horizontal significa que a posição não muda: velocidade nula, e não máxima.')
    ],
    hint: 'Velocidade escalar média: distância total ÷ tempo. Vetorial média: deslocamento ÷ tempo.'
  });

  add({
    id: 'Q32', theme: 'newton', level: 4, kind: 'calculo', big: true,
    statement: 'Dois blocos, A (4,0 kg) e B (6,0 kg), estão ligados por um fio ideal e apoiados sobre uma superfície horizontal sem atrito. Uma força horizontal constante de 30 N é aplicada em A, puxando o conjunto, de modo que o bloco B é arrastado pelo fio.\nA tração no fio que liga A a B é de:',
    alternatives: [
      '3,0 N',
      '12 N',
      '15 N',
      '18 N',
      '30 N'
    ],
    correct: 3,
    solution: 'Para o conjunto: F = (m_{A} + m_{B})·a, então a = 30/(4,0 + 6,0) = 3,0 m/s².\nO único agente que puxa B é o fio, então T = m_{B}·a = 6,0 × 3,0 = 18 N.\nConferência em A: F − T = m_{A}·a → 30 − 18 = 12 N = 4,0 × 3,0. ✓',
    distractors: [
      d(C, '3,0 é o valor da aceleração em m/s². A tração é uma força, em newtons.'),
      d(C, '12 N é a força resultante sobre A (m_{A}·a), e não a tração.'),
      d(C, 'A tração não é metade da força: depende da massa que o fio precisa acelerar (bloco B).'),
      null,
      d(C, 'Se a tração fosse 30 N, nenhuma força restaria para acelerar o bloco A, e o bloco A ficaria sem aceleração.')
    ],
    hint: 'Ache a aceleração do conjunto. Depois, aplique a segunda lei apenas ao bloco B.'
  });

  add({
    id: 'Q33', theme: 'energia', level: 4, kind: 'calculo',
    statement: 'Em um brinquedo, uma mola de constante elástica 200 N/m é comprimida em 10 cm e solta, lançando um bloco de 0,50 kg sobre uma superfície horizontal sem atrito. Considerando que toda a energia elástica armazenada é convertida em energia cinética do bloco, a velocidade do bloco ao deixar a mola é de:',
    alternatives: [
      '2,0 m/s',
      '2,8 m/s',
      '4,0 m/s',
      '40 m/s',
      '200 m/s'
    ],
    correct: 0,
    solution: 'Energia elástica da mola: E_{el} = ½·k·x^{2}, com x = 10 cm = 0,10 m. E_{el} = ½ × 200 × (0,10)^{2} = 1,0 J.\nConservação de energia: ½·k·x^{2} = ½·m·v^{2}, então 1,0 = ½ × 0,50 × v^{2}, e v^{2} = 4,0.\nv = 2,0 m/s.',
    distractors: [
      null,
      d(K, 'Foi esquecido o fator ½ da energia elástica (k·x^{2} = ½·m·v^{2}); ele aparece nos dois lados da conservação.'),
      d(K, '4,0 é o valor de v^{2}. Falta extrair a raiz quadrada.'),
      d(C, '40 é F/m = (k·x)/m, que tem unidade de aceleração (m/s²), e não de velocidade.'),
      d(K, 'A compressão (10 cm) não foi convertida para metros antes de calcular a energia.')
    ],
    hint: 'Energia da mola: ½·k·x². Converta cm para m.'
  });

  add({
    id: 'Q34', theme: 'circuitos', level: 4, kind: 'calculo',
    statement: 'Um chuveiro elétrico tem potência de 4 400 W quando ligado a 220 V. Uma família o utiliza por 20 minutos por dia, durante 30 dias. Sabendo que a tarifa de energia elétrica é R$ 0,80 por kWh, o custo mensal da energia consumida apenas pelo chuveiro é de:',
    alternatives: [
      'R$ 1,17',
      'R$ 35,20',
      'R$ 70,40',
      'R$ 105,60',
      'R$ 2 112,00'
    ],
    correct: 1,
    solution: 'Potência: 4 400 W = 4,4 kW. Tempo de uso por mês: 20 min × 30 = 600 min = 10 h.\nEnergia = potência × tempo = 4,4 kW × 10 h = 44 kWh.\nCusto = 44 kWh × R$ 0,80 = R$ 35,20.\n(Extra: a corrente no chuveiro é i = P/U = 4 400/220 = 20 A, por isso ele exige fios grossos e disjuntor adequado.)',
    distractors: [
      d(K, 'R$ 1,17 corresponde ao custo de apenas um dia de uso; o enunciado pede o mês inteiro.'),
      null,
      d(K, 'O tempo de uso foi dobrado (40 min por dia, ou 60 dias): o enunciado fala em 20 minutos por dia durante 30 dias.'),
      d(K, 'Foi considerada 1 hora de uso por dia; o tempo informado é de 20 minutos.'),
      d(K, 'Os 20 minutos foram usados como se fossem 20 horas por dia. É preciso converter minutos em horas (÷ 60).')
    ],
    hint: 'Converta para kWh: potência em kW × tempo em horas.'
  });

  add({
    id: 'Q35', theme: 'ondas', level: 4, kind: 'lab',
    statement: 'Em uma aula de acústica, um estudante prende uma corda de violão em duas extremidades fixas, separadas por 0,60 m, e mede que as ondas se propagam nela com velocidade de 240 m/s. Ao fazer a corda vibrar em seu segundo harmônico, ela emite um som de frequência igual a:',
    alternatives: [
      '100 Hz',
      '200 Hz',
      '400 Hz',
      '600 Hz',
      '800 Hz'
    ],
    correct: 2,
    solution: 'Em uma corda com as duas extremidades fixas, o harmônico de ordem n tem comprimento de onda λ_{n} = 2L/n.\nPara n = 2: λ_{2} = 2 × 0,60/2 = 0,60 m.\nA frequência é f = v/λ = 240/0,60 = 400 Hz (ou f_{n} = n·v/2L).\nO primeiro harmônico (fundamental) seria 200 Hz, e o terceiro, 600 Hz.',
    distractors: [
      d(C, '100 Hz resulta da fórmula v/4L, usada para tubos fechados, que não se aplica a uma corda com as duas pontas fixas.'),
      d(C, '200 Hz é a frequência fundamental (n = 1), e não do segundo harmônico.'),
      null,
      d(C, '600 Hz é a frequência do terceiro harmônico (n = 3).'),
      d(K, 'Foi usada f = n·v/L, esquecendo que o denominador é 2L.')
    ],
    hint: 'Corda fixa nas duas pontas: f_{n} = n·v/(2L).'
  });

  add({
    id: 'Q36', theme: 'optica', level: 4, kind: 'lab',
    statement: 'Em uma bancada óptica, uma lente convergente de distância focal 20 cm é usada para projetar a imagem de uma vela colocada a 30 cm da lente.\nA imagem formada é:',
    alternatives: [
      'real, invertida e ampliada, a 60 cm da lente.',
      'virtual, direita e ampliada, a 60 cm da lente.',
      'real, invertida e reduzida, a 12 cm da lente.',
      'real, invertida e do mesmo tamanho, a 40 cm da lente.',
      'virtual, direita e reduzida, a 12 cm da lente.'
    ],
    correct: 0,
    solution: 'Equação de Gauss: 1/f = 1/p + 1/p′, com f = 20 cm e p = 30 cm.\n1/p′ = 1/20 − 1/30 = (3 − 2)/60 = 1/60, então p′ = 60 cm. Como p′ é positivo, a imagem é real (e pode ser projetada em um anteparo).\nAmpliação: A = −p′/p = −60/30 = −2. O sinal negativo indica imagem invertida e o módulo 2 indica imagem duas vezes maior.',
    distractors: [
      null,
      d(C, 'Imagem virtual e direita só ocorre se o objeto estiver entre a lente e o foco (p < f). Aqui p > f, e a imagem é real.'),
      d(K, 'Foi usado 1/p′ = 1/f + 1/p. O correto é 1/p′ = 1/f − 1/p, e isso muda o resultado.'),
      d(C, 'A imagem do mesmo tamanho ocorre quando o objeto está em 2f = 40 cm. Aqui o objeto está a 30 cm.'),
      d(C, 'Imagem virtual, direita e reduzida é típica de lentes divergentes, e não de uma lente convergente.')
    ],
    hint: '1/f = 1/p + 1/p′. Depois use A = −p′/p.'
  });

  add({
    id: 'Q37', theme: 'termologia', level: 4, kind: 'calculo', big: true,
    statement: 'Um estudante coloca 200 g de gelo a 0 °C em um calorímetro e fornece calor até que todo o gelo derreta e a água resultante atinja 10 °C. Dados: calor latente de fusão do gelo = 80 cal/g; calor específico da água = 1,0 cal/(g·°C).\nA quantidade total de calor fornecida é de:',
    alternatives: [
      '1 800 cal',
      '2 000 cal',
      '16 000 cal',
      '18 000 cal',
      '36 000 cal'
    ],
    correct: 3,
    solution: 'O processo tem duas etapas:\n1) Fusão do gelo a 0 °C (calor latente): Q_{1} = m·L = 200 × 80 = 16 000 cal. A temperatura não varia durante a fusão.\n2) Aquecimento da água de 0 °C a 10 °C (calor sensível): Q_{2} = m·c·ΔT = 200 × 1,0 × 10 = 2 000 cal.\nTotal: Q = 16 000 + 2 000 = 18 000 cal.',
    distractors: [
      d(K, 'O resultado correto é dez vezes maior: 16 000 + 2 000 = 18 000 cal.'),
      d(C, '2 000 cal é apenas o calor para aquecer a água; falta o calor de fusão do gelo.'),
      d(C, '16 000 cal é apenas o calor de fusão; falta o calor para aquecer a água de 0 °C a 10 °C.'),
      null,
      d(K, 'Cada etapa foi contada duas vezes. A soma das duas etapas já dá o total.')
    ],
    hint: 'Duas etapas: fundir o gelo (Q = m·L) e depois aquecer a água (Q = m·c·ΔT).'
  });

  add({
    id: 'Q38', theme: 'eletrostatica', level: 4, kind: 'calculo',
    statement: 'Duas pequenas esferas condutoras, com cargas elétricas de +2,0 μC e +3,0 μC, são mantidas no vácuo a 30 cm uma da outra. Dado: k = 9×10^{9} N·m²/C².\nA intensidade e a natureza da força elétrica entre elas são, respectivamente:',
    alternatives: [
      '0,054 N, de repulsão',
      '0,18 N, de repulsão',
      '0,60 N, de atração',
      '0,60 N, de repulsão',
      '60 N, de repulsão'
    ],
    correct: 3,
    solution: 'Lei de Coulomb: F = k·|q_{1}|·|q_{2}|/d^{2}.\nConvertendo: q_{1} = 2,0×10^{−6} C, q_{2} = 3,0×10^{−6} C, d = 0,30 m.\nF = 9×10^{9} × 2,0×10^{−6} × 3,0×10^{−6} / (0,30)^{2} = 0,054/0,090 = 0,60 N.\nAs cargas têm o mesmo sinal (positivas), então a força é de repulsão.',
    distractors: [
      d(K, '0,054 N é o numerador k·q_{1}·q_{2}; falta dividir por d^{2}.'),
      d(K, 'A distância não foi elevada ao quadrado: a força é inversamente proporcional a d^{2}.'),
      d(C, 'Cargas de mesmo sinal se repelem; só cargas de sinais opostos se atraem.'),
      null,
      d(K, 'A distância foi convertida de forma errada (0,03 m em vez de 0,30 m): 30 cm = 0,30 m.')
    ],
    hint: 'F = k·q_{1}·q_{2}/d^{2}, com tudo em unidades do SI (μC = 10^{−6} C; cm → m).'
  });

  add({
    id: 'Q39', theme: 'gravitacao', level: 4, kind: 'calculo',
    statement: 'A Estação Espacial Internacional orbita a cerca de 400 km acima da superfície da Terra. Considere o raio da Terra igual a 6 400 km e a aceleração da gravidade na superfície igual a 9,8 m/s². Sabendo que a aceleração da gravidade varia com o inverso do quadrado da distância ao centro da Terra, seu valor aproximado na altitude da estação é de:',
    alternatives: [
      '0 m/s²',
      '8,7 m/s²',
      '9,2 m/s²',
      '9,8 m/s²',
      '11 m/s²'
    ],
    correct: 1,
    solution: 'A distância ao centro da Terra é r = 6 400 + 400 = 6 800 km.\ng′ = g·(R/r)^{2} = 9,8 × (6 400/6 800)^{2} ≈ 9,8 × 0,886 ≈ 8,7 m/s².\nA gravidade na altitude da ISS é cerca de 90% da de superfície: os astronautas flutuam porque estão em queda livre, e não porque a gravidade desapareceu.',
    distractors: [
      d(C, 'A gravidade não se anula a 400 km de altitude; ela diminui apenas cerca de 10%.'),
      null,
      d(K, 'A razão R/r não foi elevada ao quadrado: g varia com 1/r^{2}.'),
      d(C, 'A gravidade diminui com a distância ao centro da Terra, então não é igual à da superfície.'),
      d(K, 'A razão foi invertida (r/R)^{2}, o que faria g aumentar com a altitude — o contrário do correto.')
    ],
    hint: 'g′/g = (R/r)², com r = R + h.'
  });

  add({
    id: 'Q40', theme: 'moderna', level: 4, kind: 'calculo',
    statement: 'Na medicina nuclear, certo radioisótopo usado em exames tem meia-vida de 6,0 h. Uma amostra de 80 mg desse material é preparada às 8 h.\nA massa do radioisótopo que ainda não decaiu às 8 h do dia seguinte (24 h depois) é de:',
    alternatives: [
      '0 mg',
      '5,0 mg',
      '10 mg',
      '20 mg',
      '40 mg'
    ],
    correct: 1,
    solution: 'A meia-vida é o tempo para que metade dos núcleos radioativos decaia.\nEm 24 h passam-se 24/6,0 = 4 meias-vidas.\n80 mg → 40 mg (6 h) → 20 mg (12 h) → 10 mg (18 h) → 5,0 mg (24 h).\nOu, em fórmula: m = m_{0}/2^{n} = 80/2^{4} = 80/16 = 5,0 mg.',
    distractors: [
      d(C, 'O decaimento é exponencial: a cada meia-vida resta metade, e nunca se chega a zero em tempo finito (embora a massa fique muito pequena).'),
      null,
      d(K, '10 mg corresponde a 3 meias-vidas (18 h). Em 24 h passam-se 4 meias-vidas.'),
      d(K, '20 mg corresponde a 2 meias-vidas (12 h), e não a 24 h.'),
      d(K, '40 mg corresponde a apenas 1 meia-vida (6 h).')
    ],
    hint: 'Quantas meias-vidas cabem em 24 h?'
  });

  /* ===================================================================
   * NÍVEL 5 — Desafio de Einstein (avançado: várias etapas e integração)
   * =================================================================== */

  add({
    id: 'Q41', theme: 'newton', level: 5, kind: 'calculo', final: true,
    statement: 'Um carro de 1 000 kg trafega a 72 km/h em uma avenida reta e horizontal quando o motorista pisa no freio. Durante a frenagem, a única força que atua na direção do movimento é a de atrito, constante e de intensidade 5 000 N, até o carro parar.\nA distância de frenagem e o trabalho realizado pela força de atrito nesse trecho são, respectivamente:',
    alternatives: [
      '4,0 m; −2,0×10^{4} J',
      '40 m; +2,0×10^{5} J',
      '40 m; −2,0×10^{5} J',
      '80 m; −4,0×10^{5} J',
      '518 m; −2,6×10^{6} J'
    ],
    correct: 2,
    solution: 'Etapa 1 — unidades: 72 km/h ÷ 3,6 = 20 m/s.\nEtapa 2 — aceleração: pela segunda lei, a = F/m = 5 000/1 000 = 5,0 m/s² (desaceleração).\nEtapa 3 — distância: pela equação de Torricelli, 0 = v^{2} − 2·a·d, então d = v^{2}/(2a) = 400/10 = 40 m.\nEtapa 4 — trabalho: a força de atrito é oposta ao deslocamento, então τ = −F·d = −5 000 × 40 = −2,0×10^{5} J.\nConferência pelo teorema trabalho-energia: ΔE_{c} = 0 − ½ × 1 000 × 20^{2} = −2,0×10^{5} J. ✓',
    distractors: [
      d(C, '4,0 s é o tempo de frenagem (v/a), e não a distância. O resultado confunde grandezas diferentes.'),
      d(C, 'O sinal está errado: a força de atrito aponta contra o deslocamento, então o trabalho é negativo (resistente).'),
      null,
      d(K, 'A distância saiu o dobro porque foi usada d = v^{2}/a, esquecendo o fator 2 de v^{2}/(2a).'),
      d(K, 'A velocidade de 72 km/h não foi convertida para m/s, e o valor 72 foi usado como se fosse m/s.')
    ],
    hint: 'Converta a velocidade para m/s, ache a desaceleração e use Torricelli.'
  });

  add({
    id: 'Q42', theme: 'circuitos', level: 5, kind: 'lab', final: true,
    statement: 'Em um experimento, um estudante montou o circuito da figura: uma fonte ideal de 12 V alimenta um resistor de 4 Ω ligado em série com dois resistores em paralelo, de 6 Ω e de 3 Ω.\nA corrente elétrica que atravessa o resistor de 6 Ω é de aproximadamente:',
    figure: {
      type: 'svg', caption: 'Circuito misto com fonte de 12 V',
      alt: 'Circuito: fonte de 12 volts ligada a um resistor de 4 ohms em série com dois ramos em paralelo, um com resistor de 6 ohms e outro com resistor de 3 ohms.',
      viewBox: '0 0 360 190',
      body: '<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M40 85 V30 H70 M120 30 H280 V55 M200 30 V55 M200 105 V160 M280 105 V160 H40 V95"/>' +
        '<rect x="70" y="20" width="50" height="20" rx="3"/><rect x="190" y="55" width="20" height="50" rx="3"/><rect x="270" y="55" width="20" height="50" rx="3"/>' +
        '<path d="M24 85 H56"/><path d="M32 95 H48" stroke-width="5"/></g>' +
        '<g fill="currentColor"><circle cx="200" cy="30" r="3.5"/><circle cx="200" cy="160" r="3.5"/></g>' +
        '<g fill="currentColor" font-size="14" font-family="system-ui, sans-serif" font-weight="600">' +
        '<text x="95" y="14" text-anchor="middle">4 Ω</text><text x="184" y="84" text-anchor="end">6 Ω</text><text x="304" y="84">3 Ω</text>' +
        '<text x="62" y="94">12 V</text><text x="10" y="89">+</text><text x="12" y="103">−</text></g>'
    },
    alternatives: [
      '0,33 A',
      '0,67 A',
      '1,0 A',
      '1,3 A',
      '2,0 A'
    ],
    correct: 1,
    solution: 'Etapa 1 — resistência do paralelo: R_{p} = (6 × 3)/(6 + 3) = 2 Ω.\nEtapa 2 — resistência equivalente do circuito: R_{eq} = 4 + 2 = 6 Ω.\nEtapa 3 — corrente total (que passa pelo resistor de 4 Ω): i = U/R_{eq} = 12/6 = 2,0 A.\nEtapa 4 — tensão no paralelo: U_{p} = R_{p}·i = 2 × 2,0 = 4,0 V (a mesma nos dois ramos).\nEtapa 5 — corrente no resistor de 6 Ω: i_{6} = 4,0/6 ≈ 0,67 A. No de 3 Ω: 4,0/3 ≈ 1,3 A; a soma, 2,0 A, confere com a corrente total.',
    distractors: [
      d(K, 'Foi dividida a corrente total (2,0 A) pela resistência (6 Ω), misturando grandezas. A corrente no ramo é a tensão do paralelo dividida pela resistência do ramo.'),
      null,
      d(C, 'A corrente total só se divide igualmente entre ramos de resistências iguais. Como os ramos têm 6 Ω e 3 Ω, a divisão é desigual.'),
      d(C, '1,3 A é a corrente no resistor de 3 Ω, e não no de 6 Ω. O ramo de menor resistência recebe a maior corrente.'),
      d(C, '2,0 A é a corrente total do circuito, que se divide entre os dois ramos em paralelo.')
    ],
    hint: 'Ache a corrente total, depois a tensão no trecho em paralelo.'
  });

  add({
    id: 'Q43', theme: 'termologia', level: 5, kind: 'lab', big: true,
    statement: 'Um aquecedor elétrico de 4 200 W é usado para aquecer 100 L de água (massa de 100 kg) de 20 °C a 40 °C. Apenas 80% da energia elétrica é aproveitada no aquecimento da água; o restante é perdido para o ambiente. Dado: calor específico da água = 4 200 J/(kg·°C).\nO tempo necessário para o aquecimento é de aproximadamente:',
    alternatives: [
      '27 min',
      '33 min',
      '42 min',
      '83 min',
      '2 500 min'
    ],
    correct: 2,
    solution: 'Etapa 1 — calor necessário: Q = m·c·ΔT = 100 × 4 200 × (40 − 20) = 8,4×10^{6} J.\nEtapa 2 — potência útil: apenas 80% de 4 200 W chega à água: P_{útil} = 0,80 × 4 200 = 3 360 W.\nEtapa 3 — tempo: Δt = Q/P_{útil} = 8,4×10^{6}/3 360 = 2 500 s.\nEtapa 4 — unidades: 2 500 s ÷ 60 ≈ 41,7 min ≈ 42 min.',
    distractors: [
      d(K, 'O rendimento foi aplicado no sentido contrário (multiplicando o tempo por 0,80). Com perdas, o tempo deve aumentar, e não diminuir.'),
      d(C, '33 min é o tempo sem perdas (2 000 s). Com rendimento de 80%, o aquecimento demora mais.'),
      null,
      d(K, 'Foi usado ΔT = 40 °C (temperatura final) em vez da variação de 20 °C.'),
      d(K, 'O resultado em segundos (2 500 s) foi lido como se fosse em minutos. É preciso dividir por 60.')
    ],
    hint: 'Calcule o calor necessário, a potência realmente aproveitada e depois o tempo.'
  });

  add({
    id: 'Q44', theme: 'ondas', level: 5, kind: 'calculo',
    statement: 'Uma ambulância se aproxima de um pedestre parado, em linha reta, a 72 km/h, com a sirene emitindo um som de frequência 1 000 Hz. A velocidade do som no ar é de 340 m/s.\nA frequência do som percebida pelo pedestre durante a aproximação é de aproximadamente:',
    alternatives: [
      '940 Hz',
      '1 000 Hz',
      '1 060 Hz',
      '1 070 Hz',
      '1 270 Hz'
    ],
    correct: 2,
    solution: 'Efeito Doppler: quando a fonte se aproxima do observador parado, f′ = f·v_{som}/(v_{som} − v_{fonte}).\nEtapa 1 — unidades: v_{fonte} = 72 km/h ÷ 3,6 = 20 m/s.\nEtapa 2 — cálculo: f′ = 1 000 × 340/(340 − 20) = 1 000 × 340/320 ≈ 1 062 Hz, ou seja, cerca de 1 060 Hz.\nO som percebido é mais agudo que o emitido na aproximação. Quando a ambulância se afasta, fica mais grave.',
    distractors: [
      d(C, 'Esse valor corresponde ao afastamento (denominador 340 + 20). Na aproximação, a frequência percebida é maior que a emitida.'),
      d(C, 'Sem Doppler, a frequência seria igual à emitida. Mas o movimento relativo entre a fonte e o observador altera a frequência percebida.'),
      null,
      d(C, 'Somar 72 (km/h) à frequência (Hz) mistura grandezas e unidades diferentes. A velocidade deve entrar na fórmula do efeito Doppler.'),
      d(K, 'A velocidade de 72 km/h foi usada diretamente como 72 m/s, sem converter. Convertida, vale 20 m/s.')
    ],
    hint: 'Converta 72 km/h para m/s e use f′ = f·v/(v − v_{fonte}).'
  });

  add({
    id: 'Q45', theme: 'magnetismo', level: 5, kind: 'calculo',
    statement: 'O carregador de um aparelho eletrônico contém um transformador ideal. O enrolamento primário, com 1 000 espiras, é ligado a uma tomada de 220 V (corrente alternada), e o secundário, com 50 espiras, alimenta o aparelho, que opera com corrente de 3,0 A.\nA tensão no secundário e a corrente no enrolamento primário são, respectivamente:',
    alternatives: [
      '11 V e 0,15 A',
      '11 V e 3,0 A',
      '11 V e 60 A',
      '220 V e 3,0 A',
      '4 400 V e 60 A'
    ],
    correct: 0,
    solution: 'Etapa 1 — tensões: em um transformador, V_{2}/V_{1} = N_{2}/N_{1}. V_{2} = 220 × 50/1 000 = 11 V.\nEtapa 2 — potência no secundário: P_{2} = V_{2}·i_{2} = 11 × 3,0 = 33 W.\nEtapa 3 — transformador ideal não dissipa energia: P_{1} = P_{2} = 33 W, então i_{1} = P_{1}/V_{1} = 33/220 = 0,15 A.\nO transformador reduz a tensão e aumenta a corrente (e vice-versa): a potência se conserva. Ele só funciona com corrente alternada, porque depende da variação do fluxo magnético.',
    distractors: [
      null,
      d(C, 'Se a corrente fosse igual nos dois enrolamentos, a potência no secundário (33 W) seria diferente da do primário (660 W). A potência é que se conserva.'),
      d(K, 'A relação entre as correntes foi invertida: como a tensão cai 20 vezes, a corrente no primário é 20 vezes menor, e não maior.'),
      d(C, 'Um transformador existe justamente para alterar a tensão; com 1 000 e 50 espiras, a tensão é reduzida.'),
      d(K, 'A razão de espiras foi invertida (V_{2} = V_{1}·N_{1}/N_{2}), o que elevaria a tensão em vez de reduzi-la.')
    ],
    hint: 'V_{2}/V_{1} = N_{2}/N_{1}, e a potência se conserva: V_{1}·i_{1} = V_{2}·i_{2}.'
  });

  add({
    id: 'Q46', theme: 'moderna', level: 5, kind: 'lab',
    statement: 'Em um experimento de efeito fotoelétrico, um laser ultravioleta ilumina uma placa metálica. Os dados do experimento estão na tabela.\nA energia cinética máxima dos elétrons emitidos é de:',
    figure: {
      type: 'table', caption: 'Dados do experimento',
      headers: ['Grandeza', 'Valor'],
      rows: [['Comprimento de onda da luz (λ)', '310 nm'], ['Função trabalho do metal (φ)', '2,3 eV'], ['Constante (h·c)', '1 240 eV·nm']]
    },
    alternatives: [
      '1,7 eV',
      '2,3 eV',
      '4,0 eV',
      '6,3 eV',
      'nenhum elétron é emitido.'
    ],
    correct: 0,
    solution: 'Etapa 1 — energia do fóton: E = h·f = h·c/λ = 1 240/310 = 4,0 eV.\nEtapa 2 — comparação: 4,0 eV é maior que a função trabalho (2,3 eV), então há emissão de elétrons.\nEtapa 3 — equação de Einstein: E_{c,máx} = E − φ = 4,0 − 2,3 = 1,7 eV.\nParte da energia do fóton (2,3 eV) é gasta para “arrancar” o elétron do metal; o que sobra vira energia cinética.',
    distractors: [
      null,
      d(C, '2,3 eV é a energia gasta para arrancar o elétron (função trabalho), e não a energia cinética que ele ainda tem.'),
      d(C, '4,0 eV é a energia do fóton. Do total, 2,3 eV são gastos para libertar o elétron.'),
      d(K, 'As energias foram somadas. A energia cinética é a diferença entre a energia do fóton e a função trabalho.'),
      d(C, 'Há emissão, pois a energia do fóton (4,0 eV) supera a função trabalho (2,3 eV).')
    ],
    hint: 'E_{fóton} = h·c/λ e E_{c,máx} = E_{fóton} − φ.'
  });

  add({
    id: 'Q47', theme: 'gravitacao', level: 5, kind: 'calculo', final: true,
    statement: 'Dois planetas, P_{1} e P_{2}, descrevem órbitas circulares em torno da mesma estrela. O raio da órbita de P_{2} é 4 vezes o raio da órbita de P_{1}, e o período de P_{1} é de 2 anos.\nDe acordo com a terceira lei de Kepler (T^{2} proporcional a R^{3}), o período de P_{2} e a razão entre as velocidades orbitais v_{2}/v_{1} são, respectivamente:',
    alternatives: [
      '4 anos; v_{2}/v_{1} = 2,0',
      '8 anos; v_{2}/v_{1} = 1,0',
      '16 anos; v_{2}/v_{1} = 0,50',
      '16 anos; v_{2}/v_{1} = 2,0',
      '32 anos; v_{2}/v_{1} = 0,25'
    ],
    correct: 2,
    solution: 'Etapa 1 — período: (T_{2}/T_{1})^{2} = (R_{2}/R_{1})^{3} = 4^{3} = 64, logo T_{2}/T_{1} = 8 e T_{2} = 8 × 2 = 16 anos.\nEtapa 2 — velocidades: em órbita circular, v = 2πR/T. Então v_{2}/v_{1} = (R_{2}/R_{1}) × (T_{1}/T_{2}) = 4 × (1/8) = 0,50.\nInterpretação: planetas mais distantes demoram mais para dar uma volta e se movem mais devagar.',
    distractors: [
      d(K, 'Foi usado T proporcional a √R. A lei de Kepler relaciona T^{2} com R^{3}, e não T com √R.'),
      d(K, 'Foi usada uma proporção direta entre T e R. Com T^{2} ∝ R^{3}, o período cresce mais depressa que o raio.'),
      null,
      d(C, 'O período está certo, mas a razão das velocidades não: planetas mais afastados orbitam mais devagar, e não mais depressa.'),
      d(K, 'Foi usado T^{2} proporcional a R^{2}. Na terceira lei, o expoente do raio é 3.')
    ],
    hint: 'T^{2} ∝ R^{3} dá o período. Depois use v = 2πR/T.'
  });

  add({
    id: 'Q48', theme: 'aplicacoes', level: 5, kind: 'calculo', big: true,
    statement: 'Em uma usina hidrelétrica, a água cai de uma altura de 20 m com vazão de 50 m³/s. A densidade da água é de 1 000 kg/m³, e a usina converte 80% da energia da queda em energia elétrica. Adote g = 10 m/s².\nA potência elétrica gerada é de aproximadamente:',
    alternatives: [
      '0,80 MW',
      '8,0 MW',
      '10 MW',
      '12,5 MW',
      '80 MW'
    ],
    correct: 1,
    solution: 'Etapa 1 — massa de água por segundo: 1 000 kg/m³ × 50 m³/s = 5,0×10^{4} kg/s.\nEtapa 2 — potência da queda: P = (m/Δt)·g·h = 5,0×10^{4} × 10 × 20 = 1,0×10^{7} W = 10 MW.\nEtapa 3 — rendimento: P_{elétrica} = 0,80 × 10 MW = 8,0 MW.\nÉ a energia potencial gravitacional da água, convertida em cinética e depois em elétrica pela turbina e pelo gerador.',
    distractors: [
      d(K, 'Há um erro de potência de dez (um fator 10 a menos). Confira: 5,0×10^{4} × 10 × 20 = 1,0×10^{7} W.'),
      null,
      d(C, '10 MW é a potência da queda, antes das perdas. Só 80% dela vira energia elétrica.'),
      d(K, 'Foi dividido por 0,80 em vez de multiplicar. Com perdas, a potência elétrica é menor que a da queda.'),
      d(K, 'Há um erro de potência de dez (um fator 10 a mais) no cálculo.')
    ],
    hint: 'Potência da queda = (massa por segundo) × g × h, e depois aplique o rendimento.'
  });

  add({
    id: 'Q49', theme: 'cinematica', level: 5, kind: 'calculo', big: true,
    statement: 'Um avião de ajuda humanitária voa horizontalmente, a 80 m de altura em relação ao solo plano e com velocidade constante de 50 m/s, quando solta um pacote. Despreze a resistência do ar e adote g = 10 m/s².\nA distância horizontal percorrida pelo pacote, desde o ponto em que é solto até atingir o solo, é de:',
    alternatives: [
      '80 m',
      '200 m',
      '400 m',
      '800 m',
      '4 000 m'
    ],
    correct: 1,
    solution: 'O movimento do pacote é a composição de dois movimentos independentes:\n• Na vertical (queda livre, partindo com velocidade vertical nula): h = ½·g·t^{2}, então t = √(2h/g) = √(2 × 80/10) = 4,0 s.\n• Na horizontal (MU, mantém os 50 m/s do avião): x = v·t = 50 × 4,0 = 200 m.\nO tempo de queda só depende da altura, e não da velocidade horizontal.',
    distractors: [
      d(C, '80 m é a altura da queda, e não a distância horizontal percorrida.'),
      null,
      d(K, 'O tempo de queda foi calculado como h/g = 8 s, esquecendo o fator 2 e a raiz quadrada: t = √(2h/g).'),
      d(K, 'Foi esquecida a raiz quadrada: 2h/g = 16 é t^{2}, e não t (o tempo é 4,0 s).'),
      d(C, 'Multiplicar velocidade por altura mistura grandezas diferentes. O alcance é a velocidade horizontal vezes o tempo de queda.')
    ],
    hint: 'O tempo de queda depende só da altura. Depois, aplique o MU na horizontal.'
  });

  add({
    id: 'Q50', theme: 'eletrostatica', level: 5, kind: 'calculo',
    statement: 'Durante uma tempestade, um raio transfere 20 C de carga elétrica entre uma nuvem e o solo, sob uma diferença de potencial de 1,0×10^{8} V. Imagine que toda a energia dessa descarga pudesse ser armazenada e usada em uma casa que consome, em média, 500 W.\nA energia liberada pela descarga e o tempo durante o qual ela abasteceria a casa são, respectivamente, de aproximadamente:',
    alternatives: [
      '5,0×10^{6} J; 3 horas',
      '1,0×10^{8} J; 2,3 dias',
      '2,0×10^{9} J; 46 dias',
      '2,0×10^{9} J; 1,1×10^{3} dias',
      '2,0×10^{9} J; 4,0×10^{6} dias'
    ],
    correct: 2,
    solution: 'Etapa 1 — energia: a energia associada ao deslocamento de uma carga q sob uma diferença de potencial U é E = q·U = 20 × 1,0×10^{8} = 2,0×10^{9} J.\nEtapa 2 — tempo: Δt = E/P = 2,0×10^{9}/500 = 4,0×10^{6} s.\nEtapa 3 — unidades: 4,0×10^{6} s ÷ 3 600 ≈ 1,1×10^{3} h; ÷ 24 ≈ 46 dias (ou 4,0×10^{6} ÷ 86 400 ≈ 46 dias).\nÉ uma enorme quantidade de energia, mas liberada em frações de segundo, o que torna inviável aproveitá-la.',
    distractors: [
      d(K, 'Foi feita a divisão U/q em vez do produto q·U. A energia é E = q·U.'),
      d(C, 'A carga transferida (20 C) foi ignorada. A energia depende do produto da carga pela diferença de potencial.'),
      null,
      d(K, 'Faltou a última conversão: 1,1×10^{3} é o número de horas. Para obter dias, é preciso dividir por 24.'),
      d(K, 'Os segundos (4,0×10^{6} s) não foram convertidos. É preciso dividir por 86 400 para obter dias.')
    ],
    hint: 'E = q·U e, depois, Δt = E/P (converta segundos em dias no final).'
  });

  /* ===================================================================
   * Pós-processamento e utilitários
   * =================================================================== */

  // espaço sem quebra entre grupos de milhares (ex.: 84 000) e antes de unidades
  function nbsp(s) {
    return String(s).replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ');
  }

  function plain(s) {
    return String(s).replace(/\^\{([^}]*)\}/g, '^$1').replace(/_\{([^}]*)\}/g, '$1');
  }

  var QUESTIONS = RAW.map(function (q) {
    var out = {
      id: q.id, theme: q.theme, level: q.level, kind: q.kind,
      big: !!(q.big || q.final), final: !!q.final,
      statement: nbsp(q.statement),
      alternatives: q.alternatives.map(nbsp),
      correct: q.correct,
      solution: nbsp(q.solution),
      distractors: q.distractors.map(function (x) { return x ? { kind: x.kind, text: nbsp(x.text) } : null; }),
      hint: q.hint ? nbsp(q.hint) : ''
    };
    if (q.figure) out.figure = q.figure;
    if (q.fixedOrder) out.fixedOrder = true;
    return out;
  });

  var BY_ID = {};
  QUESTIONS.forEach(function (q) { BY_ID[q.id] = q; });

  var VALID_KINDS = ['conceito', 'calculo', 'lab'];

  /** Valida a estrutura de uma questão; devolve lista de problemas (vazia = ok). */
  function validateQuestion(q) {
    var errs = [];
    function bad(m) { errs.push(q.id + ': ' + m); }
    if (!q.id) bad('sem id');
    if (!THEMES[q.theme]) bad('tema inválido: ' + q.theme);
    if (!(q.level >= 1 && q.level <= 5)) bad('nível inválido');
    if (VALID_KINDS.indexOf(q.kind) < 0) bad('kind inválido');
    if (!q.statement || q.statement.length < 40) bad('enunciado ausente ou curto');
    if (!Array.isArray(q.alternatives) || q.alternatives.length !== 5) bad('precisa ter 5 alternativas');
    else {
      var seen = {};
      q.alternatives.forEach(function (a, i) {
        if (!a || !String(a).trim()) bad('alternativa ' + i + ' vazia');
        var key = plain(a).trim().toLowerCase();
        if (seen[key]) bad('alternativas repetidas: ' + a);
        seen[key] = true;
      });
    }
    if (!(Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 4)) bad('índice da correta inválido');
    if (!q.solution || q.solution.length < 60) bad('resolução ausente ou curta');
    if (!Array.isArray(q.distractors) || q.distractors.length !== 5) bad('distractors precisa ter 5 posições');
    else q.distractors.forEach(function (x, i) {
      if (i === q.correct) { if (x !== null) bad('a alternativa correta não deve ter explicação de erro'); }
      else if (!x || !x.text || (x.kind !== 'conceitual' && x.kind !== 'calculo')) bad('explicação de erro ausente na alternativa ' + i);
    });
    if (q.figure) {
      var t = q.figure.type;
      if (['table', 'graph', 'svg'].indexOf(t) < 0) bad('tipo de figura inválido');
      if (!q.figure.alt && t !== 'table') bad('figura sem texto alternativo');
    }
    return errs;
  }

  function themeLabel(id) { return THEMES[id] ? THEMES[id].label : id; }

  return {
    THEMES: THEMES,
    THEME_IDS: Object.keys(THEMES),
    QUESTIONS: QUESTIONS,
    BY_ID: BY_ID,
    validateQuestion: validateQuestion,
    themeLabel: themeLabel,
    plain: plain
  };
});
