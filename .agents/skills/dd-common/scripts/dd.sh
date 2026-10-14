#!/bin/zsh
# dd.sh tap DX DY | swipe DX1 DY1 DX2 DY2 | scroll DX DY DYPT [DXPT] | back | snap   (D* = displayed px of a 909-wide snapshot)
cd ~/.claude/skills/dd-common
o=($(scripts/origin.sh)) || { echo NOWIN; exit 1; }
p(){ printf '%.0f' $(( $1 * 0.383 )); }
case $1 in
  tap)   bin/molddraw tap $((o[1]+$(p $2))) $((o[2]+$(p $3)));;
  swipe) bin/molddraw swipe $((o[1]+$(p $2))) $((o[2]+$(p $3))) $((o[1]+$(p $4))) $((o[2]+$(p $5))) 400;;
  scroll) bin/molddraw scroll $((o[1]+$(p $2))) $((o[2]+$(p $3))) $4 ${5:-0};;
  snap) ;;
esac
sleep ${DD_WAIT:-2}
scripts/snap.sh /tmp/dd.png 0 >/dev/null 2>&1 || scripts/snap.sh /tmp/dd.png 0 >/dev/null 2>&1
echo done
