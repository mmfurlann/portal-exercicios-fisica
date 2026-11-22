"""
A Tal da Física — "Talha de Arquimedes: forças em termos de F"
Clipe didático, 1920×1080, 30 fps, sem áudio.

Talha exponencial com n = 2 polias móveis em série (cada uma presa ao teto por uma ponta
da própria corda; a outra ponta sustenta o eixo da polia seguinte). Mostra:
  • as forças em cada corda e em cada eixo, sempre em múltiplos de F (a força da mão);
  • a carga subindo h enquanto a polia 2 sobe 2h e a mão desce 2²·h = 4h de corda.

Conferência (polias ideais, cordas sem massa, equilíbrio quase estático):
  polia 2:  2·F  = 2F  (tensão da corda que sustenta o eixo da polia 2)
  polia 1:  2·2F = 4F = P
  trabalho: F · 4h = 4F · h = P · h

Manim Community (renderer Cairo). Sem LaTeX.
Render (a partir desta pasta):
    manim -ql polias_arquimedes.py PoliasArquimedes   # prévia
    manim -qh polias_arquimedes.py PoliasArquimedes   # final 1080p30
"""

import numpy as np
from manim import *

BG = "#0A1424"
GRID = "#3A5070"
AXIS = "#8C99A8"
LABEL = "#C3CBD4"
IVORY = "#F4ECD6"
AMBER = "#F0A43A"    # corda
CYAN = "#4CC3D6"     # forças de tensão e F
RED = "#E8604C"      # peso P
MINT = "#7EE0B0"     # alturas

FONT = "Avenir Next"
config.background_color = BG

# --------------------------------------------------------------- geometria --
r = 0.42                      # raio das polias
h = 0.45                      # subida da carga ao fim do puxão
k = 0.40                      # comprimento da seta de 1·F
x1 = -4.0                     # eixo da polia 1 (a de baixo, que sustenta a carga)
x2 = x1 + r                   # eixo da polia 2: a corda da polia 1 sobe na vertical até ele
xf = x2 + 2 * r               # polia fixa
xh = xf + r                   # corda da mão
yc, yf = 3.6, 2.75            # teto e centro da polia fixa
y1_0, y2_0, hand_0 = -0.8, 0.9, 1.6
BOX_W, BOX_H, BOX_GAP = 1.3, 0.6, 0.75


def label(text, size=32, color=LABEL, **kw):
    return Text(text, font=FONT, font_size=size, color=color, **kw)


def seta(p, q, color, w=7):
    return Arrow(p, q, buff=0, color=color, stroke_width=w, tip_length=0.2,
                 max_tip_length_to_length_ratio=0.45, max_stroke_width_to_length_ratio=12)


def pos(s):
    """posições em função do progresso s (0 → 1) do puxão"""
    return dict(y1=y1_0 + h * s, y2=y2_0 + 2 * h * s, hand=hand_0 - 4 * h * s)


