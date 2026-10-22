import { describe, expect, it } from 'vitest'
import { reducer } from './reducer'
import { sampleDay } from './sampleDay'

const at = (h: number, m: number) => h * 60 + m
const day = sampleDay('2026-10-15')
const deepWork = day.blocks.find((b) => b.title === 'Deep work · proposal draft')!

describe('endBlock', () => {
  it('records an early end, keeping the rest of the plan', () => {
    const next = reducer(day, { type: 'endBlock', id: deepWork.id, at: at(10, 24) })
    expect(next.blocks.find((b) => b.id === deepWork.id)).toEqual({ ...deepWork, endedAt: at(10, 24) })
  })

  it('cancels a block ended before it began', () => {
    const next = reducer(day, { type: 'endBlock', id: deepWork.id, at: at(8, 30) })
    expect(next.blocks.some((b) => b.id === deepWork.id)).toBe(false)
  })
})

describe('scheduleInboxItem', () => {
  it('moves the item out of the Inbox and onto the day', () => {
    const call = day.inbox.find((i) => i.title === 'Call accountant')!
    const block = { id: 'b', title: 'Call accountant', start: at(11, 30), dur: 30, color: 'red' as const }
    const next = reducer(day, { type: 'scheduleInboxItem', id: call.id, block })
    expect(next.inbox.some((i) => i.id === call.id)).toBe(false)
    expect(next.blocks.at(-1)).toEqual(block)
  })
})

describe('rollover', () => {
  it('starts a new day with an empty rail and brings tomorrow into today', () => {
    const next = reducer(day, { type: 'rollover', day: '2026-10-16' })
    expect(next.day).toBe('2026-10-16')
    expect(next.blocks).toEqual([])
    expect(next.inbox.filter((i) => i.bucket === 'tomorrow')).toEqual([])
    expect(next.inbox.filter((i) => i.bucket === 'today').map((i) => i.title)).toEqual([
      'Send invoice reminder',
      'Call accountant',
      'Draft newsletter',
    ])
  })

  it('leaves the same day alone', () => {
    expect(reducer(day, { type: 'rollover', day: day.day })).toBe(day)
  })
})

describe('replace', () => {
  it("takes on another tab's saved state", () => {
    const other = reducer(day, { type: 'removeBlock', id: deepWork.id })
    expect(reducer(day, { type: 'replace', state: other })).toBe(other)
  })

  it('carries a state saved on an earlier day forward to this tab’s day', () => {
    const today = reducer(day, { type: 'rollover', day: '2026-10-16' })
    const next = reducer(today, { type: 'replace', state: day })
    expect(next.day).toBe('2026-10-16')
    expect(next.blocks).toEqual([])
  })
})
