/*
 * A Jornada até Einstein — efeitos visuais (partículas em canvas e equações flutuantes).
 * Respeita a preferência de "reduzir animações" do navegador.
 */
(function (root) {
  'use strict';
  var canvas = null, g = null, parts = [], raf = 0, W = 0, H = 0, dpr = 1;
  var mq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(mq && mq.matches); }

  function setup() {
    if (canvas) return true;
    canvas = document.getElementById('fx');
    if (!canvas) return false;
    g = canvas.getContext('2d');
    resize();
    root.addEventListener('resize', resize);
    return true;
  }
  function resize() {
    if (!canvas) return;
    dpr = Math.min(2, root.devicePixelRatio || 1);
    W = root.innerWidth; H = root.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var COLORS = ['#ffd24d', '#4fe0c8', '#6bb6ff', '#ff7a59', '#c4a1ff', '#ffffff'];

  function loop() {
    g.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.grav; p.x += p.vx; p.y += p.vy; p.vx *= p.drag; p.life -= 1;
      p.rot += p.vr;
      if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
      var a = Math.min(1, p.life / 24);
      g.save();
      g.globalAlpha = a;
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.fillStyle = p.color;
      if (p.shape === 'star') {
        g.beginPath();
        for (var k = 0; k < 8; k++) {
          var rr = k % 2 === 0 ? p.size : p.size * 0.42;
          var an = (Math.PI / 4) * k;
          g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
        }
        g.closePath(); g.fill();
      } else if (p.shape === 'circle') {
        g.beginPath(); g.arc(0, 0, p.size * 0.5, 0, Math.PI * 2); g.fill();
      } else {
        g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      g.restore();
    }
    if (parts.length) raf = root.requestAnimationFrame(loop);
    else { raf = 0; g.clearRect(0, 0, W, H); }
  }
  function kick() { if (!raf) raf = root.requestAnimationFrame(loop); }

  function add(o) {
    parts.push({
      x: o.x, y: o.y, vx: o.vx, vy: o.vy, grav: o.grav, drag: o.drag || 0.99,
      size: o.size, color: o.color, life: o.life, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, shape: o.shape
    });
  }

  var FX = {
    reduced: reduced,
    /** Explosão de partículas a partir de um ponto da tela. */
    burst: function (x, y, opts) {
      if (reduced() || !setup()) return;
      opts = opts || {};
      var n = opts.count || 36, colors = opts.colors || COLORS;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, s = (opts.speed || 6) * (0.4 + Math.random());
        add({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, grav: opts.gravity === undefined ? 0.16 : opts.gravity,
          size: 5 + Math.random() * 7, color: colors[i % colors.length], life: 50 + Math.random() * 40,
          shape: ['star', 'circle', 'rect'][i % 3] });
      }
      kick();
    },
    /** Chuva de confete por toda a tela. */
    confetti: function (count) {
      if (reduced() || !setup()) return;
      var n = count || 120;
      for (var i = 0; i < n; i++) {
        add({ x: Math.random() * W, y: -20 - Math.random() * H * 0.4, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3,
          grav: 0.03, drag: 0.995, size: 6 + Math.random() * 8, color: COLORS[i % COLORS.length], life: 220 + Math.random() * 120,
          shape: i % 4 === 0 ? 'star' : 'rect' });
      }
      kick();
    },
    /** Equações que sobem flutuando dentro de um contêiner (vitória). */
    equations: function (container, count) {
      if (!container) return;
      var eqs = ['E = mc²', 'F = m·a', 'E = h·f', 'v = λ·f', 'U = R·i', 'ΔS = v·Δt', 'p = m·v', 'Q = m·c·ΔT', 'E_c = ½mv²', 'ΔE·Δt ≥ ħ/2', 'G·M·m/r²', 'c = 3×10⁸ m/s'];
      var n = count || 18;
      for (var i = 0; i < n; i++) {
        var el = document.createElement('span');
        el.className = 'eq-float';
        el.textContent = eqs[i % eqs.length];
        el.style.left = (4 + Math.random() * 90) + '%';
        el.style.fontSize = (14 + Math.random() * 22) + 'px';
        el.style.animationDelay = (Math.random() * 3.5) + 's';
        el.style.animationDuration = (5 + Math.random() * 5) + 's';
        container.appendChild(el);
      }
    },
    /** Centro de um elemento, para direcionar partículas. */
    centerOf: function (el) {
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
  };

  root.JE = root.JE || {};
  root.JE.FX = FX;
})(typeof self !== 'undefined' ? self : this);
