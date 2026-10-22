import { describe, expect, it } from 'vitest'
import type { Block } from '../../state/types'
import { nudge, step, type Drag } from './gesture'

const at = (h: number, m: number) => h * 60 + m
// at full size an hour is 56px, so 14px is a quarter hour
const QUARTER = 14
const newId = () => 'drawn'
const run: Block = { id: 'run', title: 'Morning run', start: at(7, 30), dur: 60, endedAt: at(8, 15), color: 'green' }

function press(over: Partial<Drag>): Drag {
  return { mode: 'move', y0: 300, start0: 0, dur0: 0, hourPx: 56, base: null, fresh: false, moved: false, preview: null, ...over }
}

describe('drawing', () => {
  const draw = press({ mode: 'create', start0: at(10, 0), dur0: 15 })

  it('adds nothing until the press moves more than 3px', () => {
    expect(step(draw, 303, newId)).toBe(draw)
  })

  it('grows a fresh block down from the press point', () => {
    const d = step(draw, 300 + 4 * QUARTER, newId)
    expect(d).toMatchObject({ mode: 'resize', fresh: true, moved: true })
    expect(d.preview).toEqual({ id: 'drawn', title: 'New block', start: at(10, 0), dur: 75, color: 'grey' })
  })

  it('grows a fresh block up toward its start', () => {
    const d = step(step(draw, 310, newId), 300 - 2 * QUARTER, newId)
    expect(d.preview).toMatchObject({ start: at(9, 30), dur: 45 })
  })
})

describe('moving', () => {
  const move = press({ start0: run.start, dur0: run.dur, base: run })

  it('snaps to quarter hours and carries an early end along', () => {
    const d = step(move, 300 + 2 * QUARTER + 3, newId)
    expect(d.moved).toBe(true)
    expect(d.preview).toMatchObject({ start: at(8, 0), endedAt: at(8, 45) })
  })

  it('stops at the edges of the day', () => {
    expect(step(move, 300 + 2000, newId).preview?.start).toBe(at(18, 0))
    expect(step(move, 300 - 2000, newId).preview?.start).toBe(at(7, 0))
  })

  it('counts a wobble that lands on the same slot as a tap', () => {
    expect(step(move, 305, newId).moved).toBe(false)
  })
})

describe('nudge (the keyboard)', () => {
  it('moves a quarter hour and carries an early end along', () => {
    expect(nudge(run, 'move', 15)).toMatchObject({ start: at(7, 45), endedAt: at(8, 30) })
  })

  it('stops at the edges of the day', () => {
    expect(nudge(run, 'move', -15).start).toBe(at(7, 15))
    expect(nudge({ ...run, start: at(18, 0) }, 'move', 15).start).toBe(at(18, 0))
  })

  it('changes the length from the visible end, never below a quarter hour, and re-plans the block', () => {
    // the run really ended at 8:15, so a quarter hour more ends it at 8:30
    expect(nudge(run, 'resize', 15)).toEqual({ id: 'run', title: 'Morning run', start: at(7, 30), dur: 60, color: 'green' })
    expect(nudge({ ...run, dur: 15, endedAt: undefined }, 'resize', -15).dur).toBe(15)
  })
})

describe('resizing', () => {
  it('re-plans the block, so its early end no longer applies', () => {
    const d = step(press({ mode: 'resize', start0: run.start, dur0: run.dur, base: run }), 300 + 4 * QUARTER, newId)
    expect(d.preview).toEqual({ id: 'run', title: 'Morning run', start: at(7, 30), dur: 120, color: 'green' })
  })

  it('grows an early-ended block from its real end when the press starts there', () => {
    // Timeline starts a resize at the handle, which sits at 8:15 for the run (45 minutes in)
    const d = step(press({ mode: 'resize', start0: run.start, dur0: 45, base: run }), 300 + QUARTER, newId)
    expect(d.preview).toMatchObject({ start: at(7, 30), dur: 60 })
    expect(d.preview?.endedAt).toBeUndefined()
  })

  it('never goes below a quarter hour', () => {
    const d = step(press({ mode: 'resize', start0: run.start, dur0: run.dur, base: run }), 300 - 500, newId)
    expect(d.preview?.dur).toBe(15)
  })
})
