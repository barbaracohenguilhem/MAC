#!/bin/zsh
# draw.sh <shape-name | points-file> [--size N] [--clear] [--use-shape] [--out snapshot.png]
# Draws one closed stroke into the "Mold Your Own" canvas of the Diamond District app
# shown in iPhone Mirroring, then snapshots the phone window for verification.
set -e
DIR=${0:A:h:h}
BIN=$DIR/bin/molddraw
[[ -x $BIN ]] || swiftc -O "$DIR/scripts/molddraw.swift" -o "$BIN"

# Layout offsets inside the mirroring window (points), measured 2026-09-27.
CANVAS_DX=174; CANVAS_DY=412      # canvas centre
CLEAR_DX=96;   CLEAR_DY=590       # "Clear" button
USE_DX=251;    USE_DY=590         # "Use Shape" button

shape=""; size=130; do_clear=0; do_use=0; out=/tmp/mold-after.png
while (( $# )); do
  case $1 in
    --size) size=$2; shift 2;;
    --clear) do_clear=1; shift;;
    --use-shape) do_use=1; shift;;
    --out) out=$2; shift 2;;
    *) shape=$1; shift;;
  esac
done
[[ -n $shape ]] || { echo "usage: draw.sh <shape|file> [--size N] [--clear] [--use-shape] [--out png]"; exit 2; }

frame=""
for try in 1 2 3; do
  frame=$("$DIR/scripts/window.sh")
  [[ $frame == NOWINDOW* || -z $frame ]] || break
  sleep 1
done
[[ $frame == NOWINDOW* || -z $frame ]] && { echo "iPhone Mirroring window not found (is the phone unlocked and mirroring?)"; exit 1; }
X=${${(z)frame}[1]}; Y=${${(z)frame}[2]}
echo "window origin: $X $Y"
sleep 0.4

if (( do_clear )); then "$BIN" tap $((X+CLEAR_DX)) $((Y+CLEAR_DY)); sleep 1.5; fi

if [[ -f $shape ]]; then pts=$(python3 "$DIR/scripts/shapes.py" --file "$shape" --size $size)
else pts=$(python3 "$DIR/scripts/shapes.py" "$shape" --size $size); fi
print -r -- "$pts" | "$BIN" drag $((X+CANVAS_DX)) $((Y+CANVAS_DY))

if (( do_use )); then sleep 0.6; "$BIN" tap $((X+USE_DX)) $((Y+USE_DY)); fi
"$DIR/scripts/snap.sh" "$out" 1.5
