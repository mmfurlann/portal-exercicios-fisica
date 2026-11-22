"""
A Tal da Física — "Decomposição vetorial"
Clipe didático de 8 s, 1920×1080, 30 fps, sem áudio.

Manim Community (renderer Cairo). Sem LaTeX: todos os rótulos usam Text,
com subscritos posicionados à parte.

Render (a partir desta pasta):
    manim -ql decomposicao_vetorial.py DecomposicaoVetorial   # prévia
    manim -qh decomposicao_vetorial.py DecomposicaoVetorial   # final 1080p30
"""

import numpy as np
from manim import *

# ---------------------------------------------------------------- paleta ---
BG = "#0A1424"        # azul-meia-noite
GRID = "#3A5070"
GLOW = "#2C4466"
AXIS = "#8C99A8"
LABEL = "#C3CBD4"
IVORY = "#F4ECD6"     # vetor R
AMBER = "#F0A43A"     # componente Rx
CYAN = "#4CC3D6"      # componente Ry
GUIDE = "#AEB8C4"

FONT = "Avenir Next"

# ------------------------------------------------------------- geometria ---
U = 1.30                                   # unidades de cena por unidade (x e y)
ORIGIN_SCENE = np.array([-0.20, -2.75, 0])  # onde fica O; terço esquerdo livre
RX, RY = 3.0, 4.0                          # R = (3, 4)
THETA = np.arctan2(RY, RX)                 # 53,13°

config.background_color = BG


def label(text, size=40, color=LABEL, **kw):
    return Text(text, font=FONT, font_size=size, color=color, **kw)


def sub_label(main, sub, color, size=46):
    """Rótulo com subscrito posicionado à parte (sem LaTeX)."""
    m = label(main, size=size, color=color, weight=MEDIUM)
    s = label(sub, size=size * 0.62, color=color, weight=MEDIUM)
    s.next_to(m, RIGHT, buff=0.04).align_to(m, DOWN).shift(DOWN * 0.13)
    return VGroup(m, s)


