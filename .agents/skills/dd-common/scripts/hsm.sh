#!/bin/zsh
# hsm.sh — same interface as bin/molddraw, but the events are posted by Hammerspoon.
# Use when the terminal lacks Accessibility (`molddraw check` prints "denied").
#   hsm.sh tap <x> <y>
#   hsm.sh swipe <x1> <y1> <x2> <y2> [ms] [hold_ms]
#   hsm.sh path <x1> <y1> <x2> <y2> ... [--ms N]
#   hsm.sh scroll <x> <y> <dy> [dx]
#   hsm.sh drag <cx> <cy> < points     ("x y" per line, y up, offsets from cx,cy)
#   hsm.sh type <text>                 type into the focused field
#   hsm.sh key <mods> <key> [n]        e.g. `key - delete 30` (mods comma-separated, - for none).
#                                      Cmd shortcuts like cmd-A reach the phone as plain letters; clear text with
#                                      `key - right 40` then `key - delete 40` instead.
# Waits until Hammerspoon has finished posting. Retries are idempotent: a timed-out `hs -c`
# may still have run, so each job carries an id and is only scheduled once.
DIR=${0:A:h:h}
HS=${HS:-/Users/MAC/.local/bin/hs}
cmd=$1; shift
job="j$$_$RANDOM"
hsq() { perl -e 'alarm 8; exec @ARGV' "$HS" -c "$1" 2>/dev/null | grep -v "Loading extension" }

case $cmd in
  tap)    call="HSM.tap($1, $2)" ;;
  swipe)  call="HSM.swipe($1, $2, $3, $4, ${5:-350}, ${6:-120})" ;;
  scroll) call="HSM.scroll($1, $2, $3, ${4:-0})" ;;
  type)   call="HSM.type([==[$1]==])" ;;
  key)    m=""; [[ $1 != - ]] && for x in ${(s:,:)1}; do m+="'$x',"; done; call="HSM.key({$m}, '$2', ${3:-1})" ;;
  path)
    ms=300; coords=()
    while (( $# )); do
      if [[ $1 == --ms ]]; then ms=$2; shift 2; else coords+=$1; shift; fi
    done
    pts=""; for ((i = 1; i < ${#coords}; i += 2)); do pts+="{x=${coords[i]},y=${coords[i+1]}},"; done
    call="HSM.path({$pts}, $ms)" ;;
  drag)
    cx=$1; cy=$2; f=/tmp/hsm-$job.lua
    awk -v cx=$cx -v cy=$cy 'NF >= 2 { gsub(",", " "); printf "{x=%.2f,y=%.2f},\n", cx + $1, cy - $2; n++ }
      END { print "}" ; print "-- " n }' | { print "return {"; cat } > $f
    n=$(tail -1 $f | tr -dc 0-9)
    call="HSM.drag(dofile('$f'))" ;;
  *) echo "usage: hsm.sh tap|swipe|path|scroll|drag ..."; exit 2 ;;
esac

queued=""
for try in 1 2 3; do
  r=$(hsq "if hsmJob ~= '$job' then
  hsmJob, hsmDone = '$job', nil
  dofile('$DIR/scripts/hsmouse.lua')
  hs.timer.doAfter(0.05, function()
    local ok, err = pcall(function() $call end)
    hsmDone = '$job ' .. (ok and 'ok' or tostring(err))
  end)
end
print('queued')")
  [[ $r == *queued* ]] && { queued=1; break; }
  # a timeout can still have scheduled it; the job-id guard makes the retry safe
  [[ $(hsq "print(tostring(hsmJob))") == $job ]] && { queued=1; break; }
  sleep 1
done
[[ -n $queued ]] || { echo "hsm: could not reach Hammerspoon"; exit 1; }

for i in {1..90}; do
  sleep 0.5
  d=$(hsq "print(tostring(hsmDone))")
  if [[ $d == "$job "* ]]; then
    [[ $d == "$job ok" ]] || { echo "hsm: ${d#$job }"; exit 1; }
    [[ $cmd == drag ]] && { echo "stroke posted: $n points (via Hammerspoon)"; rm -f $f; }
    exit 0
  fi
done
echo "hsm: timed out waiting for Hammerspoon"; exit 1
