#!/bin/zsh
# snap.sh <out.png> [delay]  — snapshot the iPhone Mirroring window (overlay excluded).
HS=${HS:-/Users/MAC/.local/bin/hs}
sleep ${2:-1.5}
perl -e 'alarm 8; exec @ARGV' "$HS" -c "
local a = hs.application.get('iPhone Mirroring')
local w = a and (a:mainWindow() or a:allWindows()[1])
local img = w and hs.window.snapshotForID(w:id())
if img then img:saveToFile('$1'); print('saved $1') else print('NOSNAP') end
" 2>&1 | grep -v "Loading extension" | tail -1
