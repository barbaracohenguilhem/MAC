#!/bin/zsh
# dds.sh <dd.sh args> — run dd.sh then write /tmp/ddh.png at half D-scale (D = displayed px × 2)
cd ~/.claude/skills/dd-common
scripts/dd.sh "$@" >/dev/null
sips -Z 1000 /tmp/dd.png --out /tmp/ddh.png >/dev/null && echo ok
