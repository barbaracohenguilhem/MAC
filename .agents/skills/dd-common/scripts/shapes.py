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

def clover():
    # four-leaf clover: four round leaves on the diagonals (roomy enough for a stone each) and a curved stem
    d, r = 0.58, 0.43
    s = math.sin(math.radians(45))
    rho = d * s + math.sqrt(r*r - d*d*s*s)       # radius of the notch where neighbouring leaves meet
    k = math.degrees(math.atan2(rho * s, rho * s - d))   # notch angle on a leaf, relative to its axis
    p = []
    for a in (45, 135, 225, 315):
        cx, cy = polar(a, d)
        frm, to = a - k, a + k
        if a == 315: frm = a - k + 12            # leave room for the stem at the bottom notch
        if a == 225: to = a + k - 12
        arc(p, frm, to, r, 90, cx, cy)
        if a == 225:
            ex, ey = p[-1][0], p[-1][1]
            stem = [(ex, ey), (ex + 0.005, ey - 0.16), (ex + 0.04, ey - 0.32), (ex + 0.11, ey - 0.46),
                    (ex + 0.19, ey - 0.57), (ex + 0.25, ey - 0.55), (ex + 0.18, ey - 0.42),
                    (ex + 0.135, ey - 0.28), (-ex, ey - 0.14), (-ex, ey)]
            for i in range(len(stem) - 1): line(p, stem[i], stem[i+1], 6)
    return p

def spline(ctrl, per=12):
    # closed Catmull-Rom curve through the control points, for smooth organic outlines
    p, n = [], len(ctrl)
    for i in range(n):
        p0, p1, p2, p3 = ctrl[i-1], ctrl[i], ctrl[(i+1) % n], ctrl[(i+2) % n]
        for s in range(per):
            t = s / per; t2, t3 = t*t, t*t*t
            p.append(tuple(0.5 * (2*p1[k] + (-p0[k] + p2[k])*t + (2*p0[k] - 5*p1[k] + 4*p2[k] - p3[k])*t2
                                  + (-p0[k] + 3*p1[k] - 3*p2[k] + p3[k])*t3) for k in (0, 1)))
    return p

def mirrored(right):
    # right half listed top → bottom (x >= 0); returns the full symmetric loop
    return right + [(-x, y) for x, y in reversed(right) if x > 0]

def turtle():
    # sea turtle from above: head, swept-back front flippers (wide enough for a small stone), rear flippers, tail;
    # the shell holds a column of three stones on the axis
    right = [(0, 1.12), (0.09, 1.10), (0.155, 1.02), (0.17, 0.92), (0.15, 0.83), (0.12, 0.76),       # head, neck
             (0.17, 0.72), (0.28, 0.69), (0.38, 0.63), (0.44, 0.57),                                    # shell top, flipper notch
             (0.54, 0.62), (0.70, 0.65), (0.86, 0.60), (1.00, 0.48), (1.09, 0.33), (1.12, 0.20),        # front flipper, leading edge
             (1.08, 0.13), (0.98, 0.16), (0.84, 0.25), (0.68, 0.31), (0.56, 0.30),                      # trailing edge
             (0.58, 0.18), (0.61, 0.04), (0.61, -0.10), (0.58, -0.25), (0.52, -0.38),                   # shell side
             (0.53, -0.47), (0.61, -0.57), (0.70, -0.69), (0.72, -0.80), (0.63, -0.84),                 # rear flipper
             (0.51, -0.76), (0.41, -0.66),
             (0.30, -0.71), (0.18, -0.78), (0.09, -0.84), (0.05, -0.92), (0.02, -1.00), (0, -1.02)]    # shell rear, tail
    return spline(mirrored(right), 10)

def butterfly():
    # four roomy wings (big stone in each upper wing, medium in each lower), a body wide enough for a
    # column of small stones, and two short antennae
    right = [(0, 0.50), (0.05, 0.56), (0.13, 0.80), (0.20, 0.96), (0.25, 0.95), (0.20, 0.78), (0.14, 0.58),  # antenna
             (0.24, 0.70), (0.44, 0.88), (0.68, 0.98), (0.90, 0.94), (1.00, 0.78), (0.98, 0.52),                # upper wing
             (0.86, 0.28), (0.66, 0.12), (0.46, 0.04),                                                          # upper wing base
             (0.58, -0.08), (0.72, -0.30), (0.74, -0.56), (0.62, -0.80), (0.42, -0.90), (0.24, -0.82),          # lower wing
             (0.14, -0.70), (0.10, -0.86), (0.05, -0.97), (0, -1.0)]                                             # body tail
    return spline(mirrored(right), 10)

