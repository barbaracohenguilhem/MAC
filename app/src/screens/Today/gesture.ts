import { DAY_END, DAY_START, STEP, clamp, pxToMin, snap } from '../../lib/time'
import type { Block } from '../../state/types'

/** One press on the rail: drawing a new block, moving a block, or dragging its bottom edge. */
export interface Drag {
  mode: 'create' | 'move' | 'resize'
  /** Where the press began, in client px. */
  y0: number
  start0: number
  dur0: number
  /** The rail's hour height when the press began. */
  hourPx: number
  /** The block as it was when the press began; a drawn block gets one on its first movement. */
  base: Block | null
  /** The block was drawn by this press and is not in the day yet. */
  fresh: boolean
  /** The snapped time has changed, so a wobble that lands on the same slot still counts as a tap. */
  moved: boolean
  /** Where the block would land if the press ended now. */
  preview: Block | null
}

/** Follows the pointer to `y`. Returns `d` itself while nothing changes. */
export function step(d: Drag, y: number, newId: () => string): Drag {
  const dy = y - d.y0
  const dm = pxToMin(dy, d.hourPx)
  let cur = d
  if (cur.mode === 'create') {
    // a block appears only once the finger actually moves; a bare tap leaves nothing behind
    if (Math.abs(dy) <= 3) return d
    const base: Block = { id: newId(), title: 'New block', start: d.start0, dur: STEP, color: 'grey' }
    cur = { ...d, mode: 'resize', fresh: true, base }
  }
  const b = cur.base
  if (!b) return d

  let moved = cur.moved
  let preview: Block
  if (cur.mode === 'move') {
    const start = clamp(snap(cur.start0 + dm), DAY_START, DAY_END - b.dur)
    moved ||= start !== cur.start0
    preview = { ...b, start }
    // an early end travels with its block
    if (b.endedAt !== undefined) preview.endedAt = b.endedAt + (start - b.start)
  } else if (cur.fresh && dm < 0) {
    // dragging up from the press point grows a fresh block toward its start
    const start = Math.max(DAY_START, snap(cur.start0 + dm))
    moved ||= start !== cur.start0
    preview = { ...b, start, dur: Math.max(STEP, cur.start0 + STEP - start) }
  } else {
    const start = cur.fresh ? cur.start0 : b.start
    const dur = clamp(snap(cur.dur0 + dm), STEP, DAY_END - start)
    moved ||= dur !== cur.dur0
    // resizing re-plans the block, so a recorded early end no longer applies
    const { endedAt: _replanned, ...rest } = b
    preview = { ...rest, start, dur }
  }
  return { ...cur, moved, preview }
}
