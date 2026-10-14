#!/bin/zsh
# maclist.sh "<piece name>" — from Karat home (Mac): COLLECTION → MANAGE → open the piece → LIST ON MARKETPLACE at appraisal.
cd ~/.claude/skills/mold-draw
bin/ddax press "OK | #action-button-1" >/dev/null 2>&1; bin/ddax press "Close | #xmark" >/dev/null 2>&1
bin/ddax ls | grep -q "Search jewelry" || { bin/ddax press "MANAGE" >/dev/null 2>&1 || { bin/ddax press "COLLECTION" >/dev/null 2>&1; sleep 1.5; bin/ddax press "MANAGE" >/dev/null 2>&1; }; sleep 2; }
bin/ddax set "Search jewelry" "$1" >/dev/null 2>&1; sleep 1.2
f=$(bin/ddax ls | grep "StaticText $1 \[" | head -1 | sed -E 's/.*\[([0-9]+),([0-9]+) .*/\1 \2/'); [ -z "$f" ] && { echo "NOCARD $1"; exit 1; }
set -- "$1" ${=f}; DDAX_IDLE=0 bin/ddax click $(($2+20)) $(($3-40)) >/dev/null; sleep 2
bin/ddax press "LIST ON MARKETPLACE" >/dev/null || { echo "NOLIST $1"; exit 1; }; sleep 2
bin/ddax press "LIST" 0 >/dev/null; sleep 2.5
bin/ddax text | grep -oE 'Listed "[^"]+" for \$[0-9.]+' | head -1
bin/ddax press "OK | #action-button-1" >/dev/null 2>&1; bin/ddax press "Close | #xmark" >/dev/null 2>&1; true