def feather():
    # peacock feather: pointed tip, broad vane (big "eye" stone near the top, a flanking pair below it, one more
    # lower down), barb splits along the lower edges, and a slim quill
    right = [(0, 1.0), (0.10, 0.93), (0.30, 0.80), (0.46, 0.62), (0.54, 0.40), (0.55, 0.18), (0.52, 0.02),
             (0.44, -0.04), (0.49, -0.10),                                                                # barb split
             (0.44, -0.24), (0.36, -0.30), (0.39, -0.37),                                                 # barb split
             (0.30, -0.50), (0.21, -0.56), (0.23, -0.62),                                                 # barb split
             (0.13, -0.70), (0.06, -0.74), (0.04, -0.84), (0.035, -0.95), (0.02, -1.0), (0, -1.01)]       # quill
    return spline(mirrored(right), 10)

def crown():
    # five-point crown with orb tips: a big stone in the cap under the centre point, a smaller one in each
    # middle point, and a row of stones along the band
    def orb(p, cx, cy, r, frm, to, n=24):
        arc(p, frm, to, r, n, cx, cy)
    p = []
    orb(p, cx=0.0, cy=0.80, r=0.09, frm=90, to=-62)                       # centre orb, right half
    line(p, (0.045, 0.72), (0.25, 0.10), 16)                               # centre point, right edge
    line(p, (0.25, 0.10), (0.46, 0.54), 12)                                # middle point, left edge
    orb(p, cx=0.50, cy=0.62, r=0.085, frm=242, to=-62)                     # middle orb
    line(p, (0.54, 0.545), (0.74, 0.04), 14)                               # middle point, right edge
    line(p, (0.74, 0.04), (0.87, 0.34), 10)                                # outer point, inner edge
    orb(p, cx=0.92, cy=0.42, r=0.08, frm=235, to=-80)                      # outer orb
    line(p, (0.93, 0.34), (0.86, -0.32), 14)                               # outer edge down to the band
    line(p, (0.86, -0.32), (0.90, -0.36), 3)                               # band lip
    line(p, (0.90, -0.36), (0.88, -0.84), 12)                              # band side
    line(p, (0.88, -0.84), (0.0, -0.88), 20)                               # band bottom
    right = p
    return right + [(-x, y) for x, y in reversed(right) if x > 0.001]

def ginkgo():
    # ginkgo leaf: a fan with a wavy top edge split by a central notch into two lobes, and a slim curved stem;
    # an arc of stones follows the fan (two per lobe) with room for one more low in the centre
    import math as m
    ax, ay, R = 0.0, -0.55, 1.45                 # fan apex (where the stem meets the blade) and radius
    p = []
    def rim(a):                                   # wavy outer edge
        r = R * (1 + 0.025 * m.cos(m.radians(a - 90) * 14))
        return (ax + r * m.cos(m.radians(a)), ay + r * m.sin(m.radians(a)))
    # right lobe: from the notch outwards along the rim
    for i in range(60):
        a = 82 - (82 - 32) * i / 59; p.append(rim(a))
    # right side edge back down to the apex (slightly concave)
    x0, y0 = rim(32)
    for i in range(1, 20):
        t = i / 20; bow = 0.08 * m.sin(m.pi * t)
        p.append((x0 + (ax + 0.06 - x0) * t - bow * 0.55, y0 + (ay + 0.02 - y0) * t + bow * 0.85))
    # stem: down from the apex with a gentle curve, and back up
    stem = [(0.07, -0.60), (0.08, -0.72), (0.11, -0.85), (0.15, -0.97), (0.10, -1.0), (0.05, -0.90),
            (0.01, -0.78), (-0.01, -0.68), (-0.05, -0.60)]
    p += stem
    # left side edge up to the rim
    x1, y1 = rim(148)
    for i in range(1, 20):
        t = i / 20; bow = 0.08 * m.sin(m.pi * t)
        p.append((ax - 0.06 + (x1 - ax + 0.06) * t + bow * 0.55, ay + 0.02 + (y1 - ay - 0.02) * t + bow * 0.85))
    # left lobe to the notch
    for i in range(60):
        a = 148 - (148 - 98) * i / 59; p.append(rim(a))
    # central notch
    xl, yl = rim(98); xr, yr = rim(82)
    p += [(xl, yl), (-0.06, ay + R * 0.78), (-0.02, ay + R * 0.62), (0.02, ay + R * 0.62), (0.06, ay + R * 0.78), (xr, yr)]
    return p

