#!/bin/zsh
# macpiece.sh "<name>" "<gem label prefix e.g. 5.88ct Sapphire, Exceptional>" "<Metal>" "<Shape>" [Finish] [Engraving]
# Mac Karat (background): NEW DESIGN → name/metal/finish/shape/engraving → place one hero stone → COMMIT → list at appraisal.
cd ~/.claude/skills/mold-draw
bin/ddax press "OK | #action-button-1" >/dev/null 2>&1; bin/ddax press "Close | #xmark" >/dev/null 2>&1
bin/ddax press "Back | #chevron.backward" >/dev/null 2>&1; sleep 1
bin/ddax press "NEW DESIGN" >/dev/null || { echo "NO KARAT HOME"; exit 1; }; sleep 2.5
bin/ddax set "Untitled" "$1" >/dev/null; sleep 0.3
bin/ddax ls | grep -q "TextField $1" || { bin/ddax set "*" "$1" >/dev/null; sleep 0.3; }
for b in "$3" "${5:-High Polish}" "$4" "${6:-None}"; do bin/ddax press "$b" >/dev/null 2>&1; sleep 0.3; done
bin/ddax press "$2" >/dev/null || { echo "NOGEM $2"; bin/ddax press Cancel >/dev/null; exit 1; }; sleep 1
grade=$(bin/ddax ls | grep -A4 "Button Cancel \[" | grep -oE "StaticText (Exquisite|Exceptional|Superior|Fine|Quality|Standard|Basic|Simple)" | head -1)
bin/ddax press "COMMIT" >/dev/null; sleep 2; bin/ddax press "#action-button-1" >/dev/null; sleep 2.5
bin/ddax press "I Acknowledge" >/dev/null 2>&1; sleep 3.5
bin/ddax text | grep -q "DESIGN COMMITTED" || { echo "$1 | COMMIT FAILED: $(bin/ddax text | grep -E 'action|Commit|name' | head -2 | tr '\n' ' ')"; bin/ddax press "Cancel | #action-button-2" >/dev/null 2>&1; bin/ddax press Cancel >/dev/null 2>&1; exit 1; }
val=$(bin/ddax text | grep -A1 "ESTIMATED VALUE" | tail -1)
bin/ddax press "DONE" >/dev/null 2>&1; sleep 1.5
if [ -n "$MACPIECE_NOLIST" ]; then echo "$1 | $2 | $3 $4 | ${grade#StaticText } | $val | (not listed)"; else echo "$1 | $2 | $3 $4 | ${grade#StaticText } | $val | $(scripts/maclist.sh "$1")"; fi
