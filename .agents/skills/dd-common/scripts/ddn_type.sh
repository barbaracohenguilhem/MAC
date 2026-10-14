#!/bin/zsh
# ddn_type.sh <file> — tap the STORY field, type each line as a paragraph (blank line between), snapshot
cd ~/.claude/skills/dd-common
o=($(scripts/origin.sh)) || { echo NOWIN; exit 1; }
bin/molddraw tap $((o[1] + 172)) $((o[2] + 345)); sleep 1
lines=("${(@f)$(<$1)}")
n=${#lines[@]}; i=0
for t in "${lines[@]}"; do
  i=$((i + 1))
  scripts/hsm.sh type "$t" >/dev/null; sleep 0.8
  if (( i < n )); then scripts/hsm.sh key - return 1 >/dev/null; sleep 0.5; fi
done
sleep 1
scripts/snap.sh /tmp/dd.png 0 >/dev/null 2>&1
echo "typed $n paragraphs"