def scarab():
    # scarab amulet from above: toothed head, wide thorax shield (a stone), six chunky legs, and an oval back
    # split into two wing cases (a stone on each) with a notch at the tail
    right = [(0, 0.95), (0.07, 0.97), (0.12, 0.92), (0.17, 0.89), (0.20, 0.80), (0.18, 0.73),   # head
             (0.27, 0.70), (0.36, 0.67),                                                        # thorax front
             (0.50, 0.80), (0.60, 0.93), (0.70, 0.91), (0.62, 0.75), (0.47, 0.60),               # front leg
             (0.47, 0.44), (0.42, 0.33), (0.37, 0.29),                                           # thorax side, waist
             (0.48, 0.25), (0.70, 0.24), (0.87, 0.31), (0.91, 0.24), (0.74, 0.14), (0.50, 0.12), # middle leg
             (0.49, -0.08), (0.47, -0.28),                                                       # wing case side
             (0.60, -0.36), (0.75, -0.56), (0.81, -0.75), (0.73, -0.77), (0.64, -0.60), (0.45, -0.46),  # hind leg
             (0.40, -0.62), (0.30, -0.79), (0.17, -0.90), (0.05, -0.94), (0.0, -0.88)]          # back, tail notch
    return spline(mirrored(right), 6)

def owl():
    # owl: ear tufts, broad face with two big eye stones, a small beak stone, folded wings, a belly stone, feet
    right = [(0, 0.62), (0.14, 0.66), (0.30, 0.74), (0.46, 0.95), (0.50, 0.70),        # brow dip, ear tuft
             (0.60, 0.50), (0.64, 0.24), (0.62, -0.05), (0.56, -0.35), (0.46, -0.62),   # face, flank
             (0.34, -0.80), (0.30, -0.92), (0.22, -0.95), (0.16, -0.86),                # foot
             (0.10, -0.90), (0.0, -0.88)]
    return spline(mirrored(right), 8)

def owl_eyes():
    # owl built around two big matched eye stones (~4ct, ~34pt on the board): a wide round head with chunky
    # ear tufts, a waist where the face disc meets the body, folded wings flaring at the bottom, stubby feet
    right = [(0, 0.70), (0.12, 0.72), (0.28, 0.80), (0.44, 0.94), (0.56, 1.00), (0.58, 0.84),   # brow dip, ear tuft
             (0.66, 0.62), (0.70, 0.40), (0.66, 0.16), (0.62, 0.02),                            # face disc, waist
             (0.66, -0.20), (0.66, -0.44), (0.60, -0.66), (0.50, -0.82),                       # body, wing flare
             (0.34, -0.88), (0.30, -0.99), (0.18, -1.0), (0.13, -0.90), (0.0, -0.90)]          # feet
    return spline(mirrored(right), 8)

def manta():
    # manta ray: broad curved wings (a stone in each), head fins, body stone, whip tail
    right = [(0, 0.30), (0.08, 0.34), (0.13, 0.50), (0.19, 0.46), (0.20, 0.30),        # head fin
             (0.40, 0.30), (0.66, 0.22), (0.88, 0.08), (1.0, -0.04),                    # wing leading edge
             (0.84, -0.12), (0.62, -0.20), (0.40, -0.30), (0.22, -0.42),               # trailing edge
             (0.10, -0.52), (0.04, -0.70), (0.025, -0.95), (0.0, -1.0)]                 # tail
    return spline(mirrored(right), 8)

def swallow():
    # swallow in flight: small head, broad crescent wings swept back to sharp tips (a stone in each),
    # a chest stone, and a short deep forked tail
    right = [(0, 0.46), (0.08, 0.44), (0.12, 0.36), (0.16, 0.30),                      # head
             (0.34, 0.36), (0.58, 0.40), (0.82, 0.34), (1.0, 0.16),                    # wing leading edge to tip
             (0.84, 0.16), (0.62, 0.10), (0.40, -0.02), (0.22, -0.12),                 # wing trailing edge
             (0.18, -0.32), (0.34, -0.66), (0.20, -0.60), (0.08, -0.42), (0.0, -0.36)] # forked tail
    return spline(mirrored(right), 8)

