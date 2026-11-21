/* A Tal da Física · cena 3D da abertura (Three.js).
 *
 * Separação de responsabilidades:
 *   · fisica.js  → dinâmica (posições, queda, rotação). Testada em Node.
 *   · cena.js    → este arquivo: desenha o estado físico e conduz a CÂMERA (cinema).
 *                  A câmera nunca altera a física; só escolhe de onde olhar.
 *
 * Unidades da cena ESPACIAL: 1 unidade = 1 raio terrestre (R_T).
 * Unidades da cena LOCAL (maçã): 1 unidade = 1 metro.
 * Escalas didáticas (declaradas em FIDELIDADE_FISICA.md):
 *   · separação Terra–Lua comprimida de 60,34 R_T para SEP_VISUAL (raios mantidos em escala real);
 *   · tempo acelerado e fora de proporção (rotação e órbita visíveis em segundos).
 */
import * as THREE from 'three';
import * as F from './fisica.js';

const BASE = new URL('./tex/', import.meta.url).href;
export const SEP_VISUAL = 16;                                  // R_T
export const ESCALA_DIST = SEP_VISUAL / (F.D_TERRA_LUA / F.R_TERRA);
const R_LUA = F.R_LUA / F.R_TERRA;                              // 0,2727 (escala real)
const PER_ROT = 100;                                            // s de relógio por giro da Terra (didático)
const PER_ORB = 140;                                            // s de relógio por órbita da Lua (didático)
const CAMERA_LENTA = 0.25;                                      // maçã em câmera lenta (declarado na legenda)
const ALTURA_QUEDA = 1.0;                                       // m
const R_MACA = 0.052;                                           // m
const ACENTO = '#D18A32';

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/** Perfil de qualidade por classe de dispositivo. */
export function perfilPara(largura, altura) {
  const retrato = altura > largura;
  if (largura < 700) return { nome: 'celular', retrato: true, seg: [48, 32], lua: [40, 24], pr: 1.25, tex: '1k', nuvens: '512', aniso: 2, relva: 500, estrelas: 700 };
  if (largura < 1100) return { nome: 'tablet', retrato, seg: [72, 48], lua: [56, 36], pr: 1.5, tex: '1k', nuvens: '512', aniso: 4, relva: 900, estrelas: 1000 };
  return { nome: 'desktop', retrato: false, seg: [128, 64], lua: [96, 48], pr: 2, tex: '2k', nuvens: '1k', aniso: 8, relva: 1600, estrelas: 1500 };
}

