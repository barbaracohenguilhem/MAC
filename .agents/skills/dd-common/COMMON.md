# dd-common — shared toolbox for the Diamond District skills

Loaded by `/dd-design`, `/dd-news` and `/dd-economy`. Not a skill by itself.
Everything runs on the **iPhone** through iPhone Mirroring. **The Mac Diamond District app is forbidden** (user, 2026-10-01). The old Mac tooling is kept in `legacy-mac/` for history only; never run it.

## Standing rules (from the user)

- Act without asking. In-game currency only, never real money or the App Store. Report afterwards, briefly.
- Survey the state first, then do the highest-leverage move per minute. No low-margin grinding.
- Short progress notes; never sit silently through a 2-minute wait. Do other work or run the wait in the background.
- If mirroring shows "iPhone in Use … Lock your iPhone to connect", the user picked up the phone: stop, save progress to memory, report.

## Preflight (every session)

```
cd ~/.claude/skills/dd-common
pgrep -x "iPhone Mirroring" >/dev/null || echo "mirroring not running"
pgrep -x caffeinate >/dev/null || (nohup caffeinate -d >/dev/null 2>&1 &)   # keep the Mac awake
bin/molddraw check            # ok | denied (denied → use scripts/hsm.sh for input)
scripts/origin.sh             # x y of the mirroring window, exit 1 if none
scripts/snap.sh /tmp/dd0.png 0 && Read it
```

Get the origin **immediately before every action** (`o=($(scripts/origin.sh)) || exit 1`); the user moves the window.

## Coordinates

Two conventions:
- **Window points** (molddraw, draw.sh, mv.sh): offsets from the window origin; window 348×766. In a snapshot, point = original px ÷ 4; if the image is shown at 909 px wide, point = displayed px × 0.383.
- **D-units** (dd.sh): displayed px of a 909-wide snapshot. `scripts/dd.sh tap|swipe|scroll DX DY …` acts, waits `DD_WAIT` s (default 2), saves `/tmp/dd.png`.

Fixed places (D-units):

| Thing | D |
|---|---|
| App back arrow / home-grid pill (top-left) | (104, 263) / (118, 262) |
| Sheets close by **swiping down** (X taps hang) | `dd.sh swipe 454 400 454 1700` |
| Home row 1: Rep / Karat / MINEX | (181, 785) / (454, 785) / (727, 785) |
| Home row 2: DD News / Gloss / Terminal | (181, 1010) / (454, 1010) / (727, 1010) |
| Home row 3: Papers / Vault / Obsidian | (181, 1233) / (454, 1233) / (727, 1233) |
| Dock: GemEX / dBay / WR / Lounge | (198, 1741) / (369, 1741) / (540, 1741) / (710, 1741) |
| Home page dots (page 1 / page 2: LoanShark, Marquee) | (436, 1606) / (464, 1606); swipes don't change pages |
| Notifications card "N more" | (454, 620) |

A tap right after closing a sheet is often swallowed; snapshot and repeat.

## Tools

| Script | Role |
|---|---|
| `bin/molddraw` (from `scripts/molddraw.swift`) | `check`; `tap x y`; `swipe x1 y1 x2 y2 [ms] [hold]`; `path x1 y1 x2 y2 … [--ms N]`; `scroll x y dy [dx]` (wheel events, the only way to scroll); `drag cx cy` reads closed-stroke offsets on stdin. Absolute screen points. |
| `scripts/hsm.sh` + `hsmouse.lua` | Same commands through Hammerspoon, plus `type "text"` and `key <mods> <key> [n]` (`-` for no mods). **All typing goes through hsm.sh.** Cmd shortcuts don't work (cmd-A arrives as "a"). Jobs have IDs, so a retry after an `hs -c` timeout never runs twice. |
| `scripts/origin.sh` / `scripts/window.sh` | Window origin / focus mirroring and print `x y w h`. |
| `scripts/snap.sh out.png [delay]` | Snapshot via Hammerspoon. Often prints "receive timeout" yet saves; check the file exists. |
| `scripts/dd.sh`, `scripts/dds.sh` | D-unit tap/swipe/scroll + snapshot (`dds.sh` also writes a half-size `/tmp/ddh.png`). |
| `scripts/mv.sh x1 y1 x2 y2 …` | Window-point path drag + snapshot + zoomed board crop `/tmp/v.png` (stone moves). |
| `scripts/draw.sh`, `shapes.py`, `preview.py` | Outline drawing (see dd-design). |
| `scripts/term.sh "CMD" [wait]` | Types a Terminal-app shell command and snapshots (see dd-economy). |
| `scripts/fulfill.sh`, `emerald_cycle.sh` | Commission / GemEX helpers (see dd-economy). |
| `scripts/ddn_type.sh file.txt` | Types a DDN story, one paragraph per line (see dd-news). |
| `scripts/sync_vault.sh` | Copies the four dd-* skill folders into the Obsidian vault (`~/Downloads/my vault/.claude/skills/`). Run after editing any skill. |

## Rules learned the hard way

1. Read the origin before every action, with the guard.
2. The Hammerspoon overlay steals the mouse when its draw mode is on; `window.sh` turns it off.
3. Verify with the snapshot, not with assumptions. A quiet run can have done nothing.
4. Wrap `hs -c` in `perl -e 'alarm 8; exec @ARGV'`; never blindly re-send anything non-idempotent.
5. A tap followed by a drag drops the stroke unless the cursor settles first; keep ≥1.5 s between Clear and a stroke.
6. If input commands start getting blocked while snapshots still work, it's the auto-mode classifier, not the phone; tell the user.

## Troubleshooting

- `origin.sh` fails / "window not found" → retry (the Hammerspoon CLI is flaky under load); then the phone is locked or mirroring is closed. Ask the user.
- `molddraw check` says `denied` → the terminal lost Accessibility; use `hsm.sh` meanwhile.
- `NOSNAP` / "could not create image" → Screen Recording permission lost; ask the user to re-grant it.
- Heavy load (`sysctl -n vm.loadavg`) makes the CLI time out. Past causes: an xmrig miner (malware, 2026-09-28), the iOS Simulator.
