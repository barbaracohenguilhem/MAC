#!/bin/zsh
# ddapp.sh <dock label | home glyph> — close every in-game window, then open one app (Mac game, background).
# Dock labels: "GemEX" "d, Bay" "WR" "Diamond"; home glyphs: K (Karat) G (Gloss) ">" (Terminal) DDN P …
cd ~/.claude/skills/mold-draw
for i in 1 2 3 4 5 6 7 8; do bin/ddax press "Circle | #circle.fill" 0 >/dev/null 2>&1 || break; sleep 0.4; done
f=$(bin/ddax ls | awk -v g=" Button $1 [" 'index($0, g) {print; exit}' | sed -E 's/.*\[([0-9]+),([0-9]+) ([0-9]+)x([0-9]+)\].*/\1 \2 \3 \4/')
if [ -n "$f" ]; then set -- ${=f}; bin/ddax pressat $(( $1 + $3/2 )) $(( $2 + $4/2 )) >/dev/null
else bin/ddax press "$1" >/dev/null 2>&1 || { echo "NOAPP $1"; exit 1; }; fi
sleep ${DDAPP_WAIT:-2.5}; echo "opened"
