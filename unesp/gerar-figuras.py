#!/usr/bin/env python3
"""Gera as figuras de unesp.html (UNESP 2027, Física).

Uso:  python3 unesp/gerar-figuras.py "/caminho/VUNESP 2027.pdf"
Requer: pymupdf, matplotlib, numpy   (pip install pymupdf matplotlib numpy)
- Recortes do caderno (pág. 29 a 31) em 300 dpi: q76, q77, q78, q79, q80, q81 e q82.
- Figuras de resolução desenhadas em matplotlib: q76, q79 e q80.
"""
import os, sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, FancyArrowPatch

OUT = os.path.dirname(os.path.abspath(__file__))
INK, RED, BLUE, GREEN, GREY = "#16142a", "#c0392b", "#0e7490", "#4d7a12", "#8a8798"
plt.rcParams.update({"font.size": 11, "axes.edgecolor": INK, "text.color": INK,
                     "axes.labelcolor": INK, "xtick.color": INK, "ytick.color": INK})

def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("ok", name)

# ---------- recortes do PDF ----------
def recortes(pdf):
    import pymupdf
    d = pymupdf.open(pdf)
    k = 72 / 110  # as caixas abaixo foram medidas em imagens de 110 dpi
    def crop(pg, box, name):
        r = pymupdf.Rect(*[v * k for v in box])
        d[pg - 1].get_pixmap(dpi=300, clip=r).save(os.path.join(OUT, name))
        print("ok", name)
    crop(29, (50, 715, 442, 970), "q76-original.png")
    crop(29, (545, 185, 805, 430), "q77-original.png")
    crop(30, (100, 200, 395, 488), "q78-mapa.png")
    crop(30, (500, 165, 830, 375), "q79-grafico.png")
    crop(30, (480, 735, 830, 1010), "q80-esquema.png")
    crop(31, (45, 605, 450, 775), "q81-tabela-periodica.png")
    crop(31, (480, 160, 850, 345), "q82-circuitos.png")