def ouroboros():
    # dragon biting its own tail: a ring body (one continuous stroke — the mouth is a narrow slit into the hole),
    # a long-snouted head with swept-back horns, and dorsal spikes along the outside; stones run round the ring
    # like scales, the eye sits in the head
    import math as m
    R, r = 1.0, 0.56
    P = lambda a, rad: (rad * m.cos(m.radians(a)), rad * m.sin(m.radians(a)))
    p = [P(126, R)]
    head = [(-0.70, 0.80), (-0.86, 0.80), (-0.88, 0.88), (-0.74, 0.98), (-0.56, 1.04),   # jaw, snout, nose
            (-0.40, 1.12), (-0.22, 1.18),                                                  # brow
            (0.06, 1.42), (0.10, 1.38), (-0.02, 1.16),                                     # horn, swept back
            (0.22, 1.30), (0.26, 1.26), (0.16, 1.08),                                      # second horn
            (0.32, 1.00), (0.44, 0.92)]                                                    # back of head, neck
    for i in range(len(head) - 1): line(p, head[i], head[i + 1], 5)
    # outer ring clockwise with chunky dorsal spikes along the back
    a0 = 64
    spikes = [40, 14, -12, -38, -64, -90, -116, -142, -168]
    arc_pts = []
    steps = 260
    for i in range(steps + 1):
        a = a0 + (-226 - a0) * i / steps
        bump = 0.0
        for s_ in spikes:
            d = abs(a - s_)
            if d < 7: bump = max(bump, 0.13 * (1 - d / 7))
        arc_pts.append(P(a, R + bump))
    p += arc_pts
    line(p, P(134, R), P(134, r), 8)             # into the mouth slit
    arc(p, 134, 486, r, 160)                     # inner ring, the other way round
    line(p, P(126, r), P(126, R), 8)             # back out of the slit
    return p

def blueberry():   # ripening blueberry sprig: two big berries, one small, a leaf up-right (stones: pink/blue/light berries)
    berries = [(-0.40, -0.30, 0.44), (0.40, -0.32, 0.40), (0.0, 0.24, 0.27)]
    crowns = [(-0.40, -0.30, 0.44, 150), (0.40, -0.32, 0.40, 30)]
    base, tip, w = (0.04, 0.42), (0.62, 1.12), 0.26
    ax, ay = tip[0]-base[0], tip[1]-base[1]; L = math.hypot(ax, ay); ux, uy = ax/L, ay/L
    def inside(x, y):
        if any((x-cx)**2 + (y-cy)**2 <= r*r for cx, cy, r in berries): return True
        for cx, cy, r, ang in crowns:   # blueberry calyx: small 5-point star poking out of the berry's rim
            px, py = cx + r*math.cos(math.radians(ang)), cy + r*math.sin(math.radians(ang))
            dx, dy = x-px, y-py; d = math.hypot(dx, dy); t = math.atan2(dy, dx) - math.radians(ang)
            if d <= 0.075 + 0.075 * max(0, math.cos(2.5*t)) ** 2: return True
        s = ((x-base[0])*ux + (y-base[1])*uy) / L; n = -(x-base[0])*uy + (y-base[1])*ux
        return 0 <= s <= 1 and abs(n) <= w * math.sin(math.pi * s) ** 0.8 * (1 - 0.25*s)
    c = (0.0, -0.05); rs = []
    N = 360
    for i in range(N):
        a = 2*math.pi*i/N; r = 0.0; last = 0.0
        while r < 2.2:
            if inside(c[0] + r*math.cos(a), c[1] + r*math.sin(a)): last = r
            r += 0.004
        rs.append(last)
    sm = [sum(rs[(i+k) % N] for k in range(-3, 4)) / 7 for i in range(N)]   # soften concave junctions
    return [(c[0] + sm[i]*math.cos(2*math.pi*i/N), c[1] + sm[i]*math.sin(2*math.pi*i/N)) for i in range(N)]

