# Time Block

Plan the day in blocks on one rail, 7:00 to 19:00. React + TypeScript + Vite, drawn in the SceneSnap design system.

## Run

```bash
npm install
npm run dev
```

Add `?now=10:24` to the address to pin the clock to that minute; the sample day shown on first launch is the design's, at 10:24.

## Scripts

- `npm run dev` — local server
- `npm run build` — type-check and build `dist/`
- `npm run typecheck` — type-check only
- `npm test` — unit tests for the time math, the store and the rail's gestures

## Layout

- `src/tokens/` — SceneSnap's colour, type, spacing, radius and shadow tokens, and the Satoshi and Petrona fonts. Components never hard-code these.
- `src/components/<Name>/` — one folder per shared component: `<Name>.tsx`, `<Name>.css`, `index.ts`.
- `src/screens/<Name>/` — Today (with its Timeline), New block, Focus, Inbox, and Schedule ("Give it a time").
- `src/state/` — the day's blocks and the inbox: a reducer, kept in `localStorage`.
- `src/lib/` — time math, the hash router, the clock, the block colours.