# ---------- Q76: queda do pacote ----------
def q76():
    from matplotlib.patches import Ellipse
    g, h, vH, vL = 10, 320, 20, 5
    T = np.sqrt(2 * h / g)                       # 8 s
    xp, xl = vH * T, vL * T                      # 160 m e 40 m
    d = xp - xl                                  # 120 m
    fig, ax = plt.subplots(figsize=(9, 5.6))
    LIGHT = "#b9cfd8"

    def heli(x, y, c, a=1.0):
        ax.add_patch(Ellipse((x, y + 7), 34, 15, color=c, alpha=a, zorder=3))
        ax.plot([x - 15, x - 38], [y + 9, y + 15], color=c, alpha=a, lw=2.2, zorder=3)
        ax.plot([x - 22, x + 22], [y + 20, y + 20], color=c, alpha=a, lw=1.6, zorder=3)
        ax.plot([x, x], [y + 14, y + 20], color=c, alpha=a, lw=1.6, zorder=3)

    def boat(x, c, a=1.0):
        ax.add_patch(Polygon([[x - 16, 0], [x + 16, 0], [x + 10, -9], [x - 10, -9]], color=c, alpha=a, zorder=3))
        ax.add_patch(Polygon([[x - 7, 0], [x + 7, 0], [x + 4, 7], [x - 4, 7]], color=c, alpha=a, zorder=3))

    # água e solo
    ax.fill_between([-70, 260], -12, 0, color="#cfe8ee", zorder=0)
    ax.axhline(0, color=INK, lw=1.2, zorder=1)
    # guias verticais tracejadas até as cotas
    for x in (0, d, xp):
        ax.plot([x, x], [-12, -118 if x != 0 else -118], color=GREY, lw=0.9, ls=":", zorder=0)
    # helicóptero: início (t = 0) e fim (t = 8 s)
    heli(0, h, BLUE); heli(xp, h, LIGHT, 1)
    ax.text(0, h + 30, "helicóptero em $t=0$", color=BLUE, ha="center", fontsize=10)
    ax.text(xp, h + 36, "helicóptero em $t=8$ s", color="#7d97a3", ha="center", fontsize=10)
    ax.plot([0, xp], [h, h], color=GREY, lw=0.9, ls="--", zorder=1)
    ax.annotate("", xy=(52, h + 48), xytext=(8, h + 48), arrowprops=dict(arrowstyle="->", color=BLUE, lw=1.6))
    ax.text(30, h + 58, "$v_H=20$ m/s", color=BLUE, ha="center", fontsize=10)
    # trajetória do pacote
    t = np.linspace(0, T, 200)
    ax.plot(vH * t, h - 0.5 * g * t**2, color=BLUE, lw=2.4, zorder=2)
    ax.add_patch(Rectangle((-5, h - 5), 10, 10, color=RED, zorder=4))
    ax.plot([xp], [0], "o", color=RED, ms=6, zorder=5)
    # lancha
    boat(d, LIGHT); boat(xp, RED)
    ax.text(d - 20, 14, "lancha\nem $t=0$", color="#9aa8ae", ha="right", fontsize=9.5, va="bottom")
    ax.text(xp + 22, 14, "lancha\nem $t=8$ s", color=RED, ha="left", fontsize=9.5, va="bottom")
    ax.annotate("", xy=(xp + 62, 62), xytext=(xp + 22, 62), arrowprops=dict(arrowstyle="->", color=RED, lw=1.6))
    ax.text(xp + 42, 70, "$v_L=5$ m/s", color=RED, ha="center", fontsize=10)
    # altura h
    ax.annotate("", xy=(-45, h), xytext=(-45, 0), arrowprops=dict(arrowstyle="<->", color=INK, lw=1.2))
    ax.text(-52, h / 2, "$h=320$ m", rotation=90, ha="right", va="center", fontsize=11)
    ax.plot([-45, -6], [h, h], color=GREY, lw=0.9, ls="--")
    # cotas horizontais sob a água
    def cota(x0, x1, y, txt, c=INK, bold=False):
        ax.annotate("", xy=(x1, y), xytext=(x0, y), arrowprops=dict(arrowstyle="<->", color=c, lw=1.3))
        ax.text((x0 + x1) / 2, y - 6, txt, ha="center", va="top", fontsize=10.5, color=c, weight="bold" if bold else "normal")
    cota(0, xp, -34, "pacote: $v_H T=160$ m", BLUE)
    cota(d, xp, -70, "lancha: $v_L T=40$ m", RED)
    cota(0, d, -106, "$\\mathbf{d=160-40=120\\ m}$", INK)
    # tempo de queda
    ax.text(205, 215, "tempo de queda\n$T=\\sqrt{2h/g}=8$ s", fontsize=11.5, ha="center", va="center",
            bbox=dict(boxstyle="round,pad=0.45", fc="#fbf6ec", ec=GREY))
    ax.text(205, 150, "fora de escala", fontsize=8.5, color=GREY, style="italic", ha="center")
    ax.set_xlim(-75, 262); ax.set_ylim(-150, h + 85)
    ax.axis("off")
    save(fig, "q76-trajetoria.png")

