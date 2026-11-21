/* Biblioteca de Fórmulas · F. ELETROMAGNETISMO
   Campos: veja o comentário no topo de formulas/app.js. Texto com matemática entre $...$. */
(function () {
const T = String.raw;
const F = window.FORMULAS = window.FORMULAS || { areas: [], formulas: [] };

F.areas.push({
  id: 'eletromagnetismo', nome: 'Eletromagnetismo', sym: 'B',
  intro: T`Correntes criam campos magnéticos, campos magnéticos empurram cargas em movimento e campos variáveis geram correntes. É a física de motores, geradores, transformadores e usinas.`,
  subs: [
    { id: 'campo', nome: 'Campo magnético de correntes', topicos: ['Fio retilíneo', 'Espira e bobina', 'Solenoide', 'Lei de Ampère'] },
    { id: 'forca', nome: 'Força magnética', topicos: ['Força sobre cargas', 'Movimento de partículas em campos magnéticos', 'Força sobre condutores'] },
    { id: 'inducao', nome: 'Indução eletromagnética', topicos: ['Fluxo magnético', 'Lei de Faraday', 'Lei de Lenz', 'Fem de movimento', 'Geradores de corrente alternada', 'Transformadores'] },
  ],
});

const L = [
/* ===================== CAMPO MAGNÉTICO ===================== */
{ id: 'campo-fio', sub: 'campo', topico: 'Fio retilíneo', top: true,
  nome: 'Campo magnético de um fio retilíneo longo', tex: T`B = \dfrac{\mu_0\,i}{2\pi\,d}`,
  alt: [[T`Permeabilidade do vácuo`, T`\mu_0 = 4\pi \cdot 10^{-7}\ \text{T·m/A}`]],
  vars: [[T`B`, 'intensidade do campo magnético', 'T (tesla)'], [T`i`, 'corrente no fio', 'A'], [T`d`, 'distância ao fio', 'm']],
  uso: T`Campo em volta de fios: linhas de transmissão, experiência de Oersted.`,
  val: T`Fio muito longo e retilíneo. As linhas de campo são circunferências em volta do fio; o sentido sai pela regra da mão direita (polegar na corrente, dedos dão o sentido de $\vec B$).`,
  ex: [T`Campo a 10 cm de um fio com 20 A.`, T`$B = \dfrac{4\pi \cdot 10^{-7} \cdot 20}{2\pi \cdot 0{,}1} = 4 \cdot 10^{-5}\ \text{T}$ (comparável ao da Terra)`],
  tags: 'campo magnetico fio retilineo oersted mao direita' },

{ id: 'campo-espira', sub: 'campo', topico: 'Espira e bobina',
  nome: 'Campo no centro de uma espira circular', tex: T`B = \dfrac{\mu_0\,i}{2R}`,
  alt: [[T`Bobina chata com N espiras`, T`B = N\,\dfrac{\mu_0\,i}{2R}`]],
  vars: [[T`B`, 'campo no centro', 'T'], [T`i`, 'corrente', 'A'], [T`R`, 'raio da espira', 'm'], [T`N`, 'número de espiras', 'adimensional']],
  uso: T`Espiras e bobinas planas: eletroímãs simples, bobinas de Helmholtz.`,
  val: T`Só no **centro** da espira. O campo é perpendicular ao plano da espira; o sentido sai pela regra da mão direita.`,
  ex: [T`Espira de raio 2π cm com 5 A.`, T`$B = \dfrac{4\pi \cdot 10^{-7} \cdot 5}{2 \cdot 0{,}02\pi} = 5 \cdot 10^{-5}\ \text{T}$`],
  tags: 'campo magnetico espira bobina chata centro' },

{ id: 'campo-solenoide', sub: 'campo', topico: 'Solenoide',
  nome: 'Campo no interior de um solenoide', tex: T`B = \mu_0\,\dfrac{N}{L}\,i = \mu_0\,n\,i`,
  vars: [[T`N`, 'número de espiras', 'adimensional'], [T`L`, 'comprimento do solenoide', 'm'], [T`n`, 'espiras por metro', 'm⁻¹'], [T`i`, 'corrente', 'A']],
  uso: T`Eletroímãs, campainhas, ressonância magnética.`,
  val: T`Solenoide longo (comprimento muito maior que o diâmetro): campo praticamente uniforme dentro e quase nulo fora. Com núcleo de ferro, o campo aumenta muito.`,
  ex: [T`Um solenoide de 1 000 espiras em 0,5 m, com 2 A.`, T`$B = 4\pi \cdot 10^{-7} \cdot 2000 \cdot 2 \approx 5 \cdot 10^{-3}\ \text{T}$`],
  tags: 'solenoide bobina eletroima campo uniforme' },

{ id: 'ampere', sub: 'campo', topico: 'Lei de Ampère',
  nome: 'Lei de Ampère (forma simplificada)', tex: T`B \cdot 2\pi r = \mu_0\,i_{interna}`,
  alt: [[T`Forma geral`, T`\oint \vec B \cdot d\vec\ell = \mu_0\,i_{interna}`]],
  vars: [[T`B`, 'campo ao longo de uma circunferência de raio r', 'T'], [T`i_{interna}`, 'corrente total que atravessa a área limitada pelo caminho', 'A']],
  uso: T`Para deduzir o campo de fios, de cabos coaxiais e de fios grossos (dentro e fora). Nível ITA/IME.`,
  val: T`Correntes estacionárias e situações com simetria (o campo tem o mesmo valor ao longo do caminho escolhido).`,
  ex: [T`Dentro de um fio grosso de raio $a$, com corrente $i$ uniforme, a $r < a$ do eixo.`, T`$i_{int} = i\,\dfrac{r^2}{a^2} \Rightarrow B = \dfrac{\mu_0\,i\,r}{2\pi a^2}$ (cresce linearmente até a superfície)`],
  tags: 'lei de ampere circulacao corrente interna' },

/* ===================== FORÇA MAGNÉTICA ===================== */
{ id: 'forca-carga', sub: 'forca', topico: 'Força sobre cargas', top: true,
  nome: 'Força magnética sobre carga em movimento (Lorentz)', tex: T`F = |q|\,v\,B\sen\theta`,
  vars: [[T`F`, 'força magnética', 'N'], [T`q`, 'carga', 'C'], [T`v`, 'velocidade da carga', 'm/s'], [T`B`, 'campo magnético', 'T'], [T`\theta`, T`ângulo entre $\vec v$ e $\vec B$`, '°']],
  uso: T`Partículas em campos magnéticos: auroras, aceleradores, cinturões de Van Allen.`,
  val: T`A força é perpendicular a $\vec v$ e a $\vec B$ (regra da mão esquerda ou do tapa), por isso **não realiza trabalho** e não muda a rapidez. Carga parada ou movendo-se paralela ao campo: $F = 0$. Para carga negativa, o sentido se inverte.`,
  ex: [T`Um próton a $10^6$ m/s, perpendicular a um campo de 0,5 T.`, T`$F = 1{,}6 \cdot 10^{-19} \cdot 10^6 \cdot 0{,}5 = 8 \cdot 10^{-14}\ \text{N}$`],
  tags: 'forca magnetica lorentz carga velocidade regra da mao' },

{ id: 'raio-ciclotron', sub: 'forca', topico: 'Movimento de partículas em campos magnéticos', top: true,
  nome: 'Raio e período do movimento circular no campo', tex: T`R = \dfrac{m\,v}{|q|\,B}`,
  alt: [[T`Período (não depende da velocidade)`, T`T = \dfrac{2\pi\,m}{|q|\,B}`]],
  vars: [[T`R`, 'raio da trajetória circular', 'm'], [T`m`, 'massa da partícula', 'kg'], [T`v`, 'velocidade (perpendicular a B)', 'm/s'], [T`T`, 'período', 's']],
  uso: T`Espectrômetro de massa, cíclotron, câmara de bolhas.`,
  val: T`Velocidade perpendicular ao campo uniforme: MCU, com a força magnética como centrípeta. Se a velocidade tiver componente paralela ao campo, a trajetória é uma hélice.`,
  ex: [T`Um elétron a $10^7$ m/s entra perpendicularmente num campo de $10^{-3}$ T ($m = 9{,}1 \cdot 10^{-31}$ kg).`, T`$R = \dfrac{9{,}1 \cdot 10^{-31} \cdot 10^7}{1{,}6 \cdot 10^{-19} \cdot 10^{-3}} \approx 5{,}7\ \text{cm}$`],
  tags: 'raio trajetoria particula campo magnetico ciclotron espectrometro de massa periodo' },

{ id: 'seletor-velocidades', sub: 'forca', topico: 'Movimento de partículas em campos magnéticos',
  nome: 'Seletor de velocidades', tex: T`v = \dfrac{E}{B}`,
  vars: [[T`v`, 'velocidade das partículas que passam sem desviar', 'm/s'], [T`E`, 'campo elétrico', 'V/m'], [T`B`, 'campo magnético, perpendicular a E', 'T']],
  uso: T`Filtrar partículas de uma certa velocidade antes do espectrômetro de massa (experiência de Thomson).`,
  val: T`Campos uniformes, perpendiculares entre si e à velocidade. Vale para qualquer carga e massa: $|q|E = |q|vB$.`,
  ex: [T`Campos de $3 \cdot 10^4$ V/m e 0,01 T.`, T`$v = \dfrac{3 \cdot 10^4}{0{,}01} = 3 \cdot 10^6\ \text{m/s}$`],
  tags: 'seletor de velocidades thomson campos cruzados' },

{ id: 'forca-condutor', sub: 'forca', topico: 'Força sobre condutores', top: true,
  nome: 'Força magnética sobre um fio com corrente', tex: T`F = B\,i\,L\sen\theta`,
  vars: [[T`F`, 'força sobre o trecho de fio', 'N'], [T`B`, 'campo magnético', 'T'], [T`i`, 'corrente', 'A'], [T`L`, 'comprimento do fio dentro do campo', 'm'], [T`\theta`, 'ângulo entre o fio (sentido da corrente) e o campo', '°']],
  uso: T`Motores elétricos, alto-falantes, galvanômetros.`,
  val: T`Fio retilíneo em campo uniforme. Direção perpendicular ao fio e ao campo (mesma regra da mão usada para cargas positivas).`,
  ex: [T`Um fio de 0,2 m com 5 A, perpendicular a um campo de 0,4 T.`, T`$F = 0{,}4 \cdot 5 \cdot 0{,}2 = 0{,}4\ \text{N}$`],
  tags: 'forca magnetica fio condutor motor alto-falante' },

{ id: 'fios-paralelos', sub: 'forca', topico: 'Força sobre condutores',
  nome: 'Força entre fios paralelos', tex: T`\dfrac{F}{L} = \dfrac{\mu_0\,i_1\,i_2}{2\pi\,d}`,
  vars: [[T`F/L`, 'força por unidade de comprimento', 'N/m'], [T`i_1, i_2`, 'correntes nos fios', 'A'], [T`d`, 'distância entre os fios', 'm']],
  uso: T`Fios de alta corrente, definição histórica do ampère.`,
  val: T`Fios longos e paralelos. Correntes no **mesmo** sentido se atraem; em sentidos opostos, se repelem (o contrário das cargas).`,
  ex: [T`Dois fios a 1 m, cada um com 1 A.`, T`$\dfrac{F}{L} = \dfrac{4\pi \cdot 10^{-7}}{2\pi} = 2 \cdot 10^{-7}\ \text{N/m}$`],
  tags: 'forca entre fios paralelos atracao repulsao ampere' },

/* ===================== INDUÇÃO ===================== */
{ id: 'fluxo-magnetico', sub: 'inducao', topico: 'Fluxo magnético', top: true,
  nome: 'Fluxo magnético', tex: T`\Phi = B\,A\cos\theta`,
  vars: [[T`\Phi`, 'fluxo magnético através da espira', 'Wb (weber) = T·m²'], [T`B`, 'campo magnético', 'T'], [T`A`, 'área da espira', 'm²'], [T`\theta`, T`ângulo entre $\vec B$ e a **normal** ao plano da espira`, '°']],
  uso: T`Primeiro passo de todo problema de indução: o que importa é a **variação** do fluxo.`,
  val: T`Campo uniforme na área. O fluxo varia se mudar $B$, a área ou o ângulo (espira girando).`,
  ex: [T`Espira de 0,02 m² com o plano perpendicular a um campo de 0,5 T.`, T`$\theta = 0° \Rightarrow \Phi = 0{,}5 \cdot 0{,}02 = 0{,}01\ \text{Wb}$`],
  tags: 'fluxo magnetico weber area normal' },

{ id: 'faraday', sub: 'inducao', topico: 'Lei de Faraday', top: true,
  nome: 'Lei de Faraday-Neumann', tex: T`|\varepsilon| = N\,\dfrac{|\Delta\Phi|}{\Delta t}`,
  alt: [[T`Corrente induzida`, T`i = \dfrac{|\varepsilon|}{R}`]],
  vars: [[T`\varepsilon`, 'força eletromotriz induzida', 'V'], [T`N`, 'número de espiras', 'adimensional'], [T`\Delta\Phi`, 'variação do fluxo em cada espira', 'Wb'], [T`\Delta t`, 'intervalo de tempo', 's']],
  uso: T`Geradores, usinas, carregadores por indução, fogões de indução, cartões e detectores de metal.`,
  val: T`Fem média no intervalo. Só há indução enquanto o fluxo **varia**: ímã parado dentro da bobina não induz nada.`,
  ex: [T`Uma bobina de 100 espiras tem o fluxo reduzido de 0,01 Wb a zero em 0,1 s.`, T`$\varepsilon = 100 \cdot \dfrac{0{,}01}{0{,}1} = 10\ \text{V}$`],
  tags: 'faraday inducao forca eletromotriz induzida variacao de fluxo' },

{ id: 'lenz', sub: 'inducao', topico: 'Lei de Lenz', top: true,
  nome: 'Lei de Lenz (sentido da corrente induzida)', tex: T`\varepsilon = -\,N\,\dfrac{\Delta\Phi}{\Delta t}`,
  vars: [[T`-`, 'o sinal negativo expressa a lei de Lenz', ''], [T`\Delta\Phi`, 'variação do fluxo', 'Wb']],
  uso: T`Para descobrir o **sentido** da corrente induzida.`,
  val: T`A corrente induzida cria um campo que **se opõe à variação** do fluxo: se o fluxo aumenta, o campo induzido é contrário ao externo; se diminui, tem o mesmo sentido. É a conservação da energia: por isso é preciso força para mover o ímã.`,
  ex: [T`O polo norte de um ímã se aproxima de uma espira.`, T`A espira cria um polo norte voltado para o ímã, repelindo-o; a corrente circula no sentido anti-horário visto do ímã.`],
  tags: 'lenz sentido corrente induzida oposicao variacao' },

{ id: 'fem-movimento', sub: 'inducao', topico: 'Fem de movimento',
  nome: 'Barra condutora em movimento num campo', tex: T`\varepsilon = B\,L\,v`,
  alt: [[T`Corrente no circuito`, T`i = \dfrac{B\,L\,v}{R}`], [T`Força magnética que freia a barra`, T`F = \dfrac{B^2 L^2 v}{R}`]],
  vars: [[T`\varepsilon`, 'fem induzida', 'V'], [T`B`, 'campo magnético perpendicular ao plano', 'T'], [T`L`, 'comprimento da barra', 'm'], [T`v`, 'velocidade da barra', 'm/s']],
  uso: T`Trilhos com barra deslizante, asas de avião, freios magnéticos.`,
  val: T`Barra, velocidade e campo perpendiculares entre si. A força magnética na barra se opõe ao movimento (Lenz).`,
  ex: [T`Barra de 0,5 m a 4 m/s num campo de 0,2 T, ligada a 2 Ω.`, T`$\varepsilon = 0{,}2 \cdot 0{,}5 \cdot 4 = 0{,}4\ \text{V}; \quad i = 0{,}2\ \text{A}$`],
  tags: 'fem de movimento barra trilhos blv freio magnetico' },

{ id: 'gerador-ca', sub: 'inducao', topico: 'Geradores de corrente alternada',
  nome: 'Gerador de corrente alternada (espira girando)', tex: T`\varepsilon = \varepsilon_{máx}\sen(\omega t) \qquad \varepsilon_{máx} = N\,B\,A\,\omega`,
  alt: [[T`Valor eficaz`, T`U_{ef} = \dfrac{U_{máx}}{\sqrt 2} \qquad i_{ef} = \dfrac{i_{máx}}{\sqrt 2}`]],
  vars: [[T`\varepsilon_{máx}`, 'fem máxima', 'V'], [T`N`, 'número de espiras', 'adimensional'], [T`A`, 'área de cada espira', 'm²'], [T`\omega`, 'velocidade angular de rotação', 'rad/s']],
  uso: T`Usinas (hidrelétricas, eólicas, térmicas) e a rede elétrica: 127 V e 220 V são valores eficazes.`,
  val: T`Espira girando com $\omega$ constante em campo uniforme. O valor eficaz é o que produz o mesmo efeito Joule que uma tensão contínua.`,
  ex: [T`A tomada de 127 V eficazes.`, T`$U_{máx} = 127\sqrt 2 \approx 180\ \text{V}$; no Brasil a frequência é 60 Hz.`],
  tags: 'gerador corrente alternada usina valor eficaz rms' },

{ id: 'transformador', sub: 'inducao', topico: 'Transformadores', top: true,
  nome: 'Transformador ideal', tex: T`\dfrac{U_p}{U_s} = \dfrac{N_p}{N_s}`,
  alt: [[T`Correntes (potência conservada)`, T`U_p\,i_p = U_s\,i_s \Rightarrow \dfrac{i_p}{i_s} = \dfrac{N_s}{N_p}`]],
  vars: [[T`U_p, U_s`, 'tensões no primário e no secundário', 'V'], [T`N_p, N_s`, 'números de espiras', 'adimensional'], [T`i_p, i_s`, 'correntes', 'A']],
  uso: T`Carregadores, distribuição de energia (elevar a tensão para transmitir com menos perdas).`,
  val: T`Só funciona com **corrente alternada** (é preciso variação de fluxo). Ideal: sem perdas. Elevar a tensão reduz a corrente na linha e a perda $Ri^2$.`,
  ex: [T`Um carregador baixa 220 V para 11 V. O primário tem 2 000 espiras.`, T`$N_s = 2000 \cdot \dfrac{11}{220} = 100$ espiras`],
  ver: [['FUVEST 2027, questão 36', 'fuvest.html#q36']], tags: 'transformador espiras primario secundario tensao' },
];

L.forEach(f => { f.area = 'eletromagnetismo'; });
F.formulas.push(...L);
})();
