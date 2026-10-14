#!/bin/zsh
# origin.sh — prints "x y" of the iPhone Mirroring window, retrying window.sh; exits 1 (prints nothing) if not found.
# Use as:  o=($(scripts/origin.sh)) || exit 1; X=$o[1]; Y=$o[2]
DIR=${0:A:h}
for t in 1 2 3 4; do
  r=$("$DIR/window.sh")
  [[ $r == NOWINDOW* || -z $r ]] || { print -r -- "${${(z)r}[1]} ${${(z)r}[2]}"; exit 0; }
  sleep 1
done
exit 1