def balloons():   # three balloons (big pink, big blue, small pale) with a knot and a wavy ribbon tail
    ovals = [(-0.36, 0.34, 0.37, 0.44), (0.37, 0.28, 0.34, 0.40), (0.02, -0.20, 0.20, 0.24)]
    def egg(x, y, cx, cy, rx, ry):   # balloon: a touch narrower at the bottom
        v = (y - cy) / ry; s = rx * (1 + 0.12 * v)
        return ((x - cx) / s) ** 2 + v * v <= 1
    def inside(x, y):
        if any(egg(x, y, *o) for o in ovals): return True
        if abs(x - 0.02) <= 0.06 * (1 - (y + 0.44) / 0.08) and -0.52 <= y <= -0.42: return True  # knot
        if -1.02 <= y <= -0.42:   # ribbon: wavy, 0.11 wide
            mid = 0.02 + 0.10 * math.sin((y + 0.42) * 7.5)
            return abs(x - mid) <= 0.055
        return False
    c = (0.0, 0.12); N = 360; rs = []
    for i in range(N):
        a = 2*math.pi*i/N; r = 0.0; last = 0.0
        while r < 2.2:
            if inside(c[0] + r*math.cos(a), c[1] + r*math.sin(a)): last = r
            r += 0.003
        rs.append(last)
    sm = [sum(rs[(i+k) % N] for k in range(-2, 3)) / 5 for i in range(N)]
    return [(c[0] + sm[i]*math.cos(2*math.pi*i/N), c[1] + sm[i]*math.sin(2*math.pi*i/N)) for i in range(N)]

def toi_et_moi():   # filled infinity bar: two round lobes (pink / blue stones) pinched at a waist (small accent stone)
    return [((1 - 0.66*math.sin(t)**2) ** 0.9 * math.cos(t) * 1.0, (1 - 0.66*math.sin(t)**2) ** 0.9 * math.sin(t) * 1.25 * (0.55 + 0.45*abs(math.cos(t))))
            for t in [i / 360 * 2 * math.pi for i in range(360)]]

def lotus():   # three-petal lotus: almond central petal cradles one hero stone (~6ct at (0, 0.45)); side petals rise from a V notch to pointed tips flaring outward; shallow base
    right = [(0, 1.0), (0.12, 0.90), (0.24, 0.70), (0.30, 0.48), (0.29, 0.28), (0.25, 0.13),    # almond central petal
             (0.31, 0.08), (0.46, 0.22), (0.62, 0.44), (0.78, 0.64), (0.93, 0.76),                # side petal inner edge → tip
             (0.95, 0.58), (0.89, 0.34), (0.77, 0.14), (0.58, -0.03), (0.36, -0.13), (0.16, -0.17), (0.0, -0.18)]
    return spline(mirrored(right), 8)

def peacock():   # peacock eye-feather: heart-shaped plume (notch at the top, 3 soft barb lobes a side) flowing into a wide quill; eye at (0, 0.38): hero ~34pt + oval ring of 8 (rx 0.34, ry 0.38); 3-stone cascade down the quill
    p = []
    for i in range(201):                                   # right side of the plume, top -> join with the quill
        u = math.radians(158 * i / 200)
        k = 1 + 0.07 * abs(math.sin(3 * u)) ** 0.6
        k *= 1 - 0.16 * math.exp(-(u / 0.30) ** 2)          # top notch
        p.append((0.74 * k * math.sin(u) * (1 + 0.35 * math.cos(u)), 0.42 + 0.60 * k * math.cos(u)))
    p += [(0.19, -0.26), (0.16, -0.46), (0.13, -0.66), (0.09, -0.86), (0.04, -1.0), (0, -1.02)]
    return mirrored(p)

def cat_eyes():   # symmetric black-cat head built for two matched eye stones (~4ct, ~34pt) at (±0.30, 0.12): pointed ears, full cheeks, soft chin
    right = [(0, 0.52), (0.14, 0.58), (0.26, 0.70), (0.40, 0.88), (0.52, 1.0),      # brow → inner ear → tip
             (0.58, 0.80), (0.64, 0.56), (0.72, 0.34), (0.76, 0.10),                  # outer ear → cheek
             (0.72, -0.16), (0.60, -0.38), (0.42, -0.54), (0.20, -0.63), (0.0, -0.66)]  # jaw → chin
    return spline(mirrored(right), 8)

def luna():   # fat crescent for one hero stone (~7ct, ~40pt) at (0.62, 0): inner circle pushed further left so the belly is ~0.5 wide
    a = 118.0; c = -0.95
    tx, ty = polar(a, 1.0)
    r = math.hypot(tx - c, ty)
    b = math.degrees(math.atan2(ty, tx - c))
    p = []; arc(p, a, -a, 1.0, 160)
    arc(p, -b, b, r, 140, cx=c, cy=0)
    return p

