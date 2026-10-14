#!/bin/zsh
# tsh.sh "CMD" [wait] — run a Terminal-app shell command in the Mac game via ddax (background) and print its output block
cd ~/.claude/skills/mold-draw
bin/ddax set "command" "$1" --enter >/dev/null || { echo "NOSHELL (open Terminal app; window must be on this Space)"; exit 1; }
sleep ${2:-2.5}
bin/ddax text | awk '/^TERMINAL SHELL$/{buf=""; f=1; next} f{buf=buf $0 "\n"} END{printf "%s", buf}' | grep -v -E '^\[TextField' 
