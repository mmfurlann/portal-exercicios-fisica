/* Biblioteca de Fórmulas · H. FÍSICA E ASTRONOMIA
   Campos: veja o comentário no topo de formulas/app.js. Texto com matemática entre $...$.
   As leis de Kepler gerais, a velocidade orbital e a velocidade de escape estão em Mecânica > Gravitação;
   aqui ficam as formas e aplicações próprias da astronomia, com links para lá. */
(function () {
const T = String.raw;
const F = window.FORMULAS = window.FORMULAS || { areas: [], formulas: [] };

F.areas.push({
  id: 'astronomia', nome: 'Física e Astronomia', sym: '☉',
  intro: T`A física aplicada ao céu: medir massas de astros, distâncias de estrelas, temperaturas pela cor e a expansão do Universo. As leis gerais da gravitação estão em Mecânica; aqui estão as ferramentas próprias da astronomia.`,
  subs: [
    { id: 'kepler-astro', nome: 'Leis de Kepler', topicos: ['Kepler no Sistema Solar'] },
    { id: 'orbitas', nome: 'Gravitação e órbitas', topicos: ['Massa dos astros', 'Satélites artificiais'] },
    { id: 'sistema-solar', nome: 'Sistema Solar', topicos: ['O Sol', 'Planetas'] },
    { id: 'planetas', nome: 'Movimento dos planetas', topicos: ['Velocidades orbitais', 'Período sinódico'] },
    { id: 'escape', nome: 'Velocidade de escape', topicos: ['Buracos negros'] },
    { id: 'radiacao', nome: 'Radiação eletromagnética', topicos: ['Radiação de corpo negro', 'Efeito Doppler da luz', 'Expansão do Universo'] },
    { id: 'grandezas', nome: 'Grandezas astronômicas fundamentais', topicos: ['Unidades de distância', 'Paralaxe', 'Brilho das estrelas'] },
  ],
});

const L = [
/* ===================== KEPLER ===================== */
{ id: 'kepler-ua', sub: 'kepler-astro', topico: 'Kepler no Sistema Solar', top: true,
  nome: '3ª lei de Kepler em unidades astronômicas', tex: T`T^2 = a^3 \quad (T \text{ em anos},\ a \text{ em UA})`,
  vars: [[T`T`, 'período orbital', 'ano terrestre'], [T`a`, 'semieixo maior da órbita', 'UA']],
  uso: T`Atalho para planetas, asteroides e cometas que orbitam o Sol, sem usar $G$ nem a massa do Sol.`,
  val: T`Só para corpos que orbitam o **Sol** (a Terra dá a referência: 1 ano, 1 UA). Para luas de Júpiter ou satélites da Terra, a constante é outra.`,
  ex: [T`Júpiter está a 5,2 UA do Sol.`, T`$T = 5{,}2^{3/2} \approx 11{,}9$ anos`],
  ver: [['As três leis de Kepler (Mecânica)', '#f/kepler-3'], ['1ª lei: órbitas elípticas', '#f/kepler-1'], ['2ª lei: áreas', '#f/kepler-2'], ['Mecânica celeste', 'mecanica-celeste.html']], tags: 'kepler ua anos sistema solar periodo planeta' },

/* ===================== ÓRBITAS ===================== */
{ id: 'massa-astro', sub: 'orbitas', topico: 'Massa dos astros', top: true,
  nome: 'Massa de um astro a partir de uma órbita', tex: T`M = \dfrac{4\pi^2\,r^3}{G\,T^2}`,
  vars: [[T`M`, 'massa do astro central', 'kg'], [T`r`, 'raio da órbita de um satélite (ou planeta) em torno dele', 'm'], [T`T`, 'período dessa órbita', 's']],
  uso: T`É assim que se "pesam" o Sol, os planetas com luas e até buracos negros no centro de galáxias.`,
  val: T`Órbita aproximadamente circular e massa do satélite desprezível em relação à do astro central.`,
  ex: [T`A Terra orbita o Sol a 1,5 × 10¹¹ m em 1 ano (3,16 × 10⁷ s).`, T`$M = \dfrac{4\pi^2 (1{,}5 \cdot 10^{11})^3}{6{,}67 \cdot 10^{-11} \cdot (3{,}16 \cdot 10^7)^2} \approx 2 \cdot 10^{30}\ \text{kg}$`],
  ver: [['Velocidade e período orbital', '#f/velocidade-orbital']], tags: 'massa do sol massa astro orbita' },

{ id: 'geoestacionario', sub: 'orbitas', topico: 'Satélites artificiais',
  nome: 'Raio da órbita geoestacionária', tex: T`r = \sqrt[3]{\dfrac{G\,M\,T^2}{4\pi^2}}`,
  vars: [[T`r`, 'raio da órbita (a partir do centro da Terra)', 'm'], [T`M`, 'massa da Terra', 'kg'], [T`T`, 'período = um dia sideral (≈ 86 164 s)', 's']],
  uso: T`Satélites de TV e meteorologia que parecem parados no céu.`,
  val: T`Órbita circular, no plano do equador, no mesmo sentido da rotação da Terra. Todos os geoestacionários estão na mesma altitude, qualquer que seja sua massa.`,
  ex: [T`Use $GM = g_0 R^2 = 10 \cdot (6{,}4 \cdot 10^6)^2$.`, T`$r \approx 4{,}2 \cdot 10^7\ \text{m} \approx 42\,000\ \text{km}$: cerca de 36 000 km de altitude`],
  tags: 'geoestacionario satelite orbita altitude' },

/* ===================== SISTEMA SOLAR ===================== */
{ id: 'constante-solar', sub: 'sistema-solar', topico: 'O Sol', top: true,
  nome: 'Intensidade da radiação a uma distância (constante solar)', tex: T`I = \dfrac{L}{4\pi d^2}`,
  vars: [[T`I`, 'intensidade (potência por área) recebida', 'W/m²'], [T`L`, 'luminosidade: potência total emitida pela estrela (Sol: 3,8 × 10²⁶ W)', 'W'], [T`d`, 'distância à estrela', 'm']],
  uso: T`Energia solar que chega a cada planeta, painéis solares, por que planetas distantes são frios.`,
  val: T`Fonte que emite igualmente em todas as direções, sem absorção no caminho. No topo da atmosfera da Terra, $I \approx 1\,360$ W/m².`,
  ex: [T`Constante solar na Terra ($d = 1{,}5 \cdot 10^{11}$ m).`, T`$I = \dfrac{3{,}85 \cdot 10^{26}}{4\pi (1{,}5 \cdot 10^{11})^2} \approx 1\,360\ \text{W/m}^2$; em Marte (1,52 UA), cerca de 590 W/m².`],
  ver: [['Intensidade sonora (mesma lei)', '#f/intensidade-sonora'], ['Efeito estufa', 'atmosfera/sim_efeito_estufa.html']], tags: 'constante solar intensidade luminosidade inverso do quadrado' },

{ id: 'densidade-planeta', sub: 'sistema-solar', topico: 'Planetas',
  nome: 'Densidade média de um planeta', tex: T`d = \dfrac{3\,g_0}{4\pi\,G\,R}`,
  vars: [[T`d`, 'densidade média', 'kg/m³'], [T`g_0`, 'gravidade na superfície', 'm/s²'], [T`R`, 'raio do planeta', 'm']],
  uso: T`Para saber se um planeta é rochoso (≈ 4 a 5,5 g/cm³) ou gasoso (≈ 0,7 a 1,6 g/cm³).`,
  val: T`Planeta esférico. Sai de $g_0 = GM/R^2$ com $M = d \cdot \tfrac{4}{3}\pi R^3$.`,
  ex: [T`Terra: $g_0 = 10$ m/s², $R = 6{,}4 \cdot 10^6$ m.`, T`$d = \dfrac{30}{4\pi \cdot 6{,}67 \cdot 10^{-11} \cdot 6{,}4 \cdot 10^6} \approx 5\,600\ \text{kg/m}^3 = 5{,}6\ \text{g/cm}^3$`],
  ver: [['Campo gravitacional', '#f/campo-gravitacional']], tags: 'densidade planeta rochoso gasoso' },

/* ===================== MOVIMENTO DOS PLANETAS ===================== */
{ id: 'velocidade-orbital-media', sub: 'planetas', topico: 'Velocidades orbitais',
  nome: 'Velocidade orbital média de um planeta', tex: T`v_m = \dfrac{2\pi\,a}{T}`,
  vars: [[T`v_m`, 'velocidade média na órbita', 'm/s'], [T`a`, 'raio médio da órbita', 'm'], [T`T`, 'período orbital', 's']],
  uso: T`Comparar velocidades dos planetas: os mais próximos do Sol são mais rápidos.`,
  val: T`Órbita aproximadamente circular. Na órbita elíptica a velocidade varia (2ª lei de Kepler).`,
  ex: [T`Velocidade da Terra em torno do Sol.`, T`$v_m = \dfrac{2\pi \cdot 1{,}5 \cdot 10^{11}}{3{,}16 \cdot 10^7} \approx 30\ \text{km/s}$`],
  ver: [['Velocidade orbital (gravitação)', '#f/velocidade-orbital']], tags: 'velocidade orbital planeta terra' },

{ id: 'periodo-sinodico', sub: 'planetas', topico: 'Período sinódico',
  nome: 'Período sinódico', tex: T`\dfrac{1}{S} = \left|\dfrac{1}{T_1} - \dfrac{1}{T_2}\right|`,
  vars: [[T`S`, 'período sinódico: tempo entre dois alinhamentos iguais Sol–Terra–planeta (ou fases da Lua)', 'anos ou dias'], [T`T_1, T_2`, 'períodos siderais (verdadeiros) dos dois corpos', 'anos ou dias']],
  uso: T`De quanto em quanto tempo Marte fica mais próximo da Terra (janelas de lançamento), ciclo das fases da Lua.`,
  val: T`Órbitas circulares e no mesmo sentido. É o problema do "encontro de ponteiros" aplicado aos planetas.`,
  ex: [T`Terra (1 ano) e Marte (1,88 ano).`, T`$\dfrac{1}{S} = 1 - \dfrac{1}{1{,}88} \approx 0{,}47 \Rightarrow S \approx 2{,}1$ anos (cerca de 780 dias)`],
  ver: [['Função horária do MCU', '#f/mcu-angular']], tags: 'periodo sinodico sideral oposicao fases da lua' },

/* ===================== ESCAPE ===================== */
{ id: 'schwarzschild', sub: 'escape', topico: 'Buracos negros',
  nome: 'Raio de Schwarzschild (horizonte de um buraco negro)', tex: T`R_S = \dfrac{2\,G\,M}{c^2}`,
  vars: [[T`R_S`, 'raio em que a velocidade de escape iguala a da luz', 'm'], [T`M`, 'massa do corpo', 'kg'], [T`c`, 'velocidade da luz', 'm/s']],
  uso: T`Tamanho do horizonte de eventos de buracos negros.`,
  val: T`Sai de igualar a velocidade de escape $\sqrt{2GM/R}$ a $c$. O resultado coincide com o da relatividade geral para buracos negros sem rotação.`,
  ex: [T`Se o Sol ($2 \cdot 10^{30}$ kg) virasse buraco negro.`, T`$R_S = \dfrac{2 \cdot 6{,}67 \cdot 10^{-11} \cdot 2 \cdot 10^{30}}{9 \cdot 10^{16}} \approx 3\ \text{km}$`],
  ver: [['Velocidade de escape', '#f/velocidade-escape']], tags: 'buraco negro schwarzschild horizonte de eventos escape' },

/* ===================== RADIAÇÃO ===================== */
{ id: 'wien', sub: 'radiacao', topico: 'Radiação de corpo negro', top: true,
  nome: 'Lei de deslocamento de Wien', tex: T`\lambda_{máx}\,T = b \qquad b \approx 2{,}9 \cdot 10^{-3}\ \text{m·K}`,
  vars: [[T`\lambda_{máx}`, 'comprimento de onda de emissão máxima', 'm'], [T`T`, 'temperatura da superfície', 'K'], [T`b`, 'constante de Wien', 'm·K']],
  uso: T`Temperatura de estrelas pela cor; câmeras térmicas; por que o ferro aquecido vai do vermelho ao branco.`,
  val: T`Corpos aproximadamente negros (estrelas, filamentos). Mais quente: pico em comprimento de onda menor (estrelas azuis são mais quentes que as vermelhas).`,
  ex: [T`O Sol emite mais em torno de 500 nm.`, T`$T = \dfrac{2{,}9 \cdot 10^{-3}}{5 \cdot 10^{-7}} \approx 5\,800\ \text{K}$`],
  tags: 'wien corpo negro cor temperatura estrela' },

{ id: 'luminosidade', sub: 'radiacao', topico: 'Radiação de corpo negro',
  nome: 'Luminosidade de uma estrela (Stefan-Boltzmann)', tex: T`L = 4\pi R^2\,\sigma\,T^4`,
  vars: [[T`L`, 'luminosidade (potência total emitida)', 'W'], [T`R`, 'raio da estrela', 'm'], [T`\sigma`, 'constante de Stefan-Boltzmann: 5,67 × 10⁻⁸', 'W/(m²·K⁴)'], [T`T`, 'temperatura da superfície', 'K']],
  uso: T`Comparar estrelas: gigantes vermelhas são frias, mas enormes e muito luminosas.`,
  val: T`Estrela tratada como corpo negro esférico. Dobrar a temperatura multiplica a luminosidade por 16.`,
  ex: [T`O Sol: $R = 7 \cdot 10^8$ m e $T = 5\,800$ K.`, T`$L = 4\pi (7 \cdot 10^8)^2 \cdot 5{,}67 \cdot 10^{-8} \cdot 5800^4 \approx 4 \cdot 10^{26}\ \text{W}$`],
  ver: [['Radiação térmica (Termologia)', '#f/stefan-boltzmann']], tags: 'luminosidade estrela stefan boltzmann potencia' },

{ id: 'redshift', sub: 'radiacao', topico: 'Efeito Doppler da luz',
  nome: 'Desvio para o vermelho (Doppler da luz)', tex: T`z = \dfrac{\Delta\lambda}{\lambda_0} \approx \dfrac{v}{c}`,
  vars: [[T`z`, 'desvio para o vermelho (redshift)', 'adimensional'], [T`\Delta\lambda`, 'diferença entre o comprimento de onda observado e o de laboratório', 'm'], [T`\lambda_0`, 'comprimento de onda emitido (de laboratório)', 'm'], [T`v`, 'velocidade de afastamento', 'm/s']],
  uso: T`Medir velocidades de estrelas e galáxias pelas linhas do espectro; detectar exoplanetas.`,
  val: T`A forma $z \approx v/c$ vale para $v \ll c$. Afastamento: linhas deslocadas para o vermelho; aproximação: para o azul.`,
  ex: [T`A linha de 656,3 nm do hidrogênio aparece em 662,9 nm numa galáxia.`, T`$z = \dfrac{6{,}6}{656{,}3} \approx 0{,}01 \Rightarrow v \approx 3\,000\ \text{km/s}$ (afastando-se)`],
  ver: [['Efeito Doppler do som', '#f/doppler']], tags: 'redshift desvio para o vermelho doppler luz galaxia' },

{ id: 'hubble', sub: 'radiacao', topico: 'Expansão do Universo',
  nome: 'Lei de Hubble-Lemaître', tex: T`v = H_0\,d`,
  alt: [[T`Idade aproximada do Universo`, T`t \approx \dfrac{1}{H_0}`]],
  vars: [[T`v`, 'velocidade de afastamento da galáxia', 'km/s'], [T`H_0`, 'constante de Hubble (≈ 70)', 'km/s/Mpc'], [T`d`, 'distância da galáxia', 'Mpc']],
  uso: T`Distâncias de galáxias a partir do redshift; evidência da expansão do Universo e do Big Bang.`,
  val: T`Galáxias distantes (fora do Grupo Local), em que a expansão domina os movimentos próprios. O valor de $H_0$ ainda é debatido (a "tensão de Hubble": 67 ou 73 km/s/Mpc).`,
  ex: [T`Uma galáxia se afasta a 7 000 km/s.`, T`$d = \dfrac{7000}{70} = 100\ \text{Mpc}$, cerca de 330 milhões de anos-luz`],
  ver: [['FUVEST 2027, questão 54', 'fuvest.html#q54']], tags: 'hubble lemaitre expansao universo big bang galaxia' },

/* ===================== GRANDEZAS ===================== */
{ id: 'unidades-astronomicas', sub: 'grandezas', topico: 'Unidades de distância', top: true,
  nome: 'Unidades astronômicas de distância', tex: T`1\ \text{UA} \approx 1{,}5 \cdot 10^{11}\ \text{m} \qquad 1\ \text{ano-luz} \approx 9{,}46 \cdot 10^{15}\ \text{m}`,
  alt: [[T`Parsec`, T`1\ \text{pc} \approx 3{,}26\ \text{anos-luz} \approx 3{,}09 \cdot 10^{16}\ \text{m}`], [T`Ano-luz (definição)`, T`1\ \text{ano-luz} = c \cdot 1\ \text{ano}`]],
  vars: [[T`\text{UA}`, 'unidade astronômica: distância média Terra–Sol', 'm'], [T`\text{ano-luz}`, 'distância que a luz percorre em um ano (unidade de distância, não de tempo)', 'm'], [T`\text{pc}`, 'parsec', 'm']],
  uso: T`Para trabalhar com distâncias no Sistema Solar (UA) e entre estrelas e galáxias (ano-luz, parsec).`,
  val: T`Valores aproximados. Ver uma estrela a 100 anos-luz é ver a luz que saiu dela há 100 anos.`,
  ex: [T`Quantas UA há em um ano-luz?`, T`$\dfrac{9{,}46 \cdot 10^{15}}{1{,}5 \cdot 10^{11}} \approx 63\,000\ \text{UA}$`],
  ver: [['Velocidade da luz', '#f/velocidade-luz']], tags: 'unidade astronomica ano luz parsec distancia' },

{ id: 'paralaxe', sub: 'grandezas', topico: 'Paralaxe',
  nome: 'Distância por paralaxe', tex: T`d\ (\text{pc}) = \dfrac{1}{p\ (\text{segundos de arco})}`,
  vars: [[T`d`, 'distância da estrela', 'pc'], [T`p`, 'ângulo de paralaxe (metade do deslocamento aparente em 6 meses)', '″']],
  uso: T`Medir a distância de estrelas próximas pelo seu "vai e vem" aparente ao longo do ano.`,
  val: T`Ângulos muito pequenos (aproximação $\tg p \approx p$). Funciona para estrelas relativamente próximas (milhares de parsecs com satélites como o Gaia).`,
  ex: [T`Próxima Centauri tem paralaxe de 0,77″.`, T`$d = \dfrac{1}{0{,}77} \approx 1{,}3\ \text{pc} \approx 4{,}2\ \text{anos-luz}$`],
  tags: 'paralaxe estelar distancia parsec segundo de arco' },

{ id: 'magnitude', sub: 'grandezas', topico: 'Brilho das estrelas',
  nome: 'Escala de magnitudes (Pogson)', tex: T`m_1 - m_2 = -\,2{,}5\,\log\dfrac{F_1}{F_2}`,
  vars: [[T`m_1, m_2`, 'magnitudes aparentes (menor = mais brilhante)', 'adimensional'], [T`F_1, F_2`, 'fluxos de luz recebidos das estrelas', 'W/m²']],
  uso: T`Comparar o brilho das estrelas e de outros astros no céu.`,
  val: T`Escala logarítmica e "invertida": 5 magnitudes de diferença correspondem a um fator 100 no brilho; 1 magnitude, a cerca de 2,5.`,
  ex: [T`Uma estrela de magnitude 1 e outra de magnitude 6.`, T`$-5 = -2{,}5\log\dfrac{F_1}{F_2} \Rightarrow \dfrac{F_1}{F_2} = 100$`],
  ver: [['Nível sonoro (outra escala logarítmica)', '#f/nivel-sonoro']], tags: 'magnitude brilho estrela pogson logaritmo' },
];

L.forEach(f => { f.area = 'astronomia'; });
F.formulas.push(...L);
})();