def scallop():   # Venus scallop shell (shell-emblem form): wedge from the hinge capped by a dome, 9 fine rib crests on the rim, small ears; hero stone ~5ct at (0, 0.05)
    hx, hy = 0.0, -0.95; cx, cy, R = 0.0, -0.05, 0.98
    lo, hi, n = 38, 142, 5
    p = []
    for i in range(241):
        t = lo + (hi - lo) * i / 240
        ux, uy = math.cos(math.radians(t)), math.sin(math.radians(t))
        Rr = R + 0.17 * abs(math.sin((t - lo) / (hi - lo) * n * math.pi)) ** 0.45
        bx, by = hx - cx, hy - cy                     # ray from hinge to the (ribbed) dome
        bb = bx * ux + by * uy; s_ = -bb + math.sqrt(bb * bb - (bx * bx + by * by - Rr * Rr))
        p.append((hx + s_ * ux, hy + s_ * uy))
    p += [(-0.13, -0.72), (-0.56, -0.56), (-0.48, -1.0), (0.48, -1.0), (0.56, -0.56), (0.13, -0.72)]
    return p

def monstera():   # monstera leaf hanging from a stem nub (bail at top): heart-shaped, two slanted vein cuts per side angling up toward the midrib, pointed tip; hero ~4ct at (0, 0.30)
    right = [(0, 1.0), (0.08, 1.0), (0.08, 0.86), (0.05, 0.78),             # stem nub -> sinus
             (0.24, 0.90), (0.48, 0.90), (0.70, 0.78), (0.86, 0.56), (0.92, 0.34),   # cordate upper lobe
             (0.88, 0.18), (0.42, 0.40),                                      # cut 1: mouth -> inner point (up-in)
             (0.90, 0.04), (0.90, -0.16),                                     # middle lobe
             (0.76, -0.34), (0.30, -0.14),                                    # cut 2
             (0.64, -0.46), (0.50, -0.64), (0.28, -0.84), (0, -1.02)]         # lower lobe -> tip
    return spline(mirrored(right), 6)

def dragonfly():   # Art Nouveau dragonfly, head up: round head, broad rounded wing pairs (room for ~2ct stones), long tapering jewelled abdomen
    right = [(0, 0.98), (0.09, 0.97), (0.14, 0.88), (0.12, 0.78), (0.17, 0.70),          # head -> thorax
             (0.32, 0.90), (0.55, 1.04), (0.80, 1.06), (0.94, 0.96), (0.94, 0.78),        # upper wing leading edge -> tip
             (0.82, 0.60), (0.58, 0.50), (0.30, 0.48),                                     # upper wing trailing edge
             (0.30, 0.42), (0.56, 0.36), (0.80, 0.24), (0.90, 0.06), (0.80, -0.10),        # lower wing (wide root so stones can slide in)
             (0.56, -0.10), (0.34, -0.02), (0.17, 0.02),
             (0.16, -0.20), (0.14, -0.60), (0.10, -0.90), (0.05, -1.0), (0, -1.02)]        # abdomen
    return spline(mirrored(right), 6)

def teddy():   # teddy-bear head: round face with two big round ears; stones: ear pair at (±0.68,0.70) ~25pt, eye pair (±0.36,0.20) ~19pt, nose hero (0,-0.14) ~27pt, smile trio (±0.30,-0.50)/(0,-0.60) ~13pt
    R, er, ex, ey = 1.0, 0.44, 0.68, 0.70
    pts = []
    for i in range(360):
        t = math.radians(i); c, s = math.cos(t), math.sin(t)
        r = R * (1 - 0.06 * max(0, -s))          # slightly flatter chin
        for sx in (-1, 1):
            cx, cy = sx*ex, ey
            b = -2*(c*cx + s*cy); cc = cx*cx + cy*cy - er*er; disc = b*b - 4*cc
            if disc > 0:
                r = max(r, (-b + math.sqrt(disc)) / 2)
        pts.append((r*c, r*s))
    return pts

SHAPES = {f.__name__: f for f in [teddy, dragonfly, monstera, scallop, luna, cat_eyes, peacock, lotus, toi_et_moi, balloons, blueberry, ouroboros, owl, owl_eyes, manta, swallow, scarab, ginkgo, crown, feather, butterfly, turtle, clover, trident, trident_bold, wave, cat, heart, star, diamond, moon, cloud, leaf, circle, egg, hexagon, lightning]}

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
