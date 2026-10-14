#!/usr/bin/env python3
"""Emit a closed single-stroke outline as "x y" lines (y up), fitted to the Mold canvas.

    shapes.py <name> [--size 130]      built-in shape
    shapes.py --file path.txt          re-fit an existing point file
    shapes.py --list

Points are centred on the canvas centre and scaled so the larger half-extent == size
(canvas is ~300pt square, so keep size <= 140).
"""
import math, sys

def polar(deg, r):
    a = math.radians(deg); return (r * math.cos(a), r * math.sin(a))

def line(pts, a, b, n=30):
    for i in range(n):
        t = i / n; pts.append((a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t))

def arc(pts, frm, to, r, n=120, cx=0, cy=0):
    for i in range(n):
        t = i / n; x, y = polar(frm + (to-frm)*t, r); pts.append((cx+x, cy+y))

def param(fn, n=300):
    return [fn(i / n * 2 * math.pi) for i in range(n)]

def cat():
    p = []; R, T = 100, 168
    line(p, polar(78, R), polar(62, T)); line(p, polar(62, T), polar(38, R))
    arc(p, 38, -222, R, 220)
    line(p, polar(138, R), polar(118, T)); line(p, polar(118, T), polar(102, R))
    arc(p, 102, 78, R * 0.96, 20)
    return p

def heart():
    return param(lambda t: (16*math.sin(t)**3,
                            13*math.cos(t) - 5*math.cos(2*t) - 2*math.cos(3*t) - math.cos(4*t)))

def star(points=5, inner=0.45):
    p = []
    for k in range(points * 2):
        r = 1.0 if k % 2 == 0 else inner
        a = 90 + k * 180 / points
        nxt = 90 + (k + 1) * 180 / points
        r2 = inner if k % 2 == 0 else 1.0
        line(p, polar(a, r), polar(nxt, r2), 25)
    return p

def diamond():   # brilliant-cut gem silhouette
    v = [(-1, .35), (-.55, .75), (.55, .75), (1, .35), (0, -1)]
    p = []
    for i in range(len(v)): line(p, v[i], v[(i+1) % len(v)], 40)
    return p

def moon():
    # crescent: outer arc on the right, inner arc (circle centred left) bulging the same way
    a = 112.0; c = -0.5
    tx, ty = polar(a, 1.0)
    r = math.hypot(tx - c, ty)
    b = math.degrees(math.atan2(ty, tx - c))
    p = []; arc(p, a, -a, 1.0, 160)          # top horn -> bottom horn via the right
    arc(p, -b, b, r, 140, cx=c, cy=0)        # bottom horn -> top horn, inner edge
    return p

def cloud():
    # bumpy polar blob with a flat base; never self-intersects
    p = []
    for i in range(300):
        t = i / 300 * 2 * math.pi
        r = 0.85 + 0.13 * math.sin(3 * t + .6) + 0.07 * math.cos(5 * t)
        x, y = r * math.cos(t), r * math.sin(t)
        p.append((x, max(y, -0.55)))
    return p

def leaf():
    return param(lambda t: ((1.0 * math.cos(t)), 0.5 * math.sin(t) * (1 + .35 * math.cos(t))))

def circle():   return param(lambda t: (math.cos(t), math.sin(t)))
def egg():      return param(lambda t: (0.8*math.cos(t), math.sin(t) * (1 + .18*math.sin(t))))
def hexagon():
    p = []
    for k in range(6): line(p, polar(30+60*k, 1), polar(90+60*k, 1), 30)
    return p

def lightning():
    v = [(-.2, 1), (.55, 1), (.1, .2), (.6, .2), (-.45, -1), (-.1, -.15), (-.6, -.15)]
    p = []
    for i in range(len(v)): line(p, v[i], v[(i+1) % len(v)], 30)
    return p

def trident():
    # Poseidon's trident: pommel, shaft, crossbar, three barbed prongs (outer ones flare out)
    v = [(-0.09, -1.10), (-0.09, -0.02), (-0.52, -0.02), (-0.60, 0.70), (-0.48, 0.90), (-0.38, 0.72),
         (-0.32, 0.20), (-0.11, 0.20), (-0.11, 0.92), (0.0, 1.10), (0.11, 0.92), (0.11, 0.20),
         (0.32, 0.20), (0.38, 0.72), (0.48, 0.90), (0.60, 0.70), (0.52, -0.02), (0.09, -0.02),
         (0.09, -1.10), (0.16, -1.10), (0.16, -1.22), (-0.16, -1.22), (-0.16, -1.10)]
    p = []
    for i in range(len(v)): line(p, v[i], v[(i+1) % len(v)], 18)
    return p

def trident_bold():
    # heraldic trident: wide crossbar, broad prongs and shaft so gemstones can seat inside
    v = [(-0.17, -0.80), (-0.17, 0.0), (-0.82, 0.0), (-0.82, 0.95), (-0.62, 1.18), (-0.42, 0.95),
         (-0.42, 0.42), (-0.20, 0.42), (-0.20, 1.20), (0.0, 1.45), (0.20, 1.20), (0.20, 0.42),
         (0.42, 0.42), (0.42, 0.95), (0.62, 1.18), (0.82, 0.95), (0.82, 0.0), (0.17, 0.0),
         (0.17, -0.80), (0.30, -0.80), (0.30, -0.98), (-0.30, -0.98), (-0.30, -0.80)]
    p = []
    for i in range(len(v)): line(p, v[i], v[(i+1) % len(v)], 18)
    return p

def wave():
    # rolling wave crest: flat-bottomed swell curling over to the left
    p = []
    for i in range(160):                       # top: swell rising left->right into a curl
        t = i / 160
        x = -1.0 + 2.0 * t
        y = -0.6 + 1.2 * (t ** 1.6)
        p.append((x, y))
    arc(p, 60, 300, 0.42, 90, cx=0.62, cy=0.30)   # curl
    line(p, (0.83, -0.06), (1.0, -0.6), 20)
    line(p, (1.0, -0.6), (-1.0, -0.6), 60)
    return p

SHAPES = {f.__name__: f for f in [trident, trident_bold, wave, cat, heart, star, diamond, moon, cloud, leaf, circle, egg, hexagon, lightning]}

def fit(pts, size):
    xs = [x for x, _ in pts]; ys = [y for _, y in pts]
    cx, cy = (max(xs)+min(xs))/2, (max(ys)+min(ys))/2
    half = max(max(xs)-min(xs), max(ys)-min(ys)) / 2 or 1
    k = size / half
    return [((x-cx)*k, (y-cy)*k) for x, y in pts]

def main(argv):
    size = 130.0
    if "--size" in argv:
        i = argv.index("--size"); size = float(argv[i+1]); del argv[i:i+2]
    if not argv or argv[0] == "--list":
        print("\n".join(sorted(SHAPES))); return
    if argv[0] == "--file":
        pts = [tuple(map(float, l.replace(",", " ").split()[:2])) for l in open(argv[1]) if l.strip() and not l.startswith("#")]
    elif argv[0] in SHAPES:
        pts = SHAPES[argv[0]]()
    else:
        sys.exit(f"unknown shape {argv[0]!r}; try --list")
    for x, y in fit(pts, size):
        print(f"{x:.2f} {y:.2f}")

if __name__ == "__main__":
    main(sys.argv[1:])