# ---------- Q77: 2ª lei de Kepler ----------
def q77():
    a, e = 1.0, 0.6
    b = a * np.sqrt(1 - e**2)
    def pt(M):
        E = M
        for _ in range(60): E = E - (E - e * np.sin(E) - M) / (1 - e * np.cos(E))
        return a * np.cos(E) - a * e, b * np.sin(E)      # Sol na origem (foco)
    fig, ax = plt.subplots(figsize=(7.6, 4.4))
    th = np.linspace(0, 2 * np.pi, 400)
    ax.plot(a * np.cos(th) - a * e, b * np.sin(th), color=INK, lw=1.4)
    for M0, c, lab in ((0.0, BLUE, "$A_1$"), (np.pi, RED, "$A_2$")):
        Ms = np.linspace(M0 - 0.35, M0 + 0.35, 40)
        xs, ys = zip(*[pt(m) for m in Ms])
        ax.fill([0] + list(xs) + [0], [0] + list(ys) + [0], color=c, alpha=.35, ec=c)
    ax.plot(0, 0, "o", color="#e0a800", ms=11, zorder=5)
    ax.text(-0.06, -0.2, "Sol (foco)", fontsize=10, ha="right")
    ax.text(0.22, -0.02, "$A_1$", color=BLUE, fontsize=13, weight="bold", ha="center")
    ax.text(-0.9, 0.17, "$A_2$", color=RED, fontsize=13, weight="bold", ha="center")
    ax.text(0.4, -1.0, "periélio:\nplaneta mais rápido", fontsize=9.5, color=BLUE, ha="center", va="top")
    ax.text(-1.6, -1.0, "afélio:\nplaneta mais lento", fontsize=9.5, color=RED, ha="center", va="top")
    ax.text(-0.3, 0.88, "$A_1 = A_2$ em tempos iguais ($\\Delta t_1=\\Delta t_2$)", fontsize=11, ha="center",
            bbox=dict(boxstyle="round,pad=0.35", fc="#fbf6ec", ec=GREY))
    ax.set_xlim(-2.0, 1.2); ax.set_ylim(-1.4, 1.05); ax.set_aspect("equal"); ax.axis("off")
    save(fig, "q77-orbita.png")

# ---------- Q79: gráfico com o trecho 40 → 60 ºC ----------
def q79():
    Q = np.array([0, 24, 48, 72]); th = np.array([20, 40, 60, 80])
    fig, ax = plt.subplots(figsize=(6.6, 4.0))
    ax.plot(Q, th, "-", color=RED, lw=2)
    ax.plot(Q, th, "o", color=INK, ms=5)
    ax.hlines([40, 60], 0, [24, 48], color=BLUE, ls="--", lw=1.2)
    ax.vlines([24, 48], 0, [40, 60], color=BLUE, ls="--", lw=1.2)
    ax.annotate("", xy=(48, 14), xytext=(24, 14), arrowprops=dict(arrowstyle="<->", color=GREEN, lw=1.6))
    ax.text(36, 6, "$\\Delta Q = 24\\cdot10^{4}$ J", ha="center", color=GREEN, fontsize=11, weight="bold")
    ax.annotate("", xy=(78, 60), xytext=(78, 40), arrowprops=dict(arrowstyle="<->", color=GREEN, lw=1.6))
    ax.text(79, 50, "$20\\ ^\\circ$C", va="center", color=GREEN, fontsize=11)
    ax.set_xlim(0, 90); ax.set_ylim(0, 90)
    ax.set_xticks([0, 24, 48, 72]); ax.set_yticks([20, 40, 60, 80])
    ax.grid(True, color="#e4dfd2", lw=.7)
    ax.set_xlabel("$Q$ ($10^{4}$ J)"); ax.set_ylabel("$\\theta$ (°C)")
    for s in ("top", "right"): ax.spines[s].set_visible(False)
    save(fig, "q79-resolucao.png")