class PoliasArquimedes(Scene):
    def construct(self):
        s = ValueTracker(0)
        P = lambda: pos(s.get_value())

        # ------------------------------------------------------ estáticos --
        teto = Line([x1 - 1.4, yc, 0], [xf + 1.0, yc, 0], color=IVORY, stroke_width=6)
        hachuras = VGroup(*[Line([x, yc, 0], [x - 0.22, yc + 0.22, 0], color=AXIS, stroke_width=2.5)
                            for x in np.arange(x1 - 1.3, xf + 1.0, 0.3)])
        haste = Line([xf, yc, 0], [xf, yf, 0], color=IVORY, stroke_width=5)
        fixa = VGroup(Circle(r, color=IVORY, stroke_width=5).set_fill(BG, 1).move_to([xf, yf, 0]),
                      Dot([xf, yf, 0], radius=0.07, color=CYAN))

        # ------------------------------------------------ cordas e polias --
        def cordas():
            p = P()
            g = VGroup()
            for xe, ye in ((x1 - r, p["y1"]), (x1, p["y2"])):           # teto → lado esquerdo
                g.add(Line([xe, yc, 0], [xe, ye, 0], color=AMBER, stroke_width=5))
            g.add(Arc(r, start_angle=PI, angle=PI, arc_center=[x1, p["y1"], 0], color=AMBER, stroke_width=5))
            g.add(Arc(r, start_angle=PI, angle=PI, arc_center=[x2, p["y2"], 0], color=AMBER, stroke_width=5))
            g.add(Line([x1 + r, p["y1"], 0], [x2, p["y2"], 0], color=AMBER, stroke_width=5))      # polia 1 → eixo 2
            g.add(Line([x2 + r, p["y2"], 0], [xf - r, yf, 0], color=AMBER, stroke_width=5))       # polia 2 → fixa
            g.add(Arc(r, start_angle=PI, angle=-PI, arc_center=[xf, yf, 0], color=AMBER, stroke_width=5))
            g.add(Line([xh, yf, 0], [xh, p["hand"], 0], color=AMBER, stroke_width=5))             # corda da mão
            g.add(Line([x1, p["y1"], 0], [x1, p["y1"] - BOX_GAP, 0], color=IVORY, stroke_width=5))  # carga
            return g

        def polias():
            p = P()
            g = VGroup()
            for xc, yc_ in ((x1, p["y1"]), (x2, p["y2"])):
                g.add(Circle(r, color=IVORY, stroke_width=5).set_fill(BG, 1).move_to([xc, yc_, 0]),
                      Dot([xc, yc_, 0], radius=0.07, color=AMBER))
            return g

        def carga():
            p = P()
            box = Rectangle(width=BOX_W, height=BOX_H, color=IVORY, stroke_width=4).set_fill("#16263F", 1)
            box.move_to([x1, p["y1"] - BOX_GAP - BOX_H / 2, 0])
            t = label("carga", 28, IVORY).move_to(box)
            return VGroup(box, t)

        def mao():
            p = P()
            return Dot([xh, p["hand"], 0], radius=0.11, color=CYAN)

        # ------------------------------------------------ vetores força --
        def forcas():
            p = P()
            g = VGroup()
            y1, y2, hy = p["y1"], p["y2"], p["hand"]
            lab = lambda t, c, at, d=RIGHT: label(t, 32, c, weight=MEDIUM).next_to(np.array([at[0], at[1], 0.0]), d, buff=0.08)
            # polia 1: duas cordas puxam para cima com 2F cada; o eixo suporta P = 4F
            for dx in (-r - 0.17, r + 0.17):
                g.add(seta([x1 + dx, y1, 0], [x1 + dx, y1 + 2 * k, 0], CYAN))
            g.add(lab("2F", CYAN, [x1 - r - 0.17, y1 + 2 * k], LEFT))
            g.add(lab("2F", CYAN, [x1 + r + 0.17, y1 + 2 * k - 0.05], RIGHT))
            # polia 2: duas cordas puxam para cima com F; a corda da polia 1 puxa o eixo para baixo com 2F
            for dx in (-r - 0.17, r + 0.17):
                g.add(seta([x2 + dx, y2, 0], [x2 + dx, y2 + k, 0], CYAN))
            g.add(lab("F", CYAN, [x2 - r - 0.17, y2 + k], LEFT))
            g.add(lab("F", CYAN, [x2 + r + 0.17, y2 + k - 0.05], RIGHT))
            g.add(seta([x2, y2, 0], [x2, y2 - 2 * k, 0], CYAN))
            g.add(lab("2F", CYAN, [x2 + 0.12, y2 - 2 * k + 0.12], RIGHT))
            # peso da carga: P = 4F
            yb = y1 - BOX_GAP - BOX_H
            g.add(seta([x1, yb, 0], [x1, yb - 4 * k, 0], RED))
            g.add(lab("P = 4F", RED, [x1 + 0.12, yb - 2 * k], RIGHT))
            # mão
            g.add(seta([xh + 0.22, hy, 0], [xh + 0.22, hy - k, 0], CYAN))
            g.add(lab("F", CYAN, [xh + 0.22, hy - k / 2], RIGHT))
            return g

        # ------------------------------------------ subida × descida (cotas) --
        def cota(x, y_ini, y_now, texto, cor):
            if abs(y_now - y_ini) < 0.03:
                return VGroup()
            ref = DashedLine([x - 0.35, y_ini, 0], [x + 0.35, y_ini, 0], color=cor, stroke_width=2.5,
                             dash_length=0.1, dashed_ratio=0.55)
            seta_ = DoubleArrow([x, y_ini, 0], [x, y_now, 0], buff=0, color=cor, stroke_width=5, tip_length=0.16,
                                max_tip_length_to_length_ratio=0.45)
            txt = label(texto, 32, cor, weight=MEDIUM).next_to(seta_, LEFT if x < xh else RIGHT, buff=0.12)
            return VGroup(ref, seta_, txt)

        def cotas():
            p = P()
            yb0 = y1_0 - BOX_GAP - BOX_H
            yb = p["y1"] - BOX_GAP - BOX_H
            return VGroup(cota(x1 - 2.1, yb0, yb, "h", MINT),
                          cota(x1 - 1.35, y2_0, p["y2"], "2h", MINT),
                          cota(xh + 1.0, hand_0, p["hand"], "4h", AMBER))

        grupos = [always_redraw(f) for f in (cordas, polias, carga, mao, forcas, cotas)]
        titulo = label("Talha de Arquimedes", 40, IVORY, weight=MEDIUM).move_to([0, 3.35, 0]).align_to(np.array([0.6, 0, 0]), LEFT)
        subt = label("2 polias móveis em série + 1 fixa", 26, AXIS).next_to(titulo, DOWN, aligned_edge=LEFT, buff=0.12)

        self.add(teto, hachuras, haste, fixa)
        self.play(FadeIn(titulo), FadeIn(subt), *[FadeIn(g) for g in grupos], run_time=0.9)

        # ------------------------------------------------ painel de contas --
        def linha(t, cor=LABEL, tam=30):
            return label(t, tam, cor)
        l1 = linha("Mão puxa a corda com F", CYAN)
        l2 = linha("Polia 2:  2 · F  =  2F", CYAN)
        l3 = linha("Polia 1:  2 · 2F  =  4F  =  P", RED)
        l4 = linha("Logo  F = P / 2²", IVORY, 36)
        painel = VGroup(l1, l2, l3, l4).arrange(DOWN, aligned_edge=LEFT, buff=0.30).move_to([0, 1.2, 0]).align_to(np.array([0.6, 0, 0]), LEFT)
        for ln in painel:
            self.play(FadeIn(ln, shift=RIGHT * 0.2), run_time=0.7)
        self.wait(0.8)

        # ----------------------------------------------------------- puxão --
        self.play(s.animate.set_value(1), run_time=4.2, rate_func=smooth)
        m1 = linha("Carga sobe  h", MINT)
        m2 = linha("Polia 2 sobe  2h", MINT)
        m3 = linha("Mão desce  4h  =  2² · h", AMBER)
        rel = VGroup(m1, m2, m3).arrange(DOWN, aligned_edge=LEFT, buff=0.26).move_to([0, -1.2, 0]).align_to(np.array([0.6, 0, 0]), LEFT)
        for ln in rel:
            self.play(FadeIn(ln, shift=RIGHT * 0.2), run_time=0.55)
        trab = linha("Trabalho:  F · 4h  =  4F · h  =  P · h", IVORY, 30).next_to(rel, DOWN, aligned_edge=LEFT, buff=0.4)
        self.play(FadeIn(trab, shift=UP * 0.15), run_time=0.7)
        self.wait(2.2)
