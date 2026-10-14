---
name: dd-design
description: "Design and commit custom jewelry in the Diamond District (d47) iPhone app via iPhone Mirroring: gather inspiration (Gloss features, dBay listings, Lounge), pick a concept and matched stones, draw a closed single-stroke outline in the 'Mold Your Own' canvas, name it, set metal/finish/engraving, place the stones by hand and COMMIT. Use when the user says 'mold canvas', 'draw something in d47', 'make a piece', 'amazing designs', '/mold-draw', or asks for a new design. Economy work lives in /dd-economy, articles in /dd-news. Not for the Hammerspoon overlay doodles or Spline/Hana."
---

# dd-design — pieces that look designed

Read `~/.Codex/skills/dd-common/COMMON.md` first (preflight, coordinates, tools, rules). Scripts live in `~/.Codex/skills/dd-common/scripts`, shapes in `./shapes`, notes in `./design/`.

**Phone only.** Never open the Mac app. Don't ask the user what to draw; choose the concept yourself and commit. Only stop if the phone is picked up or two stone moves in a row fail.

## 0. The bar (what the user has said)

- Loved: Blue Morpho (butterfly, platinum, Florentine, one sapphire per wing: "OMG thats insane"). Khepri (gold scarab) accepted. Noctua Violacea (owl) scored 100 but owls were rejected as a concept the same day.
- Rejected: Poseidon figure (busy), crown ("too obvious"), ginkgo ("wtf is that"), owl/manta/swallow, ouroboros ring, peacock feather (read as a balloon).
- "Why did your quality drop? … lazy and dumb": the failure was one template repeated (flat silhouette, a few evenly spaced dots, cheap or leftover stones, small stones lost in big areas, committing the first acceptable render).
- Required now: **stones must build the form**. Graduated rows, clusters, pavé fields, eye or heart focal stones, a contrast accent colour. Use valuable matched stones. Mock the full composition in `preview.py` before drawing. Reject and redo anything sparse.

Keep `design/TASTE.md` current: add every verdict the user gives.

## 1. Inspiration phase (before every new piece)

Spend about 5 minutes here; log into `design/INSPO.md` (date each entry).

1. **Gloss** (home row 2, D(454, 1010)): open the current issue and the previous one. For every featured piece note: name, silhouette, metal, finish, stone colour(s), stone count and *arrangement* (pair of eyes, row of 3, quincunx, ring, cascade, pavé). Note the grade and value when shown. What's featured is what the game's taste rewards right now.
2. **dBay** (dock): skim Listings (what other players sell, prices, what has sold) and Client Requests (what people want: metal, stone colour, count). A piece built to an open request pays fair value plus a bonus.
3. **Lounge → The Gem Exchange / Global Chat**: anything players brag about or ask for.
4. **Own Collection** (Karat → COLLECTION): what's unsold, what grade each piece has.

Then write 2–3 concept lines in INSPO.md ("concept → why it fits the inspo → stones available") and pick one. Prefer: a bold instantly recognisable creature or object, symmetric stone-bearing regions, one colour story plus at most one accent, and a silhouette the canvas can hold (features ≥ 15pt, no thin stems, no holes).

## 2. Stones first

Open Karat → NEW DESIGN and read the inventory (filter icon at the right of the GEMS header: carat / colour / clarity / origin / treatment / transparency / sort). If the list says "No gems available", visit GemEX on the phone (the list only refreshes after that) and, if the inventory is really empty, cut rough in /dd-economy first.

Grade facts (re-tested 2026-09-30 / 10-01):
- Synergy depends only on the gem set. One stone = 95 (Exquisite). Two or more stones now score 37–59 regardless of matching (Atelier update), so multi-stone pieces land in Quality/Standard. Don't chase Exquisite with a multi-stone design; chase *beauty and value*.
- Appraisal: a single Exceptional/Excellent-cut hero stone in a clean custom mold appraises at about 4× its picker value. Multi-stone compositions appraise at about 1–3× the gem value (Birth of Venus 2.9×, Monstera 2.7×). Fair/Poor cuts get ~1×.
- So the sweet spot: **one valuable hero stone as the focal point + a matched supporting set that builds the form.** Hero carries the value, the set carries the design.

Board stone sizes: ~37pt for 5.8ct, 33pt for 4ct, 25pt for 1.7ct, 19pt for 0.8ct, 15pt for 0.5ct (scales with ct^(1/3)).

## 3. Outline design

Add a function to `scripts/shapes.py` (insert before `SHAPES = {`; to replace one, swap its def → next-def span and check order first) and preview it:

```
python3 ~/.Codex/skills/dd-common/scripts/preview.py <shape> "[(x,y,diam_pt),...]" /tmp/prev.png
```

