---
name: mold-draw
description: "Draw a closed single-stroke outline into the 'Mold Your Own' canvas of the Diamond District (d47) iPhone app, shown on the Mac through iPhone Mirroring, by posting synthetic mouse drags. Use whenever the user says 'mold canvas', 'draw something on my iphone', 'draw a <shape> in d47 / Diamond District', 'single line draw', or asks to repeat the heart/cat/flower drawing. Not for the Hammerspoon overlay doodles (those live on the Mac, not in the app) and not for Spline/Hana canvases."
---

# mold-draw — one-stroke shapes into the Diamond District Mold canvas

The app's sheet says "DRAW A CLOSED OUTLINE IN ONE STROKE", then offers **Clear** and **Use Shape**.
We draw by driving the Mac mouse over the iPhone Mirroring window with CoreGraphics events.

## Fast path

```bash
~/.Codex/skills/mold-draw/scripts/draw.sh <shape> [--size 130] [--clear] [--use-shape] [--out /tmp/mold-after.png]
```

- `<shape>`: a built-in name (`scripts/shapes.py --list`: cat, heart, star, diamond, moon, cloud, leaf, circle, egg, hexagon, lightning) **or** a text file of `x y` points (y up, any scale, one point per line). Custom shapes: write a tiny Python snippet that prints points, save to a file, pass the file.
- `--size`: half-extent in points. Canvas is ~300pt square, so keep it ≤ 140 (default 130).
- `--clear`: tap Clear first (needed when a shape is already on the canvas — the app ignores new strokes until cleared).
- `--use-shape`: tap Use Shape afterwards. **Only when the user asked for it**; otherwise leave it to them.
- The script prints the window origin, posts the stroke, and saves a snapshot PNG. **Always Read that PNG** to confirm the outline is filled orange and the "TAP USE SHAPE" hint appeared. If the canvas is empty, see Troubleshooting.

Before running, the phone must already be showing the Mold Your Own sheet (Diamond District app). If a snapshot shows another screen, tell the user to open it; navigating the app blind is not worth it.

## How it works (for repairs)

