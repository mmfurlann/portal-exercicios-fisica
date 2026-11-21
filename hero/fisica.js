/* A Tal da Física · física da abertura 3D.
 *
 * Módulo PURO (sem DOM, sem Three.js): tudo aqui roda em Node e é testado por
 * fisica.test.mjs. A câmera cinematográfica NÃO está aqui; ela só lê estes estados.
 *
 * Sistema de coordenadas (destro, eclíptico):
 *   +y = normal da eclíptica (apontando para o norte eclíptico); plano x–z = eclíptica.
 *   O Sol está na direção SOL, contida na eclíptica (fixa: o Sol se desloca ~1°/dia,
 *   desprezível nos minutos de uma visita à página).
 *   O eixo de rotação da Terra, EIXO_TERRA, é +y inclinado de 23,44° (para o lado do Sol:
 *   configuração de verão no hemisfério norte).
 *   Rotação positiva em torno de EIXO_TERRA é anti-horária vista do polo norte, isto é,
 *   de oeste para leste, que é o sentido real da rotação da Terra.
 */

export const G = 6.67430e-11;          // m³ kg⁻¹ s⁻² (CODATA 2018)
export const M_TERRA = 5.9722e24;      // kg
export const M_LUA = 7.342e22;         // kg
export const R_TERRA = 6.371e6;        // m (raio médio)
export const R_LUA = 1.7374e6;         // m (raio médio)
export const D_TERRA_LUA = 3.844e8;    // m (semieixo maior, centro a centro)
export const G_LOCAL = 9.81;           // m/s², aproximação local ao nível do mar
export const DIA_SIDEREO = 86164.0905; // s (um giro de 360° da Terra)
export const INCLINACAO_EIXO = 23.44 * Math.PI / 180;   // eixo da Terra em relação à normal da eclíptica
export const INCLINACAO_ORBITA_LUNAR = 5.145 * Math.PI / 180; // plano orbital da Lua em relação à eclíptica

/** Força gravitacional entre duas massas: F = G·m1·m2 / r² (newtons). */
export const forcaGravitacional = (m1, m2, r) => G * m1 * m2 / (r * r);

/** Módulo da aceleração gravitacional criada por M a uma distância r do centro: g = G·M/r². */
export const campoGravitacional = (M, r) => G * M / (r * r);

/**
 * Baricentro Terra–Lua: distância dele ao centro da TERRA, em metros.
 * r_cm = d · m_L / (m_T + m_L)  (≈ 4,67·10⁶ m, ou 0,73 R_T: fica DENTRO da Terra).
 */
export const distanciaBaricentro = (d = D_TERRA_LUA) => d * M_LUA / (M_TERRA + M_LUA);

/**
 * Período orbital do par em órbita circular relativa de separação d:
 * T = 2π·sqrt(d³ / (G·(m_T + m_L)))  (a massa total entra, não só a da Terra).
 */
export const periodoOrbital = (d = D_TERRA_LUA) => 2 * Math.PI * Math.sqrt(d ** 3 / (G * (M_TERRA + M_LUA)));

/**
 * Estado do par Terra–Lua a um ângulo orbital theta (rad), medido a partir de +x,
 * crescendo no sentido anti-horário visto de +y (movimento direto, o mesmo da rotação da Terra).
 * Simplificação documentada: órbita CIRCULAR (a real tem e ≈ 0,055) em torno do baricentro,
 * que fica na origem. O plano orbital é a eclíptica inclinada de 5,145° em torno do eixo x.
 * `escalaDist` comprime SÓ a separação visual (didática); as proporções
 * Terra/Lua em torno do baricentro (m_L/M e m_T/M) são mantidas.
 * Retorna posições em unidades de R_TERRA.
 */
export function estadoTerraLua(theta, escalaDist = 1) {
  const sep = (D_TERRA_LUA / R_TERRA) * escalaDist;       // separação em R_T
  const f = M_LUA / (M_TERRA + M_LUA);                     // fração: Terra fica a f·sep do baricentro
  // Regra da mão direita em torno de +y leva +x → −z; por isso z = −sen θ (anti-horário visto de +y).
  const dir = [Math.cos(theta), 0, -Math.sin(theta)];      // do baricentro para a Lua, no plano da eclíptica
  const ci = Math.cos(INCLINACAO_ORBITA_LUNAR), si = Math.sin(INCLINACAO_ORBITA_LUNAR);
  const u = [dir[0], dir[1] * ci - dir[2] * si, dir[1] * si + dir[2] * ci]; // inclina em torno de x
  const lua = u.map(c => c * sep * (1 - f));
  const terra = u.map(c => -c * sep * f);
  return { lua, terra, sep, fracaoTerra: f };
}

/** Ângulo de rotação da Terra (rad) após t segundos reais, sentido +y (anti-horário visto do norte). */
export const anguloRotacaoTerra = t => 2 * Math.PI * t / DIA_SIDEREO;

/** Rotação sincronizada da Lua: um giro por órbita, sempre com a mesma face voltada para a Terra. */
export const anguloRotacaoLua = theta => theta + Math.PI;

/** Direção unitária do Sol (aponta DA Terra PARA o Sol). Fixa durante a visita. */
export const SOL = (() => { const v = [1, 0, 0.38]; const n = Math.hypot(...v); return v.map(c => c / n); })();

/** Eixo de rotação da Terra (unitário): +y girado de −23,44° em torno de z (polo norte inclinado para o Sol, em +x). */
export const EIXO_TERRA = [Math.sin(INCLINACAO_EIXO), Math.cos(INCLINACAO_EIXO), 0];

/**
 * Queda livre de um corpo perto da superfície. A aceleração aponta para o CENTRO da Terra:
 * a = g · (c − p)/|c − p|, com c = (0, −R_T, 0) no referencial local (origem na superfície).
 * Integração: velocity-Verlet com passo fixo (erro de posição O(dt²)).
 * Estado: { pos:[x,y,z] m, vel:[vx,vy,vz] m/s, t: s, repouso: bool }.
 */
export function novaQueda(altura, g = G_LOCAL) {
  return { pos: [0, altura, 0], vel: [0, 0, 0], t: 0, repouso: false, g };
}
const CENTRO = [0, -R_TERRA, 0];
function acel(pos, g) {
  const d = [CENTRO[0] - pos[0], CENTRO[1] - pos[1], CENTRO[2] - pos[2]];
  const n = Math.hypot(...d);
  return d.map(c => g * c / n);
}
export function passoQueda(s, dt) {
  if (s.repouso) return s;
  const a0 = acel(s.pos, s.g);
  const pos = s.pos.map((p, i) => p + s.vel[i] * dt + 0.5 * a0[i] * dt * dt);
  const a1 = acel(pos, s.g);
  const vel = s.vel.map((v, i) => v + 0.5 * (a0[i] + a1[i]) * dt);
  s.t += dt;
  if (pos[1] <= 0) {            // chão: o solo local (plano tangente) em y = 0
    s.pos = [pos[0], 0, pos[2]]; s.vel = [0, 0, 0]; s.repouso = true;
  } else { s.pos = pos; s.vel = vel; }
  return s;
}
/** Tempo analítico de queda de uma altura h com g constante: t = sqrt(2h/g). */
export const tempoQueda = (h, g = G_LOCAL) => Math.sqrt(2 * h / g);