Read the PNG. Every stone's printed clearance must be ≥ ~6pt (regions ≥ 1.5× the stone diameter). The board scales the largest extent to ~195pt. The Mold canvas simplifies strokes deterministically: details under ~15pt vanish, 7–9 ribs collapse, 5 big ribs come out clean. Avoid outlines with holes (drops near a hole's bottom get refused).

Shape library (`python3 scripts/shapes.py --list`): butterfly, scarab, scallop, monstera, dragonfly, teddy, cat, clover, turtle, lotus, moon, wave, heart, star, hexagon, cloud, egg, lightning, luna, blueberry, balloons, leaf, feather, toi_et_moi, plus rejected ones kept for reference (crown, ginkgo, owl, owl_eyes, manta, swallow, ouroboros, peacock, trident, poseidon.txt).

## 4. Reach a blank canvas and draw

- "Design committed" screen: DONE (174, 683) → KARAT home. NEW DESIGN (174, 328) → Config. Scroll the Shape row (`molddraw scroll X+220 Y+435 0 600`) and tap **Custom** (294, 430) → "Mold Your Own".
- `MOLD_DRAG_US=30000 ~/.Codex/skills/dd-common/scripts/draw.sh <shape> [--clear]` (30 ms per point keeps detail; `--clear` if a shape is already there). Read `/tmp/mold-after.png`: orange outline + "TAP USE SHAPE, OR CLEAR TO REDRAW". Tap Use Shape (251, 590). Canvas offsets: centre (174, 412), Clear (96, 590).

## 5. Config

Name first (the orange "name is required" line disappears and everything below moves up ~22pt; snapshot before tapping below it): tap (84, 219), `hsm.sh key - right 40`, `hsm.sh key - delete 40`, `hsm.sh type "Name"`, `hsm.sh key - return`.
Rows after naming: Type ~275 (Pendant x107, Bracelet x165), Metal 317 (Gold 99, Silver 142, Platinum 194, Gunmetal 255, Rose Gold ~306; more right: White Gold, Titanium, Obsidian), Finish 361 (High Polish 115, Brushed 180, Matte 232, Satin 276; Florentine, Noir Patina further right), Shape ~412, Engraving ~473 (None, Sunburst, Guilloché, Crosshatch, Concentric, Floral Scroll, Diamond Weave, Starburst, Art Deco Fan, Milgrain, Basketweave …). Rows scroll sideways with `scroll <x> <y> 0 400`. Pick metal/finish/engraving to echo the concept (Sunburst rays on a scallop, Diamond Weave as dragonfly veins, Milgrain on silver).
Gems: chips ALL/DIAMOND/EMERALD/SAPPHIRE at y ~556 after naming; scroll the page (`scroll X+174 Y+640 400`), rows ~46pt; the first pick adds a materials bar and Synergy readout. Filter gotcha: an active chip can't be cleared by tapping it; scroll the row left and tap ALL. Continue to Layout (174, 694).
Bracelets: no Shape or Engraving rows; stones fill 8 links left to right.

## 6. Layout (by hand, this is the design)

- SNAP (131, 703) and ALIGN (166, 703) OFF (teal = on, grey = off; state persists, so snapshot first).
- Board pt = (px of a half-res snapshot)/2, y + 150. Work targets out from the outline's geometry.
- Move with `scripts/mv.sh x1 y1 x2 y2 …` (path drag, `MS=350`, then `/tmp/v.png` crop), **hops ≤ 20pt** or a slow path staying inside the outline; long drags get cancelled. Moves under ~10pt count as taps: go out ~20pt and come back. One move, wait 2.5 s, snapshot, retry misses one at a time. Outermost stones first (they overlap at the start). Holds > 0.5 s toggle PREC mode.
- A drop is refused silently if the stone won't fit with the app's margin; step in shorter hops.
- Check symmetry in the snapshot, then VIEW (317, 105) → tap the case (174, 455) to render; VIEW again to return. **Reject sparse renders and fix them.** ADD (37, 702) for a missed gem; Back (29, 105) to change the outline.

## 7. Commit, list, log

COMMIT (285, 702) → Commit Design (174, 509) → "DESIGN COMMITTED" with the estimated value → DONE (174, 683).
Then: list it on dBay at appraisal (listing cap 20) or fulfil a matching request (see /dd-economy §1), submit Exquisite pieces to Gloss (3/day, 2% fee), and append the piece to `design/PIECES.md` (name, outline, metal/finish/engraving, stones, value, user verdict when given). Report in a few lines and move to the next concept.

## Committed so far (short)

Lucky Clover, Blue Morpho (loved), Khepri, Noctua Violacea (100, sold to jacques), Siam Lotus, Luna Viridis, Polaris, Andaman Triad, Birth of Venus ($398.6K, listed), Monstera ($272.7K), Libellule ($37.6K). Ursa Minor (teddy, 10 Medium Green emeralds) was fully laid out but not committed when mirroring dropped on 2026-10-01; the collection was empty on 2026-10-06, so it's gone. Details in `design/PIECES.md`.
