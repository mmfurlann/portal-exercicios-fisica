"""Verificação geométrica da cena (roda sem gerar vídeo)."""
import itertools
import numpy as np
from manim import config, tempconfig

from decomposicao_vetorial import DecomposicaoVetorial

with tempconfig({"dry_run": True, "verbosity": "ERROR"}):
    sc = DecomposicaoVetorial()
    sc.render()

ax = sc.ax
R, Rx, Ry = sc.vecs
P = ax.c2p
O = P(0, 0)
ok = lambda c: "OK" if c else "FALHOU"
tol = 1e-9

ux, uy = ax.x_axis.unit_size, ax.y_axis.unit_size
print(f"escala x = {ux:.6f}, escala y = {uy:.6f}  -> {ok(abs(ux-uy)<tol)}")

for name, v, end in [("R", R, (3, 4)), ("Rx", Rx, (3, 0)), ("Ry", Ry, (0, 4))]:
    tail = v.get_start()
    tip = v.tip.get_tip_point()
    print(f"{name}: cauda {np.round(ax.p2c(tail),9)} ponta {np.round(ax.p2c(tip),9)} "
          f"-> cauda em O {ok(np.allclose(tail,O,atol=tol))}, ponta {end} {ok(np.allclose(tip,P(*end),atol=tol))}")

L = [np.linalg.norm(v.tip.get_tip_point() - v.get_start()) / ux for v in (Rx, Ry, R)]
print(f"comprimentos (unid.) Rx:Ry:R = {L[0]:.6f}:{L[1]:.6f}:{L[2]:.6f} "
      f"-> 3:4:5 {ok(np.allclose(L,[3,4,5],atol=1e-9))}")

d = R.tip.get_tip_point() - R.get_start()
ang = np.degrees(np.arctan2(d[1], d[0]))
arc = sc.arc
print(f"ângulo de R a partir de +x = {ang:.4f}°  -> {ok(abs(ang-53.1301)<1e-3)}")
print(f"arco: centro {np.round(ax.p2c(arc.arc_center),9)}, início {np.degrees(arc.start_angle):.4f}°, "
      f"varredura {np.degrees(arc.angle):.4f}° -> {ok(np.allclose(arc.arc_center,O) and arc.start_angle==0 and abs(np.degrees(arc.angle)-53.1301)<1e-3)}")

gv, gh = sc.guides
print(f"guia vertical {np.round(ax.p2c(gv.get_start()),6)}→{np.round(ax.p2c(gv.get_end()),6)}; "
      f"horizontal {np.round(ax.p2c(gh.get_start()),6)}→{np.round(ax.p2c(gh.get_end()),6)}")

# sobreposição de rótulos: entre si, com pontas de seta, guias e bordas do quadro
def box(m, pad=0.0):
    return np.array([m.get_left()[0]-pad, m.get_bottom()[1]-pad, m.get_right()[0]+pad, m.get_top()[1]+pad])
def inter(a, b):
    return not (a[2] < b[0] or b[2] < a[0] or a[3] < b[1] or b[3] < a[1])

labs = sc.labels
obst = {"ponta R": R.tip, "ponta Rx": Rx.tip, "ponta Ry": Ry.tip, "guia v": gv, "guia h": gh,
        "vetor R": R, "vetor Rx": Rx, "vetor Ry": Ry}
problems = []
for (a, ma), (b, mb) in itertools.combinations(labs.items(), 2):
    if inter(box(ma, 0.05), box(mb, 0.05)):
        problems.append(f"{a} x {b}")
for a, ma in labs.items():
    for b, mb in obst.items():
        if inter(box(ma, 0.05), box(mb)) and not (b.startswith("vetor") and False):
            # vetor R é diagonal: caixa é grande demais; testa por distância ao segmento
            if b == "vetor R":
                s, e = R.get_start(), R.tip.get_tip_point()
                c = ma.get_center(); t = np.clip(np.dot(c-s, e-s)/np.dot(e-s, e-s), 0, 1)
                dist = np.linalg.norm(c - (s + t*(e-s)))
                if dist < max(ma.width, ma.height)/2 + 0.05:
                    problems.append(f"{a} x {b} (dist {dist:.2f})")
            else:
                problems.append(f"{a} x {b}")
    bx = box(ma)
    fw, fh = config.frame_width/2, config.frame_height/2
    if bx[0] < -fw or bx[2] > fw or bx[1] < -fh or bx[3] > fh:
        problems.append(f"{a} fora do quadro")
    if bx[0] < -fw + config.frame_width/3:
        problems.append(f"{a} no terço esquerdo")
print("rótulos:", "sem sobreposição/corte -> OK" if not problems else problems)