| Piece | Role |
|---|---|
| `scripts/window.sh` | Turns the Hammerspoon `iphoneDraw` overlay off and hides it, focuses iPhone Mirroring, prints `x y w h` of its window. |
| `bin/molddraw` (from `scripts/molddraw.swift`) | `drag <cx> <cy>` reads `x y` points on stdin and posts mouseDown → dragged… → up, closing back on the first point. `tap <x> <y>` clicks. `swipe <x1> <y1> <x2> <y2> [ms] [hold_ms]` presses, moves, releases (moves a stone on the Layout board). `path <x1> <y1> <x2> <y2> ... [--ms N]` drags through several points (use to move a stone a tiny net distance: go out ≥15pt and come back). `scroll <x> <y> <dy> [dx]` posts wheel events, vertical and horizontal (the only way to scroll lists/rows in iPhone Mirroring; drags don't scroll). All coordinates are absolute screen points. |
| `scripts/shapes.py` | Built-in outlines; `fit()` centres and scales any point list to `--size`. |
| `scripts/snap.sh out.png [delay]` | Snapshot of the mirroring window via Hammerspoon (`hs.window.snapshotForID`). Overlay strokes are *not* in it, which is what you want. |

Layout offsets inside the window, in points (measured 2026-09-27, window 348×766): canvas centre `(174, 412)`, Clear `(96, 590)`, Use Shape `(251, 590)`. If Apple changes the mirroring window size, re-measure from a snapshot (snapshot px ÷ 4 = points).

## After the canvas: Config and Layout (adding stones)

**Use Shape** leads to a two-step design flow. Offsets below are points from the window origin (measured 2026-09-27; re-measure from a snapshot if the UI shifts — screen point = origin + snapshot px ÷ 4).

1. **Config screen** — name, type, metal, finish, shape, engraving, gems.
   - Auto-name wand `(307, 219)`; type Pendant `(107, 294)` / Bracelet `(165, 294)`. A name is required.
   - The gem list is a scrollable table at the bottom: `molddraw scroll <origin.x+174> <origin.y+560> 400` scrolls it up. Tap a row to select (rows are ~46pt tall); the header shows `N SELECTED`.
   - `Continue to Layout` `(174, 694)` once at least one gem is selected.
2. **Layout board** — the molded outline in gold, chosen stones clustered at its centre, a bail marker above it.
   - Move a stone: `molddraw swipe <from> <to> 500` (press on the stone's centre; ~500 ms travel works). Stones overlap at the start, so move the outermost/smallest ones first.
   - SNAP toggle `(131, 702)` — turn it OFF for exact symmetric placement, since the grid isn't centred on the shape. ALIGN `(166, 702)`. COMMIT `(285, 702)`.
   - Design intent that worked: for a face-like shape, a matched pair of same-colour stones as eyes about a quarter-radius above centre, a smaller stone as the nose a quarter-radius below; keep one colour family. Always snapshot to check symmetry.
   - **A stone only drops where it fits entirely inside the outline.** Drags onto a region thinner than the stone silently do nothing (looked like broken input for a long time). Design shapes with limbs ≥ 1.5× the largest stone: e.g. `trident_bold`, not `trident`. Stone diameters on the board ≈ 25pt (1.7ct), 19pt (0.8ct), 15pt (0.5ct); the board scales the shape's max extent to ~195pt.
   - ALIGN may offset a column of stones a few points from the shape axis; turn ALIGN off and use `path` for the final nudge. Moves < ~10pt register as taps (select the stone + info card). Tap empty board to deselect.
   - A long stationary press (~1s) toggles PREC mode; avoid holds > 0.5s.
   - Missed a gem in Config? The board's ADD `(37, 702)` opens an "Add Gems" sheet; tap the ⊕ on a row.
   - Re-mold from the board: MOLD `(72, 702)` only offers presets ("custom shapes cannot be adjusted"). Instead: back arrow `(29, 105)` → Config, scroll the Shape row (`scroll <x> <y> 0 400`) and tap **Custom** to reopen the Mold canvas. Config choices and selected gems survive.
   - VIEW `(317, 105)` shows the rendered piece in a case (tap the case to reveal); tap VIEW again to return to editing.
   - In Config, selecting a gem makes a materials bar appear and shifts the list; snapshot between selections instead of tapping three rows blind.
   - **Never tap COMMIT unless the user asked** — it spends the materials and finalises the piece.

## Rules learned the hard way

1. **Read the window frame immediately before every action.** The user moves the window; stale coordinates put the stroke on the desktop or on the wrong screen.
2. **The Hammerspoon overlay steals the mouse.** When its draw mode is on, its eventtap returns `true` and the shape appears in red on the overlay instead of in the app. `window.sh` handles this, but if a stroke vanishes, check `iphoneDraw.drawing` via `hs -c`. Its follow-timer re-shows a hidden canvas unless hidden through `toggleHidden()`.
3. **One stroke, closed.** Never lift the button mid-shape; `molddraw drag` already returns to the start point. Keep concave details gentle — the app fills the polygon as-is.
4. **Don't tap Use Shape unless asked.** That commits the shape in the game.
5. **Verify with the snapshot, not with assumptions.** A quiet run with no error can still have drawn nothing.
6. Wrap `hs -c` calls in `perl -e 'alarm 8; exec @ARGV'`; the CLI occasionally hangs or returns nothing — `window.sh` falls back to AppleScript, and `draw.sh` retries.
7. **A tap followed by a drag drops the stroke** unless the cursor first settles on the start point; `molddraw` sends several hover moves before every mouse-down for that reason. Keep ≥1.5 s between Clear and the stroke.

## Troubleshooting

- `iPhone Mirroring window not found` → the app isn't open or the phone is locked. Ask the user.
- Snapshot shows the home screen / another app → the first mouseDown landed outside the canvas (window moved) or the sheet was dismissed. Ask the user to reopen Mold Your Own, then rerun.
- Stroke drawn but canvas unchanged → a shape was already there; rerun with `--clear`.
- Cursor doesn't move at all → the terminal lacks Accessibility permission for posting events (System Settings → Privacy & Security → Accessibility).
- `bin/molddraw` missing → `draw.sh` recompiles it with `swiftc` automatically.
