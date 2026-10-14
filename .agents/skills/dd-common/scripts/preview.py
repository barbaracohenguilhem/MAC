#!/usr/bin/env python3
# preview.py <shape> "[(x,y,diam_pt),...]" [out.png] — render a shapes.py outline at board scale (largest extent 195pt)
# with stones at raw shape coordinates; prints each stone's board position and edge clearance (want >= ~6pt).
import sys, subprocess, math
from PIL import Image, ImageDraw
sys.path.insert(0, '/Users/MAC/.claude/skills/dd-common/scripts')
import shapes
name=sys.argv[1]; stones=eval(sys.argv[2]) if len(sys.argv)>2 else []  # list of (x,y,d_pt) in raw shape units
pts=shapes.SHAPES[name]()
xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
cx,cy=(max(xs)+min(xs))/2,(max(ys)+min(ys))/2; half=max(max(xs)-min(xs),max(ys)-min(ys))/2
k=97.5/half  # board: largest extent ~195pt
W=260; im=Image.new('RGB',(W*2,W*2),'black'); d=ImageDraw.Draw(im)
T=lambda x,y:((x-cx)*k*2+W, W-(y-cy)*k*2)
d.polygon([T(*p) for p in pts], fill=(170,170,180))
P=[((x-cx)*k,(y-cy)*k) for x,y in pts]
def inside(q):
    c=False
    for i in range(len(P)):
        a,b=P[i],P[i-1]
        if (a[1]>q[1])!=(b[1]>q[1]) and q[0]<(b[0]-a[0])*(q[1]-a[1])/(b[1]-a[1])+a[0]: c=not c
    return c
def dist(q):
    m=1e9
    for i in range(len(P)):
        a,b=P[i],P[i-1]; dx,dy=b[0]-a[0],b[1]-a[1]; L=dx*dx+dy*dy or 1
        t=max(0,min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dy)/L)); m=min(m,math.hypot(a[0]+t*dx-q[0],a[1]+t*dy-q[1]))
    return m
for (x,y,dd) in stones:
    X,Y=T(x,y); r=dd  # dd diameter pt -> radius in 2x px = dd
    d.ellipse([X-r,Y-r,X+r,Y+r], fill=(110,80,220))
    c=((x-cx)*k,(y-cy)*k); print(f"stone ({x},{y}) centre_pt=({c[0]:.1f},{c[1]:.1f}) clearance={dist(c)-dd/2:.1f}pt inside={inside(c)}")
print("extent pt:", (max(xs)-min(xs))*k, (max(ys)-min(ys))*k)
im.save(sys.argv[3] if len(sys.argv)>3 else '/tmp/mold-preview.png')