# ---------- Q80: lente, slide (objeto) e tela (anteparo) ----------
def q80():
    # desenho esquemático (fora de escala): p = 80, p' = 420 (u.a.), mesma equação 1/f = 1/p + 1/p'
    p, pl = 80.0, 420.0
    f = p * pl / (p + pl)               # 67,2 u.a.
    xL, xS = p, p + pl                  # lente em x = 80; tela em x = 500
    ho = 16.0; hi = ho * pl / p         # imagem invertida: 84
    fig, ax = plt.subplots(figsize=(11.5, 4.8))
    ax.axhline(0, color=GREY, lw=1, ls="-.", zorder=0)
    ax.text(505, 4, "eixo óptico", fontsize=8, color=GREY, ha="left")
    # tela (anteparo) e imagem
    ax.add_patch(Rectangle((xS, -hi - 6), 6, 2 * hi + 12, color="#d9d9d9", ec=INK, lw=1.2, zorder=2))
    ax.text(xS + 14, hi + 6, "Tela (anteparo)\n120 cm × 120 cm", ha="left", va="center", fontsize=10)
    ax.annotate("", xy=(xS, -hi), xytext=(xS, 0), arrowprops=dict(arrowstyle="-|>", color=INK, lw=2, mutation_scale=15), zorder=5)
    ax.text(xS + 14, -hi, "imagem\ninvertida", ha="left", va="center", fontsize=10)
    # lente
    ax.annotate("", xy=(xL, 96), xytext=(xL, -96), arrowprops=dict(arrowstyle="<|-|>", color=BLUE, lw=2.4, mutation_scale=18), zorder=4)
    ax.text(xL, 102, "lente esférica delgada\nconvergente", ha="center", va="bottom", color=BLUE, fontsize=10)
    # objeto (slide)
    ax.add_patch(Rectangle((-5, -ho), 5, 2 * ho, color="#a8d5b0", ec=INK, lw=1.2, zorder=3))
    ax.annotate("", xy=(-2.5, ho), xytext=(-2.5, 0), arrowprops=dict(arrowstyle="-|>", color=INK, lw=1.6, mutation_scale=12), zorder=5)
    ax.text(-2.5, -ho - 5, "slide\n5 cm × 5 cm", ha="center", va="top", fontsize=10)
    # raios a partir do topo do slide
    y0 = ho
    ax.plot([0, xL, xS], [y0, y0, y0 - y0 / f * (xS - xL)], color=RED, lw=1.5)                 # paralelo -> F'
    ax.plot([0, xS], [y0, y0 - y0 / p * xS], color=GREEN, lw=1.5)                              # central
    yF = y0 - y0 / (p - f) * p                                                                  # passa por F
    ax.plot([0, xL, xS], [y0, yF, yF], color=BLUE, lw=1.2, alpha=.8)
    # focos
    for x, lab in ((xL - f, "$F$"), (xL + f, "$F'$")):
        ax.plot(x, 0, "o", color=INK, ms=4, zorder=6)
        ax.text(x, 5, lab, ha="center", va="bottom", fontsize=11)
    # cotas
    yc = -118
    ax.annotate("", xy=(xL, yc), xytext=(0, yc), arrowprops=dict(arrowstyle="<->", color=INK))
    ax.text(xL / 2, yc - 5, "$p = 20$ cm", ha="center", va="top", fontsize=11, weight="bold")
    ax.annotate("", xy=(xS, yc), xytext=(xL, yc), arrowprops=dict(arrowstyle="<->", color=INK))
    ax.text((xL + xS) / 2, yc - 5, "$p' = 480$ cm", ha="center", va="top", fontsize=11, weight="bold")
    ax.annotate("", xy=(xS, yc - 34), xytext=(0, yc - 34), arrowprops=dict(arrowstyle="<->", color=INK))
    ax.text(xS / 2, yc - 39, "slide até a tela: $p + p' = 5$ m", ha="center", va="top", fontsize=10)
    ax.text(310, 70, r"$A=\dfrac{i}{o}=-\dfrac{p'}{p}=-24\ \Rightarrow\ p'=24\,p\ \Rightarrow\ f=\dfrac{p\,p'}{p+p'}=19{,}2$ cm", ha="center", fontsize=12,
            bbox=dict(boxstyle="round,pad=0.4", fc="#fbf6ec", ec=GREY))
    ax.text(615, -150, "fora de escala", fontsize=9, color=GREY, style="italic", ha="right")
    ax.set_xlim(-25, 620); ax.set_ylim(-190, 130)
    ax.set_aspect("auto"); ax.axis("off")
    save(fig, "q80-lente.png")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        recortes(sys.argv[1])
    q76(); q77(); q79(); q80()
