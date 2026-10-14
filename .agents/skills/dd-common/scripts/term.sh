#!/bin/zsh
# term.sh "TEXT" [wait] — focus field, type, return twice, snapshot /tmp/dd.png
cd ~/.claude/skills/dd-common
o=($(scripts/origin.sh)) || { echo NOWIN; exit 1; }
bin/molddraw tap $((o[1]+115)) $((o[2]+714)); sleep 0.8
scripts/hsm.sh type "$1" >/dev/null 2>&1; sleep 0.6
scripts/hsm.sh key - return >/dev/null 2>&1; sleep 1
scripts/hsm.sh key - return >/dev/null 2>&1
sleep ${2:-2}
scripts/snap.sh /tmp/dd.png 0 >/dev/null 2>&1 || scripts/snap.sh /tmp/dd.png 0 >/dev/null 2>&1
echo done
