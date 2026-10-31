/*
 * A Jornada até Einstein — trilha sonora de fundo, composta para o jogo e sintetizada com WebAudio.
 * "Rondó da Relatividade": forma A A B A em loop, a 112 batidas por minuto.
 *   A (sol maior): melodia cantável em estilo clássico, com baixo de Alberti, à maneira de Mozart.
 *   B (mi menor): arpejos em semicolcheias sobre nota pedal e baixo em oitavas, à maneira de Vivaldi.
 * Nenhum arquivo de áudio; a música só toca se estiver ligada e com a aba visível.
 */
(function (root) {
  'use strict';

  var BPM = 112, S16 = 60 / BPM / 4;         // duração de uma semicolcheia, em segundos
  var VOLUME = 0.55, DUCKED = 0;             // volume normal; durante as questões a música fica em silêncio

  /* ---------- notas ---------- */
  var SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(name) {
    var m = /^([A-G])(#|b)?(\d)$/.exec(name);
    var n = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
    return 440 * Math.pow(2, (n - 69) / 12);
  }
  // "B4:2 D5:2 G5:4" → [[nota, duração em semicolcheias], ...]; "r" é pausa
  function parse(line) {
    return line.trim().split(/\s+/).map(function (tok) { var p = tok.split(':'); return [p[0], parseInt(p[1] || '1', 10)]; });
  }
  // arpejo de Alberti (fundamental, quinta, terça, quinta) em colcheias, n vezes
  function alberti(chord, times) {
    var out = [];
    for (var i = 0; i < times; i++) out.push([chord[0], 2], [chord[2], 2], [chord[1], 2], [chord[2], 2]);
    return out;
  }
  function octaves(lo, hi, times) {
    var out = [];
    for (var i = 0; i < times; i++) out.push([lo, 2], [hi, 2]);
    return out;
  }

  /* ---------- a partitura ---------- */
  var G = ['G3', 'B3', 'D4'], D = ['D3', 'F#3', 'A3'], Cc = ['C3', 'E3', 'G3'], Am = ['A2', 'C3', 'E3'];

  var A_MEL = parse(
    'B4:2 D5:2 G5:4 F#5:2 G5:2 A5:4 ' +           // 1  G
    'B5:4 A5:2 G5:2 F#5:4 E5:2 F#5:2 ' +          // 2  D
    'G5:2 F#5:2 E5:2 D5:2 C5:4 E5:4 ' +           // 3  C
    'D5:6 C5:2 B4:4 r:4 ' +                        // 4  G
    'C5:2 E5:2 A5:4 G5:2 F#5:2 E5:4 ' +           // 5  Am
    'D5:2 F#5:2 A5:4 C6:4 B5:2 A5:2 ' +           // 6  D
    'G5:2 B5:2 D5:2 G5:2 F#5:4 A5:4 ' +           // 7  G  D
    'G5:8 D5:4 r:4');                              // 8  G
  var A_ACC = [].concat(alberti(G, 2), alberti(D, 2), alberti(Cc, 2), alberti(G, 2),
                        alberti(Am, 2), alberti(D, 2), alberti(G, 1), alberti(D, 1), alberti(G, 2));
  var A_BASS = parse('G2:16 D2:16 C2:16 G2:16 A2:16 D2:16 G2:8 D2:8 G2:16');

  var B_MEL = parse(
    'E5 B4 G4 B4 E5 B4 G4 B4 F#5 B4 G4 B4 G5 B4 G4 B4 ' +            // 1  Em (pedal em si)
    'A5 E5 C5 E5 A5 E5 C5 E5 B5 E5 C5 E5 C6 E5 C5 E5 ' +             // 2  Am
    'D6 A5 F#5 A5 D6 A5 F#5 A5 C6 A5 F#5 A5 B5 A5 F#5 A5 ' +         // 3  D
    'B5 G5 D5 G5 B5 G5 D5 G5 A5 G5 D5 G5 G5 D5 B4 D5 ' +             // 4  G
    'C6 G5 E5 G5 C6 G5 E5 G5 B5 G5 E5 G5 A5 G5 E5 G5 ' +             // 5  C
    'A5 F#5 D#5 F#5 A5 F#5 D#5 F#5 G5 E5 B4 E5 F#5 D#5 B4 D#5 ' +    // 6  B7  Em  B7
    'E5 G5 B5 E6 B5 G5 E5 G5 D#5 F#5 A5 B5 A5 F#5 D#5 F#5 ' +        // 7  Em  B7
    'E5:4 B4:4 E4:8');                                                // 8  Em
  var B_BASS = [].concat(octaves('E2', 'E3', 4), octaves('A2', 'A3', 4), octaves('D2', 'D3', 4), octaves('G2', 'G3', 4),
                         octaves('C2', 'C3', 4), octaves('B1', 'B2', 4), octaves('E2', 'E3', 2), octaves('B1', 'B2', 2), parse('E2:16'));

  // monta a lista de eventos { at (semicolcheias), f, d, inst, v } de uma voz a partir de um início
  function voice(list, start, inst, vol, octShift) {
    var out = [], t = start;
    list.forEach(function (n) {
      if (n[0] !== 'r') out.push({ at: t, f: freq(n[0]) * Math.pow(2, octShift || 0), d: n[1], inst: inst, v: vol });
      t += n[1];
    });
    return out;
  }
  var BAR = 16, SECTION = 8 * BAR, EVENTS = [], LOOP = 4 * SECTION;
  [0, 1, 3].forEach(function (k) { // seções A (a segunda vez com a melodia dobrada uma oitava abaixo)
    var s = k * SECTION;
    EVENTS = EVENTS.concat(voice(A_MEL, s, 'pluck', 0.16), voice(A_ACC, s, 'soft', 0.06), voice(A_BASS, s, 'bass', 0.09));
    if (k === 1) EVENTS = EVENTS.concat(voice(A_MEL, s, 'soft', 0.05, -1));
  });
  EVENTS = EVENTS.concat(voice(B_MEL, 2 * SECTION, 'pluck', 0.11), voice(B_BASS, 2 * SECTION, 'bass', 0.08));
  EVENTS.sort(function (a, b) { return a.at - b.at; });

  /* ---------- síntese ---------- */
  var ctx = null, out = null, enabled = true, playing = false, ducked = false;
  var timer = null, idx = 0, loopStart = 0;

  function setup() {
    if (ctx) return ctx;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    out = ctx.createGain(); out.gain.value = 0.0001;
    var warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 3200;
    // um pouco de ambiência: eco curto e discreto, como numa sala de concerto pequena
    var delay = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = 0.23; fb.gain.value = 0.28; wet.gain.value = 0.18;
    out.connect(warm); warm.connect(ctx.destination);
    warm.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    return ctx;
  }

  function note(ev, t) {
    var dur = ev.d * S16, o1 = ctx.createOscillator(), g = ctx.createGain(), o2 = null;
    if (ev.inst === 'pluck') {         // timbre de cravo: corpo triangular com um pouco de brilho quadrado
      o1.type = 'triangle'; o2 = ctx.createOscillator(); o2.type = 'square';
      var g2 = ctx.createGain(); g2.gain.value = 0.18; o2.frequency.value = ev.f; o2.connect(g2); g2.connect(g);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(ev.v, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(Math.max(dur * 1.6, 0.25), 1.2));
    } else if (ev.inst === 'bass') {   // baixo redondo, que sustenta a nota
      o1.type = 'triangle';
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(ev.v, t + 0.02);
      g.gain.setValueAtTime(ev.v, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.98);
    } else {                           // acompanhamento suave
      o1.type = 'sine';
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(ev.v, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur * 1.2, 0.2));
    }
    o1.frequency.value = ev.f; o1.connect(g); g.connect(out);
    var end = t + Math.max(dur * 1.7, 1.3);
    o1.start(t); o1.stop(end);
    if (o2) { o2.start(t); o2.stop(end); }
  }

  // agenda as notas dos próximos 0,25 s; roda a cada 50 ms
  function schedule() {
    var horizon = ctx.currentTime + 0.25;
    while (true) {
      var ev = EVENTS[idx], t = loopStart + ev.at * S16;
      if (t > horizon) break;
      if (t >= ctx.currentTime - 0.02) note(ev, t);
      idx++;
      if (idx >= EVENTS.length) { idx = 0; loopStart += LOOP * S16; }
    }
  }

  function fadeTo(v, secs) {
    var now = ctx.currentTime;
    out.gain.cancelScheduledValues(now);
    out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), now);
    out.gain.exponentialRampToValueAtTime(Math.max(v, 0.0001), now + secs);
  }

  root.JE = root.JE || {};
  root.JE.Music = {
    setEnabled: function (v) { enabled = !!v; if (!enabled) this.stop(); },
    isEnabled: function () { return enabled; },
    isPlaying: function () { return playing; },
    start: function () {
      if (!enabled || playing || !setup()) return;
      if (ctx.state === 'suspended' && ctx.resume) { try { ctx.resume(); } catch (e) { /* ignora */ } }
      playing = true; idx = 0; loopStart = ctx.currentTime + 0.1;
      fadeTo(ducked ? DUCKED : VOLUME, 1.5);
      timer = setInterval(schedule, 50); schedule();
    },
    stop: function () {
      if (!playing) return;
      playing = false;
      fadeTo(0.0001, 0.6);
      var t = timer; setTimeout(function () { clearInterval(t); }, 650);
      timer = null;
    },
    // silencia a música enquanto a questão está na tela; ao fechar, ela volta aos poucos
    duck: function (on) {
      ducked = !!on;
      if (playing) fadeTo(ducked ? DUCKED : VOLUME, 0.5);
    },
    // aba escondida: pausa o relógio do áudio; ao voltar, continua de onde parou
    pause: function () { if (ctx && playing && ctx.suspend) { try { ctx.suspend(); } catch (e) { /* ignora */ } } },
    resume: function () { if (ctx && playing && ctx.resume) { try { ctx.resume(); } catch (e) { /* ignora */ } } }
  };
})(typeof self !== 'undefined' ? self : this);
