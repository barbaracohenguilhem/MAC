#!/bin/zsh
# mv.sh x1 y1 x2 y2 ...  (window-relative points) → path drag, wait, snapshot, zoomed crop /tmp/v.png
cd ~/.claude/skills/dd-common
o=($(scripts/origin.sh)) || { echo NOWIN; exit 1; }
args=()
while (( $# >= 2 )); do args+=($(( o[1] + $1 )) $(( o[2] + $2 ))); shift 2; done
bin/molddraw path $args --ms ${MS:-350}
sleep ${WAIT:-2.5}
scripts/snap.sh /tmp/dd.png 0 >/dev/null || scripts/snap.sh /tmp/dd.png 0 >/dev/null
python3 - <<'PY'
from PIL import Image
im=Image.open('/tmp/dd.png'); w,h=im.size; s=w/909
a=im.crop((int(200*s),int(740*s),int(700*s),int(1240*s))).resize((800,800))
a.save('/tmp/v.png')
PY
echo done