export async function criarCena(canvas, opcoes = {}) {
  const o = Object.assign({ animar: true, aoEstado: () => {}, aoPerderContexto: () => {}, aoRestaurarContexto: () => {} }, opcoes);
  let largura = canvas.clientWidth || 800, altura = canvas.clientHeight || 600;
  let perfil = perfilPara(largura, altura);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x0A0B11, 1);
  let pr = Math.min(window.devicePixelRatio || 1, perfil.pr);
  renderer.setPixelRatio(pr);
  renderer.setSize(largura, altura, false);

  // ---------- texturas ----------
  const carregador = new THREE.TextureLoader();
  const carrega = (arq, srgb = true) => new Promise((res, rej) => carregador.load(BASE + arq, t => {
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = Math.min(perfil.aniso, renderer.capabilities.getMaxAnisotropy());
    res(t);
  }, undefined, () => rej(new Error('textura ' + arq))));
  const k = perfil.tex;
  const [dia, noite, espec, nuvens, luaCor, luaAlt] = await Promise.all([
    carrega(`earth_day_${k}.jpg`), carrega(`earth_lights_${k}.jpg`), carrega(`earth_spec_${k}.jpg`, false),
    carrega(`earth_clouds_${perfil.nuvens}.png`), carrega(`moon_color_${k}.jpg`), carrega(`moon_height_${k}.jpg`, false),
  ]);
  const texturas = [dia, noite, espec, nuvens, luaCor, luaAlt];

  const SOL = V(F.SOL);
  const camera = new THREE.PerspectiveCamera(32, largura / altura, 0.05, 1200);

  // =====================================================================
  // CENA ESPACIAL
  // =====================================================================
  const espaco = new THREE.Scene();
  const luzSol = new THREE.DirectionalLight(0xfff4e6, Math.PI * 1.15);
  luzSol.position.copy(SOL).multiplyScalar(100);
  espaco.add(luzSol, new THREE.AmbientLight(0x1b2440, 0.55));

  // estrelas: poucas, de brilho e tamanho variados (sem "chuva" de partículas)
  function criaEstrelas(n) {
    const r = rng(20240519), pos = new Float32Array(n * 3), br = new Float32Array(n), tam = new Float32Array(n), cor = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      pos.set([s * Math.cos(a) * 600, u * 600, s * Math.sin(a) * 600], i * 3);
      const m = Math.pow(r(), 6);                     // poucas brilhantes, muitas fracas
      br[i] = 0.18 + 0.82 * Math.pow(r(), 2.5) * (0.4 + 0.6 * m + 0.2);
      tam[i] = 1.0 + m * 1.9;
      const t = r(); cor.set([0.85 + 0.15 * t, 0.9, 1.0 - 0.25 * t], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('brilho', new THREE.BufferAttribute(br, 1));
    g.setAttribute('tam', new THREE.BufferAttribute(tam, 1));
    g.setAttribute('cor', new THREE.BufferAttribute(cor, 3));
    return g;
  }
  const geoEstrelas = criaEstrelas(perfil.estrelas);
  const matEstrelas = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uPr: { value: pr } },
    vertexShader: 'attribute float brilho; attribute float tam; attribute vec3 cor; varying float vB; varying vec3 vC; uniform float uPr; void main(){ vB=brilho; vC=cor; gl_PointSize=tam*uPr; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'varying float vB; varying vec3 vC; void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c)*2.0; float a=smoothstep(1.0,0.2,d)*vB; gl_FragColor=vec4(vC*a,a); }',
  });
  const estrelasEsp = new THREE.Points(geoEstrelas, matEstrelas); estrelasEsp.frustumCulled = false;
  espaco.add(estrelasEsp);

  // Terra: inclinação axial 23,44° e rotação para leste (+ em torno do eixo, anti-horário visto do norte)
  const terraInclinada = new THREE.Group();
  terraInclinada.rotation.z = -F.INCLINACAO_EIXO;                      // leva +y a EIXO_TERRA = (sen i, cos i, 0)
  const geoTerra = new THREE.SphereGeometry(1, perfil.seg[0], perfil.seg[1]);
  const matTerra = new THREE.ShaderMaterial({
    uniforms: { mapDia: { value: dia }, mapNoite: { value: noite }, mapEspec: { value: espec }, uSol: { value: SOL.clone() } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vP; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vP=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader: `uniform sampler2D mapDia; uniform sampler2D mapNoite; uniform sampler2D mapEspec; uniform vec3 uSol;
      varying vec2 vUv; varying vec3 vN; varying vec3 vP;
      void main(){
        vec3 N=normalize(vN); vec3 L=normalize(uSol); vec3 Vw=normalize(cameraPosition-vP);
        float nl=dot(N,L);
        vec3 d=texture2D(mapDia,vUv).rgb; vec3 n=texture2D(mapNoite,vUv).rgb; float sp=texture2D(mapEspec,vUv).r;
        float luz=max(nl,0.0);
        vec3 H=normalize(L+Vw);
        float brilho=pow(max(dot(N,H),0.0),70.0)*sp*0.035*smoothstep(0.0,0.15,nl);
        float noiteMix=1.0-smoothstep(-0.10,0.14,nl);
        vec3 col=d*(luz*1.05+0.010)+n*n*1.6*noiteMix+brilho;
        gl_FragColor=vec4(col,1.0);
        #include <colorspace_fragment>
      }`,
  });
  const terraMesh = new THREE.Mesh(geoTerra, matTerra);
  const geoNuvens = new THREE.SphereGeometry(1.007, perfil.seg[0], perfil.seg[1]);
  const matNuvens = new THREE.MeshStandardMaterial({ map: nuvens, transparent: true, opacity: 0.8, depthWrite: false, roughness: 1, metalness: 0 });
  const nuvensMesh = new THREE.Mesh(geoNuvens, matNuvens);
  const geoAtm = new THREE.SphereGeometry(1.028, perfil.seg[0], perfil.seg[1]);
  const matAtm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uSol: { value: SOL.clone() } },
    vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vP=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader: `uniform vec3 uSol; varying vec3 vN; varying vec3 vP;
      void main(){
        vec3 N=normalize(vN); vec3 Vw=normalize(cameraPosition-vP); vec3 L=normalize(uSol);
        float rim=pow(1.0-max(dot(N,Vw),0.0),3.2);
        float nl=dot(N,L);
        float sol=smoothstep(-0.22,0.5,nl);
        vec3 azul=vec3(0.16,0.36,0.85); vec3 quente=vec3(0.85,0.40,0.18);
        vec3 c=mix(quente,azul,smoothstep(-0.05,0.40,nl))*rim*sol*0.95;
        gl_FragColor=vec4(c,1.0);
        #include <colorspace_fragment>
      }`,
  });
  const atmMesh = new THREE.Mesh(geoAtm, matAtm);
  const grupoTerra = new THREE.Group();
  terraInclinada.add(terraMesh, nuvensMesh);
  grupoTerra.add(terraInclinada, atmMesh);
  espaco.add(grupoTerra);

  // Lua: textura LRO + relevo (bump), rotação sincronizada (mesma face para a Terra)
  const geoLua = new THREE.SphereGeometry(R_LUA, perfil.lua[0], perfil.lua[1]);
  const matLua = new THREE.MeshStandardMaterial({ map: luaCor, bumpMap: luaAlt, bumpScale: 2.2, roughness: 1, metalness: 0 });
  const luaMesh = new THREE.Mesh(geoLua, matLua);
  espaco.add(luaMesh);

  // Trajetórias (a partir da própria função física) e baricentro
  const caminho = (campo, n = 360) => {
    const p = []; for (let i = 0; i < n; i++) p.push(V(F.estadoTerraLua(i / n * Math.PI * 2, ESCALA_DIST)[campo]));
    return new THREE.BufferGeometry().setFromPoints(p);
  };
  const geoOrbLua = caminho('lua'), geoOrbTerra = caminho('terra', 90);
  const matLinha = new THREE.LineBasicMaterial({ color: 0xBDBBC0, transparent: true, opacity: 0 });
  const matLinhaTerra = new THREE.LineBasicMaterial({ color: 0xBDBBC0, transparent: true, opacity: 0 });
  const orbLua = new THREE.LineLoop(geoOrbLua, matLinha), orbTerra = new THREE.LineLoop(geoOrbTerra, matLinhaTerra);
  const geoBary = new THREE.SphereGeometry(0.04, 12, 8);
  const matBary = new THREE.MeshBasicMaterial({ color: ACENTO, transparent: true, opacity: 0 });
  const bary = new THREE.Mesh(geoBary, matBary);
  espaco.add(orbLua, orbTerra, bary);

  // Cena D: forças de atração (3ª lei: iguais e opostas). Comprimento fixo, NÃO em escala.
  function seta(cor, c = 1, e = 1) {                     // c = comprimento total, e = espessura (fator)
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0, depthWrite: false });
    const cp = 0.2 * e * c ** 0.5 * 0.9, hc = c - cp;
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * e, 0.02 * e, hc, 8), mat); haste.position.y = hc / 2;
    const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.075 * e, cp, 14), mat); ponta.position.y = hc + cp / 2;
    g.add(haste, ponta); g.userData.mat = mat; return g;
  }
  const setaT = seta(ACENTO, 2.1), setaL = seta(ACENTO, 2.1);
  espaco.add(setaT, setaL);

  // =====================================================================
  // CENA LOCAL (maçã) · 1 unidade = 1 m
  // =====================================================================
  const local = new THREE.Scene();
  local.fog = new THREE.Fog(0x303b57, 3, 48);
  const solLocal = new THREE.Vector3(-0.85, 0.32, 0.45).normalize();
  const luzLocal = new THREE.DirectionalLight(0xffe6cc, Math.PI * 1.7); luzLocal.position.copy(solLocal).multiplyScalar(20);
  local.add(luzLocal, new THREE.HemisphereLight(0x3a4c82, 0x141a10, 1.6));

  const matCeu = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { uSol: { value: solLocal.clone() } },
    vertexShader: 'varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `uniform vec3 uSol; varying vec3 vD;
      void main(){
        float h=clamp(vD.y,0.0,1.0);
        vec3 zen=vec3(0.004,0.006,0.016); vec3 hor=vec3(0.030,0.045,0.095);
        vec3 c=mix(hor,zen,pow(h,0.45));
        float s=pow(max(dot(normalize(vD),normalize(uSol)),0.0),10.0);
        c+=vec3(0.16,0.09,0.05)*s*exp(-h*5.0);
        gl_FragColor=vec4(c,1.0);
        #include <colorspace_fragment>
      }`,
  });
  const geoCeu = new THREE.SphereGeometry(500, 24, 16);
  const ceu = new THREE.Mesh(geoCeu, matCeu); local.add(ceu);
  const estrelasLoc = new THREE.Points(geoEstrelas, matEstrelas); estrelasLoc.frustumCulled = false; local.add(estrelasLoc);

  // chão: plano tangente local (erro de curvatura em 3 m: 3²/(2·R_T) ≈ 0,7 µm) com granulação
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  { const x = cv.getContext('2d'), r = rng(7); x.fillStyle = '#1b2318'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { const v = 22 + r() * 30; x.fillStyle = `rgb(${v * 0.75},${v * 1.1},${v * 0.55})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); } }
  const texChao = new THREE.CanvasTexture(cv); texChao.colorSpace = THREE.SRGBColorSpace; texChao.wrapS = texChao.wrapT = THREE.RepeatWrapping; texChao.repeat.set(70, 70);
  texChao.anisotropy = perfil.aniso;
  const geoChao = new THREE.PlaneGeometry(600, 600); geoChao.rotateX(-Math.PI / 2);
  const matChao = new THREE.MeshStandardMaterial({ map: texChao, roughness: 1, metalness: 0 });
  const chao = new THREE.Mesh(geoChao, matChao); local.add(chao);

  // relva instanciada ao redor
  const geoLamina = new THREE.ConeGeometry(0.0028, 0.085, 3); geoLamina.translate(0, 0.0425, 0);
  const matRelva = new THREE.MeshStandardMaterial({ color: 0x2f4a22, roughness: 0.9 });
  const relva = new THREE.InstancedMesh(geoLamina, matRelva, perfil.relva);
  { const r = rng(99), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3();
    for (let i = 0; i < perfil.relva; i++) {
      const a = r() * Math.PI * 2, d = 0.1 + Math.pow(r(), 0.5) * 2.6;
      e.set((r() - 0.5) * 0.4, r() * 6.28, (r() - 0.5) * 0.4); q.setFromEuler(e); s.setScalar(0.6 + r() * 0.9);
      m.compose(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d - 0.2), q, s); relva.setMatrixAt(i, m);
    } relva.instanceMatrix.needsUpdate = true; }
  local.add(relva);

  // galho com folhas
  const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(-1.7, 1.55, -0.3), new THREE.Vector3(-0.9, 1.33, -0.1), new THREE.Vector3(-0.2, 1.2, 0), new THREE.Vector3(0.35, 1.19, 0.04), new THREE.Vector3(0.9, 1.26, -0.05)]);
  const geoGalho = new THREE.TubeGeometry(curva, 40, 0.013, 8, false);
  const matGalho = new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 0.95 });
  const galho = new THREE.Mesh(geoGalho, matGalho); local.add(galho);
  const forma = new THREE.Shape(); forma.moveTo(0, 0); forma.bezierCurveTo(0.35, 0.18, 0.9, 0.12, 1, 0); forma.bezierCurveTo(0.9, -0.12, 0.35, -0.18, 0, 0);
  const geoFolha = new THREE.ShapeGeometry(forma, 8); geoFolha.scale(0.085, 0.085, 0.085);
  const matFolha = new THREE.MeshStandardMaterial({ color: 0x3e6b2a, roughness: 0.55, side: THREE.DoubleSide });
  const folhas = new THREE.InstancedMesh(geoFolha, matFolha, 22);
  { const r = rng(5), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < 22; i++) {
      const t = 0.08 + r() * 0.9, p = curva.getPoint(t);
      e.set(r() * 6.28, (r() - 0.5) * 3.0 + (i % 2 ? 0.9 : -0.9), (r() - 0.2) * 1.2); q.setFromEuler(e);
      m.compose(p, q, new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + r() * 0.7)); folhas.setMatrixAt(i, m);
    } folhas.instanceMatrix.needsUpdate = true; }
  local.add(folhas);

  // maçã (LatheGeometry com covas, cor por vértice)
  const perfilMaca = []; for (let i = 0; i <= 48; i++) {
    const a = Math.PI - i / 48 * Math.PI;                       // do fundo (π) ao topo (0)
    let y = Math.cos(a) - 0.2 * Math.exp(-Math.pow(a / 0.33, 2)) + 0.12 * Math.exp(-Math.pow((Math.PI - a) / 0.38, 2));
    const x = Math.max(Math.sin(a) * (1 + 0.11 * Math.cos(a)), 0.0001);
    perfilMaca.push(new THREE.Vector2(x * R_MACA * 1.05, y * R_MACA * 0.93));
  }
  const geoMaca = new THREE.LatheGeometry(perfilMaca, 48);
  { const p = geoMaca.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color(), vermelho = new THREE.Color('#a8161f'), amarelo = new THREE.Color('#b9701e');
    for (let i = 0; i < p.count; i++) {
      const fi = Math.atan2(p.getZ(i), p.getX(i)), alt = p.getY(i) / R_MACA;
      const listra = 0.5 + 0.5 * Math.sin(fi * 9 + alt * 3.0) * Math.sin(fi * 4 - 1.3);
      const t = Math.min(1, Math.max(0, 0.12 + 0.35 * listra * 0.6 + Math.max(0, alt - 0.55) * 0.55));
      col.copy(vermelho).lerp(amarelo, t * 0.55); c.set([col.r, col.g, col.b], i * 3);
    } geoMaca.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
  const matMaca = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.4, side: THREE.DoubleSide });
  const maca = new THREE.Mesh(geoMaca, matMaca);
  const geoCabo = new THREE.CylinderGeometry(0.0022, 0.003, 0.105, 6); geoCabo.translate(0.007, 0.0525, 0);
  const cabo = new THREE.Mesh(geoCabo, matGalho); cabo.position.y = R_MACA * 0.93 * 0.8; cabo.rotation.z = -0.15; maca.add(cabo);
  const folhaDaMaca = new THREE.Mesh(geoFolha, matFolha); folhaDaMaca.scale.setScalar(0.5); folhaDaMaca.position.set(0.006, R_MACA * 0.93 * 0.85, 0); folhaDaMaca.rotation.set(0.5, 0.6, 0.35); maca.add(folhaDaMaca);
  local.add(maca);

  // sombra de contato (cresce e escurece com a aproximação do chão)
  const cs = document.createElement('canvas'); cs.width = cs.height = 64;
  { const x = cs.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
  const texSombra = new THREE.CanvasTexture(cs);
  const geoSombra = new THREE.CircleGeometry(1, 24); geoSombra.rotateX(-Math.PI / 2);
  const matSombra = new THREE.MeshBasicMaterial({ map: texSombra, transparent: true, depthWrite: false, opacity: 0.4 });
  const sombra = new THREE.Mesh(geoSombra, matSombra); sombra.position.y = 0.002; local.add(sombra);

  // vetor g: direção e sentido (para o centro da Terra); comprimento fixo, apenas indicativo
  const setaG = seta(ACENTO, 0.22, 0.09); local.add(setaG);

  // =====================================================================
  // ESTADO, CÂMERA E LOOP
  // =====================================================================
  const queda = { s: F.novaQueda(ALTURA_QUEDA), solta: false };
  let tLocal = 0;
  let tCin = 0, ultimo = null, rodando = false, rafId = 0;
  let pAlvo = 0, pSuave = 0, visivel = true;
  const ponteiro = { x: 0, y: 0, sx: 0, sy: 0 };
  const dts = []; let quadros = 0;
  const estado = { p: 0, veu: 0, cena: 'A', leitura: '', ativa: 'espaco' };
  const TH0 = -Math.PI / 2;

  // keyframes da câmera espacial: { p, ref, off, olhar, fov, rel }
  const KF = [
    { p: 0.00, ref: 'terra', off: [0.0, 0.35, 4.7], olhar: [0, 0, 0], fov: 32 },
    { p: 0.14, ref: 'terra', off: [0.5, 0.25, 3.75], olhar: [0, 0, 0], fov: 32 },
    { p: 0.25, ref: 'terra', off: [0.5, 0.25, 3.75], olhar: [0, 0, 0], fov: 32 },
    { p: 0.36, ref: 'lua', rel: true, off: [2.3, 0.28, 0.62], olhar: [0, 0, 0], fov: 30 },
    { p: 0.46, ref: 'bary', off: [4, 16, 44], olhar: [0, 0, 0], fov: 34 },
    { p: 0.54, ref: 'terra', off: [0.0, 0.5, 2.1], olhar: [0, 0, 0], fov: 32 },
    { p: 0.78, ref: 'terra', off: [0.0, 0.5, 2.1], olhar: [0, 0, 0], fov: 32 },
    { p: 0.90, ref: 'bary', off: [-4, 9, 42], olhar: [0, 0, 0], fov: 34 },
    { p: 1.00, ref: 'bary', off: [-3, 7, 38], olhar: [0, 0, 0], fov: 34 },
  ];
  const kTemp = { pos: new THREE.Vector3(), olhar: new THREE.Vector3() };
  let posTerra = new THREE.Vector3(), posLua = new THREE.Vector3();
  function resolve(kf, out, kEnc) {
    const ref = kf.ref === 'terra' ? posTerra : kf.ref === 'lua' ? posLua : new THREE.Vector3();
    let off = V(kf.off);
    if (kf.rel) {                                     // eixos: radial (Terra→Lua), cima e direita
      const rad = posLua.clone().sub(posTerra).normalize(), cima = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3().crossVectors(cima, rad).normalize();
      off = rad.multiplyScalar(kf.off[0]).add(cima.clone().multiplyScalar(kf.off[1])).add(dir.multiplyScalar(kf.off[2]));
    } else off.multiplyScalar(kEnc);
    out.pos.copy(ref).add(off); out.olhar.copy(kf.rel ? posLua : ref).add(V(kf.olhar));
  }
  function cameraEspacial(p, aspecto) {
    // enquadramento: telas estreitas afastam a câmera para caber a Terra e a órbita
    const kEnc = Math.min(3.0, Math.max(1, (perfil.nome === 'celular' ? 1.5 : 1.15) / aspecto));
    let i = 0; while (i < KF.length - 2 && p > KF[i + 1].p) i++;
    const a = KF[i], b = KF[i + 1], t = sstep(0, 1, (p - a.p) / (b.p - a.p));
    const A = { pos: new THREE.Vector3(), olhar: new THREE.Vector3() }, B = { pos: new THREE.Vector3(), olhar: new THREE.Vector3() };
    resolve(a, A, kEnc); resolve(b, B, kEnc);
    camera.position.lerpVectors(A.pos, B.pos, t);
    const alvo = new THREE.Vector3().lerpVectors(A.olhar, B.olhar, t);
    const fovExtra = aspecto < 1 && (a.ref === 'bary' || b.ref === 'bary') ? 1.35 : 1;   // telas estreitas: lente mais aberta nas tomadas amplas
    camera.fov = lerp(a.fov, b.fov, t) * (aspecto < 1 ? lerp(1, fovExtra, sstep(0.3, 0.5, p) * (p < 0.54 ? 1 : 0) + sstep(0.78, 0.9, p)) : 1);
    return alvo;
  }

  function aplicaPerspectiva(alvo, forca) {
    // interação leve: gira a posição da câmera em torno do alvo (±~2,5°)
    const off = camera.position.clone().sub(alvo);
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), -ponteiro.sx * 0.045 * forca);
    const dir = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), off).normalize();
    off.applyAxisAngle(dir, ponteiro.sy * 0.03 * forca);
    camera.position.copy(alvo).add(off);
  }

  function enquadramento(p) {
    // deslocamento do assunto para liberar o texto: lateral no desktop, para cima no retrato
    const f = 1 - sstep(0.10, 0.30, p), w = largura, h = altura;
    if (perfil.retrato || largura / altura < 0.95) camera.setViewOffset(w, h, 0, h * (perfil.nome === 'celular' ? 0.31 : 0.22) * f, w, h);
    else if (f > 0.001) camera.setViewOffset(w, h, -w * (perfil.nome === 'desktop' ? 0.19 : 0.10) * f, 0, w, h);
    else camera.clearViewOffset();
  }

  function fmt(n, d = 2) { return n.toFixed(d).replace('.', ','); }

  function quadro(agora) {
    rafId = 0;
    if (!rodando) return;
    const dtBruto = ultimo === null ? 0 : (agora - ultimo) / 1000; ultimo = agora;
    const dtReal = Math.min(0.05, dtBruto);                      // a simulação nunca avança mais de 50 ms por quadro
    if (o.animar) tCin += dtReal;
    pSuave += (pAlvo - pSuave) * (o.animar ? 1 - Math.exp(-dtReal * 7) : 1);
    const p = pSuave;
    ponteiro.sx += (ponteiro.x - ponteiro.sx) * (1 - Math.exp(-dtReal * 4)); ponteiro.sy += (ponteiro.y - ponteiro.sy) * (1 - Math.exp(-dtReal * 4));

    // --- dinâmica física (independe da câmera) ---
    const theta = TH0 + 2 * Math.PI * tCin / PER_ORB;
    const est = F.estadoTerraLua(theta, ESCALA_DIST);
    posTerra.set(...est.terra); posLua.set(...est.lua);
    grupoTerra.position.copy(posTerra);
    terraMesh.rotation.y = -Math.PI / 6 + 2 * Math.PI * tCin / PER_ROT;     // leste (anti-horário visto do polo norte)
    nuvensMesh.rotation.y = terraMesh.rotation.y * 1.04;                    // camada ligeiramente mais veloz: só aparência
    luaMesh.position.copy(posLua);
    luaMesh.rotation.y = F.anguloRotacaoLua(theta);                          // face voltada para a Terra

    // --- cinema: qual cena, véu, legenda ---
    const noLocal = p >= 0.5575 && p < 0.7775;
    const veu = Math.max(sstep(0.515, 0.555, p) * (1 - sstep(0.56, 0.60, p)), sstep(0.735, 0.775, p) * (1 - sstep(0.78, 0.82, p)));
    estado.p = p; estado.veu = veu; estado.ativa = noLocal ? 'local' : 'espaco';
    estado.cena = p < 0.27 ? 'A' : p < 0.55 ? 'B' : p < 0.7775 ? 'C' : 'D';

    const aspecto = largura / altura;
    if (!noLocal) {
      if (tLocal > 0 || queda.solta) { tLocal = 0; queda.s = F.novaQueda(ALTURA_QUEDA); queda.solta = false; }   // saiu da cena C: rearma a queda
      const alvo = cameraEspacial(p, aspecto);
      aplicaPerspectiva(alvo, 1);
      camera.lookAt(alvo); camera.updateProjectionMatrix();
      // visibilidade de elementos didáticos
      const tB = sstep(0.24, 0.30, p) * (1 - sstep(0.54, 0.56, p)), tD = sstep(0.78, 0.84, p);
      const mostra = Math.max(tB, tD);
      luaMesh.visible = mostra > 0.002;
      matLinha.opacity = 0.30 * mostra; matLinhaTerra.opacity = 0.55 * mostra; matBary.opacity = 0.9 * mostra;
      orbLua.visible = orbTerra.visible = bary.visible = luaMesh.visible;
      // Cena D: setas de atração, iguais em módulo (3ª lei de Newton)
      const u = posLua.clone().sub(posTerra).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), u), q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), u.clone().negate());
      setaT.position.copy(posTerra).addScaledVector(u, 1.12); setaT.quaternion.copy(q);
      setaL.position.copy(posLua).addScaledVector(u, -(R_LUA + 0.12)); setaL.quaternion.copy(q2);
      const opS = 0.95 * sstep(0.84, 0.92, p); setaT.userData.mat.opacity = opS; setaL.userData.mat.opacity = opS;
      setaT.visible = setaL.visible = opS > 0.01;
      enquadramento(p);
      estado.leitura = estado.cena === 'D' ? `F = G·M·m/d² ≈ ${fmt(F.forcaGravitacional(F.M_TERRA, F.M_LUA, F.D_TERRA_LUA) / 1e20, 2)}·10²⁰ N em cada corpo` : '';
    } else {
      const q = (p - 0.5575) / 0.22;
      if (o.animar) {
        tLocal += dtReal;                                                  // a maçã se solta 1 s depois de a cena C aparecer
        if (!queda.solta && tLocal > 1.0) queda.solta = true;
        if (queda.solta && !queda.s.repouso) {                              // integra em passos fixos de 1 ms (física independe do fps)
          let acum = dtReal * CAMERA_LENTA, n = 0;
          while (acum > 0 && n++ < 200 && !queda.s.repouso) { const h = Math.min(acum, 0.001); F.passoQueda(queda.s, h); acum -= h; }
        }
      }
      const y = queda.s.pos[1];
      maca.position.set(queda.s.pos[0], y + R_MACA * 0.93, queda.s.pos[2]);
      sombra.scale.setScalar(0.07 + 0.06 * Math.min(1, y)); matSombra.opacity = 0.65 * (1 - 0.75 * Math.min(1, y));
      sombra.position.x = queda.s.pos[0];
      const caindo = queda.solta && !queda.s.repouso;
      setaG.visible = caindo; setaG.rotation.z = Math.PI;               // aponta para baixo = para o centro da Terra
      setaG.position.set(0.11, y + R_MACA * 0.93 + 0.11, 0); setaG.userData.mat.opacity = 0.95;
      const vv = Math.abs(queda.s.vel[1]);
      estado.leitura = queda.solta ? `t = ${fmt(queda.s.t)} s · v = ${fmt(vv, 1)} m/s · altura = ${fmt(y)} m` : `a = ${fmt(F.G_LOCAL)} m/s² para o centro da Terra`;
      camera.position.set(lerp(0.26, 0.10, q), lerp(0.40, 0.32, q), lerp(1.8, 1.4, q) * Math.max(1, Math.min(1.5, 0.9 / aspecto)));
      const alvo = new THREE.Vector3(0, lerp(0.60, 0.34, q), 0);
      aplicaPerspectiva(alvo, 0.5);
      camera.fov = 42; camera.lookAt(alvo); camera.updateProjectionMatrix();
      if (aspecto < 0.95) camera.setViewOffset(largura, altura, 0, altura * 0.10, largura, altura); else camera.clearViewOffset();
    }

    renderer.render(noLocal ? local : espaco, camera);
    o.aoEstado(estado);

    // pixel ratio adaptativo: reduz se o quadro médio passa de ~26 ms
    if (dtBruto > 0 && dtBruto < 0.25) { dts.push(dtBruto); if (dts.length > 45) dts.shift(); }   // ignora travadas e abas em segundo plano
    if (++quadros % 60 === 0 && dts.length >= 40) {
      const med = dts.reduce((a, b) => a + b, 0) / dts.length;
      if (med > 0.026 && pr > 0.8) { pr = Math.max(0.75, pr - 0.2); renderer.setPixelRatio(pr); matEstrelas.uniforms.uPr.value = pr; renderer.setSize(largura, altura, false); dts.length = 0; }
    }
    if (o.animar && rodando && visivel && !document.hidden) rafId = requestAnimationFrame(quadro);
  }

  function inicia() {
    if (rodando || !o.animar) return;
    rodando = true; ultimo = null; rafId = requestAnimationFrame(quadro);
  }
  function para() { rodando = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; }
  const onVis = () => { if (document.hidden) para(); else if (visivel) inicia(); };
  document.addEventListener('visibilitychange', onVis);

  const onPerdido = e => { e.preventDefault(); para(); o.aoPerderContexto(); };
  const onRestaurado = () => { o.aoRestaurarContexto(); if (visivel) inicia(); };
  canvas.addEventListener('webglcontextlost', onPerdido);
  canvas.addEventListener('webglcontextrestored', onRestaurado);

  function redimensiona(w, h) {
    largura = Math.max(1, w); altura = Math.max(1, h);
    perfil = Object.assign(perfil, { retrato: altura > largura });
    camera.aspect = largura / altura; renderer.setSize(largura, altura, false);
    if (!o.animar) { rodando = true; quadro(performance.now()); rodando = false; }
  }

  const api = {
    perfil: () => perfil,
    definirProgresso(p) { pAlvo = Math.min(1, Math.max(0, p)); if (!o.animar) { pSuave = pAlvo; rodando = true; quadro(performance.now()); rodando = false; } },
    definirPonteiro(x, y) { ponteiro.x = x; ponteiro.y = y; },
    definirVisivel(v) { visivel = v; if (v && !document.hidden) inicia(); else para(); },
    redimensiona, inicia, para,
    renderizarUmQuadro() { const r = rodando; rodando = true; quadro(performance.now()); rodando = r; },
    /** Estado físico atual, para testes e depuração. */
    diagnostico() { return { tCin, pSuave, ativa: estado.ativa, queda: { ...queda.s, solta: queda.solta }, pr, info: { ...renderer.info.render }, memoria: { ...renderer.info.memory } }; },
    destruir() {
      para(); document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onPerdido); canvas.removeEventListener('webglcontextrestored', onRestaurado);
      [espaco, local].forEach(s => s.traverse(n => { if (n.geometry) n.geometry.dispose(); if (n.material) [].concat(n.material).forEach(m => m.dispose()); }));
      [geoEstrelas, matEstrelas, texChao, texSombra, ...texturas].forEach(x => x.dispose());
      const restante = { ...renderer.info.memory };            // após liberar geometrias e texturas
      renderer.dispose(); renderer.forceContextLoss();
      return restante;                                          // esperado: { geometries: 0, textures: 0 }
    },
  };
  api.renderizarUmQuadro();
  if (o.animar) inicia();
  return api;
}
