#!/bin/zsh
# fulfill.sh <card_x> <card_y> [scrolls] — from the "Design committed" screen: DONE → home → dBay → scroll N×650 → open card → select first qualifying piece. Snapshot left in /tmp/dd.png (check it before tapping FULFILL at 454 1833).
S=~/.claude/skills/dd-common/scripts
DD_WAIT=2 $S/dd.sh tap 454 1783 >/dev/null
DD_WAIT=1.5 $S/dd.sh tap 118 262 >/dev/null
DD_WAIT=2.5 $S/dd.sh tap 369 1741 >/dev/null
for i in $(seq 1 ${3:-2}); do DD_WAIT=1.2 $S/dd.sh scroll 450 1300 650 >/dev/null; done
cp /tmp/dd.png /tmp/fulfill_list.png
DD_WAIT=2.5 $S/dd.sh tap $1 $2 >/dev/null
DD_WAIT=1.5 $S/dd.sh tap 211 1132 >/dev/null
echo done