class DecomposicaoVetorial(Scene):
    def construct(self):
        # ------------------------------------------------ sistema de eixos --
        ax = Axes(
            x_range=[-0.75, 4.55, 1],
            y_range=[-0.75, 4.65, 1],
            x_length=5.30 * U,
            y_length=5.40 * U,
            tips=True,
            axis_config={
                "color": AXIS,
                "stroke_width": 3,
                "include_ticks": False,
                "tip_width": 0.20,
                "tip_height": 0.24,
            },
        )
        ax.shift(ORIGIN_SCENE - ax.c2p(0, 0))
        P = ax.c2p  # todo ponto sai daqui

        # --------------------------------------- luz suave (fundo estático) --
        center = P(1.6, 2.0)
        glow = VGroup(*[
            Circle(radius=r, stroke_width=0)
            .set_fill(GLOW, opacity=0.035)
            .move_to(center)
            for r in np.linspace(0.6, 7.5, 26)
        ])

        # --------------------------- grade cartesiana (mesmo sistema P) --
        fw, fh = config.frame_width / 2, config.frame_height / 2
        x_min = int(np.floor((-fw - ORIGIN_SCENE[0]) / U)) - 1
        x_max = int(np.ceil((fw - ORIGIN_SCENE[0]) / U)) + 1
        y_min = int(np.floor((-fh - ORIGIN_SCENE[1]) / U)) - 1
        y_max = int(np.ceil((fh - ORIGIN_SCENE[1]) / U)) + 1
        grid = VGroup()
        for i in range(x_min, x_max + 1):
            grid.add(Line(P(i, y_min), P(i, y_max)))
        for j in range(y_min, y_max + 1):
            grid.add(Line(P(x_min, j), P(x_max, j)))
        grid.set_stroke(GRID, width=1.5, opacity=0.50)

        # escurece o terço esquerdo (espaço para o título na edição)
        veil = Rectangle(width=6.6, height=config.frame_height + 0.2, stroke_width=0)
        veil.align_to(np.array([-fw - 0.05, 0, 0]), LEFT)
        veil.set_fill(BG, opacity=1)
        veil.set_sheen_direction(RIGHT)
        bg = color_to_rgb(BG)
        veil.fill_rgbas = np.array([[*bg, 0.80], [*bg, 0.55], [*bg, 0.0]])

        self.add(glow, grid, veil)

        # ------------------------------------------------------- vetores --
        O = P(0, 0)
        arrow_kw = dict(buff=0, tip_length=0.34, max_tip_length_to_length_ratio=0.2,
                        max_stroke_width_to_length_ratio=10)
        vec_R = Arrow(O, P(RX, RY), color=IVORY, stroke_width=8, **arrow_kw)
        vec_Rx = Arrow(O, P(RX, 0), color=AMBER, stroke_width=8, **arrow_kw)
        vec_Ry = Arrow(O, P(0, RY), color=CYAN, stroke_width=8, **arrow_kw)

        guide_v = DashedLine(P(RX, RY), P(RX, 0), color=GUIDE, stroke_width=2.6,
                             dash_length=0.12, dashed_ratio=0.55).set_opacity(0.75)
        guide_h = DashedLine(P(RX, RY), P(0, RY), color=GUIDE, stroke_width=2.6,
                             dash_length=0.12, dashed_ratio=0.55).set_opacity(0.75)

        arc = Arc(radius=0.78 * U, start_angle=0, angle=THETA,
                  arc_center=O, color=LABEL, stroke_width=3.2)

        # -------------------------------------------------------- rótulos --
        lbl_x = label("x", 44).move_to(P(4.62, -0.32))
        lbl_y = label("y", 44).move_to(P(-0.34, 4.62))
        lbl_O = label("O", 40).move_to(P(-0.30, -0.30))

        # R: deslocado perpendicularmente ao vetor, para cima/esquerda
        normal = np.array([-RY, RX]) / np.hypot(RX, RY)
        lbl_R = label("R", 52, IVORY, weight=MEDIUM).move_to(
            P(*(np.array([RX, RY]) * 0.5 + normal * 0.42)))
        lbl_Rx = sub_label("R", "x", AMBER).move_to(P(RX / 2, -0.42))
        lbl_Ry = sub_label("R", "y", CYAN).move_to(P(-0.52, RY / 2))
        lbl_3 = label("3", 40).move_to(P(RX, -0.42))
        lbl_4 = label("4", 40).move_to(P(-0.34, RY))

        bis = THETA / 2
        lbl_th = label("θ", 44, LABEL, slant=ITALIC).move_to(
            P(1.12 * np.cos(bis), 1.12 * np.sin(bis)))

        # ------------------------------------------------------ animação --
        # 0.0–2.0 s
        self.play(Create(ax, lag_ratio=0.1), FadeIn(lbl_x, lbl_y, lbl_O),
                  run_time=0.7)
        self.play(GrowArrow(vec_R), run_time=0.9, rate_func=smooth)
        self.play(FadeIn(lbl_R, shift=0.1 * UP), run_time=0.4)
        # 2.0–4.0 s
        self.play(Create(guide_v), Create(guide_h), run_time=1.5)
        self.wait(0.5)
        # 4.0–6.0 s
        self.play(GrowArrow(vec_Rx), GrowArrow(vec_Ry), run_time=1.2)
        self.play(FadeIn(lbl_Rx, lbl_Ry, lbl_3, lbl_4), run_time=0.6)
        self.wait(0.2)
        # 6.0–7.0 s
        self.play(Create(arc), run_time=0.6)
        self.play(FadeIn(lbl_th), run_time=0.4)
        # 7.0–8.0 s
        self.wait(1.0)

        # expostos para verificação
        self.ax, self.vecs = ax, (vec_R, vec_Rx, vec_Ry)
        self.guides, self.arc = (guide_v, guide_h), arc
        self.labels = dict(x=lbl_x, y=lbl_y, O=lbl_O, R=lbl_R, Rx=lbl_Rx,
                           Ry=lbl_Ry, n3=lbl_3, n4=lbl_4, th=lbl_th)
