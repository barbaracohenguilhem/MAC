-- hsmouse.lua — molddraw's commands, posted from Hammerspoon (for when the terminal lacks
-- Accessibility but Hammerspoon has it). Loaded and scheduled by hsm.sh; same timings as molddraw.swift.
local E, T = hs.eventtap.event, hs.eventtap.event.types
local us = hs.timer.usleep
local function post(t, p) E.newMouseEvent(t, p):post() end
local function hover(p, n, gap) for _ = 1, n do post(T.mouseMoved, p); us(gap) end end

HSM = {}

function HSM.tap(x, y)
  local p = { x = x, y = y }
  hover(p, 3, 100000)
  post(T.leftMouseDown, p); us(80000)
  post(T.leftMouseUp, p); us(250000)
end

-- pts: absolute screen points; closes back on the first point
function HSM.drag(pts)
  local first = pts[1]
  hover(first, 4, 120000); us(300000)
  post(T.leftMouseDown, first); us(150000)
  for i = 1, #pts do post(T.leftMouseDragged, pts[i]); us(9000) end
  post(T.leftMouseDragged, first); us(120000)
  post(T.leftMouseUp, first); us(300000)
end

function HSM.swipe(x1, y1, x2, y2, ms, hold)
  ms, hold = ms or 350, hold or 120
  local a, b = { x = x1, y = y1 }, { x = x2, y = y2 }
  hover(a, 3, 100000)
  post(T.leftMouseDown, a); us(hold * 1000)
  for i = 1, 40 do
    local t = i / 40
    post(T.leftMouseDragged, { x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t }); us(ms * 1000 / 40)
  end
  us(150000)
  post(T.leftMouseUp, b); us(300000)
end

-- pts: absolute points; press at the first, drag through the rest, release at the last
function HSM.path(pts, ms)
  ms = ms or 300
  hover(pts[1], 3, 100000)
  post(T.leftMouseDown, pts[1]); us(120000)
  for k = 2, #pts do
    local s0, s1 = pts[k - 1], pts[k]
    for t = 1, 25 do
      local f = t / 25
      post(T.leftMouseDragged, { x = s0.x + (s1.x - s0.x) * f, y = s0.y + (s1.y - s0.y) * f }); us(ms * 1000 / 25)
    end
    us(120000)
  end
  us(150000)
  post(T.leftMouseUp, pts[#pts]); us(300000)
end

-- positive dy = content moves up (finger swipe up), positive dx = content moves left
function HSM.scroll(x, y, dy, dx)
  dx = dx or 0
  local p = { x = x, y = y }
  hover(p, 3, 80000)
  local steps = math.max(1, math.floor(math.max(math.abs(dy), math.abs(dx)) / 10))
  local per, perX = math.floor(-dy / steps), math.floor(-dx / steps)
  for _ = 1, steps do
    local e = E.newScrollEvent({ perX, per }, {}, "pixel")
    e:location(p)
    e:post(); us(12000)
  end
  us(400000)
end

-- keyboard: text goes to the focused field (iPhone Mirroring forwards it to the phone)
function HSM.type(s) hs.eventtap.keyStrokes(s); us(300000) end
function HSM.key(mods, k, n) for _ = 1, n or 1 do hs.eventtap.keyStroke(mods, k, 30000); us(30000) end; us(200000) end
