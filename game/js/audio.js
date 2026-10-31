/*
 * A Jornada até Einstein — efeitos sonoros sintetizados com WebAudio.
 * Nenhum arquivo de áudio: tudo é gerado no navegador, e só toca se o som estiver ligado.
 */
(function (root) {
  'use strict';
  var ctx = null;
  var enabled = true;

  function ensure() {
    if (!enabled) return null;
    if (!ctx) {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended' && ctx.resume) { try { ctx.resume(); } catch (e) { /* ignora */ } }
    return ctx;
  }

  function tone(c, freq, start, dur, type, vol, slideTo) {
    var o = c.createOscillator();
    var g = c.createGain();
    var t0 = c.currentTime + start;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  var N = { C4: 261.6, D4: 293.7, E4: 329.6, G4: 392, A4: 440, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, C6: 1046.5, E6: 1318.5 };

  var SOUNDS = {
    click:   function (c) { tone(c, 720, 0, 0.06, 'triangle', 0.07); },
    select:  function (c) { tone(c, 520, 0, 0.05, 'triangle', 0.06); },
    step:    function (c) { tone(c, 330, 0, 0.09, 'square', 0.04, 520); },
    correct: function (c) { [N.C5, N.E5, N.G5, N.C6].forEach(function (f, i) { tone(c, f, i * 0.08, 0.2, 'triangle', 0.11); }); },
    wrong:   function (c) { tone(c, 330, 0, 0.18, 'sine', 0.1, 262); tone(c, 262, 0.17, 0.26, 'sine', 0.09, 220); },
    pista:   function (c) { [N.E5, N.A5, N.E6].forEach(function (f, i) { tone(c, f, i * 0.06, 0.16, 'sine', 0.07); }); },
    medal:   function (c) { [N.G4, N.C5, N.E5, N.G5].forEach(function (f, i) { tone(c, f, i * 0.12, 0.3, 'triangle', 0.12); }); tone(c, N.C6, 0.5, 0.6, 'sine', 0.1); },
    evolve:  function (c) { tone(c, 220, 0, 0.9, 'sawtooth', 0.05, 880); [N.C5, N.E5, N.G5, N.C6].forEach(function (f, i) { tone(c, f, 0.6 + i * 0.1, 0.4, 'triangle', 0.1); }); },
    achieve: function (c) { tone(c, N.A5, 0, 0.12, 'sine', 0.09); tone(c, N.E6, 0.1, 0.3, 'sine', 0.09); },
    victory: function (c) {
      var melody = [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6, N.E6];
      melody.forEach(function (f, i) { tone(c, f, i * 0.16, 0.34, 'triangle', 0.12); });
      tone(c, N.C4, 0, 1.4, 'sine', 0.08); tone(c, N.G4, 0.5, 1.6, 'sine', 0.06);
      tone(c, N.E6, 1.2, 1.2, 'sine', 0.1);
    }
  };

  root.JE = root.JE || {};
  root.JE.Audio = {
    setEnabled: function (v) { enabled = !!v; },
    isEnabled: function () { return enabled; },
    unlock: function () { ensure(); },
    play: function (name) {
      if (!enabled || !SOUNDS[name]) return;
      var c = ensure();
      if (!c) return;
      try { SOUNDS[name](c); } catch (e) { /* som é opcional */ }
    }
  };
})(typeof self !== 'undefined' ? self : this);
