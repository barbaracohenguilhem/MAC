#!/bin/zsh
# Prints "x y w h" (integers, screen points) of the iPhone Mirroring window.
# Also makes sure the Hammerspoon draw overlay is off and hidden (it would swallow
# our mouse events) and brings the window to the front.
HS=${HS:-/Users/MAC/.local/bin/hs}
out=""
if [[ -x $HS ]]; then
  out=$(perl -e 'alarm 8; exec @ARGV' "$HS" -c '
if iphoneDraw then
  if iphoneDraw.drawing then iphoneDraw.setDrawing(false) end
  if iphoneDraw.canvas and iphoneDraw.canvas:isShowing() then iphoneDraw.toggleHidden() end
end
local a = hs.application.get("iPhone Mirroring")
local w = a and (a:mainWindow() or a:allWindows()[1])
if not w then print("NOWINDOW") return end
w:focus()
local f = w:frame()
print(string.format("%d %d %d %d", math.floor(f.x), math.floor(f.y), math.floor(f.w), math.floor(f.h)))
' 2>/dev/null | grep -E '^(-?[0-9]+ ){3}-?[0-9]+$|^NOWINDOW$' | tail -1)
fi
if [[ -z $out ]]; then
  # Fallback without Hammerspoon (overlay state can't be fixed this way).
  out=$(osascript -e 'tell application "System Events" to tell process "iPhone Mirroring"
    set frontmost to true
    set {x, y} to position of window 1
    set {w, h} to size of window 1
    return (x as integer as string) & " " & (y as integer as string) & " " & (w as integer as string) & " " & (h as integer as string)
  end tell' 2>/dev/null)
fi
[[ -n $out ]] || out=NOWINDOW
print -r -- "$out"
