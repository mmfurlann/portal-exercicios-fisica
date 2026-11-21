// Testes numéricos da física da abertura. Executar com:  node hero/fisica.test.mjs
import * as F from './fisica.js';
let falhas = 0;
const ok = (nome, cond, info = '') => { console.log(`${cond ? 'OK  ' : 'FALHOU'}  ${nome}${info ? '  → ' + info : ''}`); if (!cond) falhas++; };
const perto = (a, b, tol) => Math.abs(a - b) <= tol;

// 1. g na superfície a partir da lei de Newton ≈ 9,81
const g = F.campoGravitacional(F.M_TERRA, F.R_TERRA);
ok('G·M/R² ≈ 9,81 m/s² (±0,05)', perto(g, 9.81, 0.05), g.toFixed(4));

// 2. Força Terra–Lua ≈ 1,98e20 N
const f = F.forcaGravitacional(F.M_TERRA, F.M_LUA, F.D_TERRA_LUA);
ok('F Terra–Lua ≈ 1,98·10²⁰ N (±1%)', perto(f / 1.98e20, 1, 0.01), f.toExponential(3));

// 3. Baricentro dentro da Terra, ≈ 4,67e6 m (0,73 R_T)
const rb = F.distanciaBaricentro();
ok('Baricentro ≈ 4,67·10⁶ m, dentro da Terra', perto(rb, 4.67e6, 0.02e6) && rb < F.R_TERRA, `${rb.toExponential(3)} m = ${(rb / F.R_TERRA).toFixed(3)} R_T`);

// 4. Período orbital ≈ 27,3 dias (sideral 27,32; círculo simplificado)
const T = F.periodoOrbital() / 86400;
ok('Período ≈ 27,3 d (±0,3)', perto(T, 27.32, 0.3), `${T.toFixed(3)} d`);

// 5. Newton III: as acelerações do par são opostas, e as razões de massa batem com o baricentro
const e = F.estadoTerraLua(1.234, 1);
const mt = F.M_TERRA, ml = F.M_LUA;
const cm = e.terra.map((c, i) => (mt * c + ml * e.lua[i]) / (mt + ml));
ok('Centro de massa do par fica na origem', Math.hypot(...cm) < 1e-9, Math.hypot(...cm).toExponential(2));
ok('Separação Terra–Lua = 60,34 R_T (escala real)', perto(Math.hypot(...e.lua.map((c, i) => c - e.terra[i])), F.D_TERRA_LUA / F.R_TERRA, 1e-9));
const d16 = F.estadoTerraLua(0.5, 16 / (F.D_TERRA_LUA / F.R_TERRA));
ok('Escala didática mantém a fração do baricentro', perto(Math.hypot(...d16.terra) / d16.sep, F.M_LUA / (mt + ml), 1e-12));

// 6. Sentido: a Lua avança no sentido anti-horário visto de +y, como a rotação da Terra
// momento angular orbital L = r × v deve ter componente +y (mesmo sinal da rotação da Terra, +y)
const a = F.estadoTerraLua(0, 1).lua, b = F.estadoTerraLua(0.01, 1).lua;
const v = b.map((c, i) => c - a[i]);
const Ly = a[2] * v[0] - a[0] * v[2];        // (r × v)_y = r_z v_x − r_x v_z
ok('Lua em movimento direto: L_orbital·ŷ > 0 (mesmo sentido da rotação terrestre)', Ly > 0, `L_y ∝ ${Ly.toExponential(2)}`);
// rotação terrestre: ponto no equador (x=1) deve ir para −z (leste), coerente com +y destro
const R = F.anguloRotacaoTerra(1000);
const px = Math.cos(R), pz = -Math.sin(R);   // ponto (1,0,0) girado de R em torno de +y
ok('Ponto do equador se desloca de +x para −z (anti-horário visto de +y)', pz < 0 && px > 0.99, `(${px.toFixed(5)}, ${pz.toFixed(5)})`);
// plano orbital: inclinação de 5,145° em relação à eclíptica
const n = F.estadoTerraLua(Math.PI / 2, 1).lua;
const incl = Math.asin(Math.abs(n[1]) / Math.hypot(...n)) * 180 / Math.PI;
ok('Inclinação orbital máxima da Lua = 5,145° (±0,01)', perto(incl, 5.145, 0.01), `${incl.toFixed(3)}°`);

// 7. Queda livre: numérica vs analítica
for (const h of [0.5, 2.2, 10]) {
  const s = F.novaQueda(h); const dt = 1 / 1000; let n = 0;
  while (!s.repouso && n++ < 1e6) F.passoQueda(s, dt);
  const ta = F.tempoQueda(h);
  ok(`Queda de ${h} m: t numérico ≈ √(2h/g)`, perto(s.t, ta, 2e-3), `${s.t.toFixed(4)} s vs ${ta.toFixed(4)} s`);
}
// velocidade no impacto v = √(2gh) (antes do repouso)
{
  const h = 2.2, s = F.novaQueda(h); let vimp = 0;
  while (!s.repouso) { const v = Math.abs(s.vel[1]); F.passoQueda(s, 1 / 2000); if (!s.repouso) vimp = Math.abs(s.vel[1]); else break; }
  ok('Velocidade logo antes do solo ≈ √(2gh)', perto(vimp, Math.sqrt(2 * 9.81 * h), 0.05), `${vimp.toFixed(3)} vs ${Math.sqrt(2 * 9.81 * h).toFixed(3)} m/s`);
}
// 8. A aceleração aponta ao centro da Terra: a queda a partir de x deslocado converge levemente em x (efeito minúsculo)
{
  const s = F.novaQueda(100); s.pos[0] = 50; const x0 = s.pos[0];
  for (let i = 0; i < 4000 && !s.repouso; i++) F.passoQueda(s, 1 / 1000);
  ok('Componente horizontal da aceleração aponta para o eixo que passa pelo centro (x diminui)', s.pos[0] < x0, `Δx = ${(s.pos[0] - x0).toExponential(2)} m`);
}
// 9. Energia mecânica na queda (g constante): ½v² + g·y conservada
{
  const s = F.novaQueda(5); const E0 = 9.81 * 5; let desvio = 0;
  while (!s.repouso) { F.passoQueda(s, 1 / 2000); if (s.repouso) break; const E = 0.5 * Math.hypot(...s.vel) ** 2 + 9.81 * s.pos[1]; desvio = Math.max(desvio, Math.abs(E - E0) / E0); }
  ok('Energia mecânica conservada (< 0,1%)', desvio < 1e-3, `${(desvio * 100).toExponential(2)} %`);
}
// 10. Rotação da Terra: um dia sideral = 2π
ok('Rotação: 2π em um dia sideral', perto(F.anguloRotacaoTerra(F.DIA_SIDEREO), 2 * Math.PI, 1e-12));
ok('Sol: vetor unitário e contido na eclíptica (y = 0)', perto(Math.hypot(...F.SOL), 1, 1e-12) && F.SOL[1] === 0);
ok('Eixo da Terra: unitário e a 23,44° da normal da eclíptica', perto(Math.hypot(...F.EIXO_TERRA), 1, 1e-12) && perto(Math.acos(F.EIXO_TERRA[1]) * 180 / Math.PI, 23.44, 1e-9));
ok('Polo norte inclinado para o Sol (EIXO·SOL > 0): verão no hemisfério norte', F.EIXO_TERRA.reduce((a, c, i) => a + c * F.SOL[i], 0) > 0);

console.log(falhas ? `\n${falhas} teste(s) FALHARAM` : '\nTodos os testes passaram');
process.exit(falhas ? 1 : 0);
