import type { Block } from '../state/types'

/** Today's rail runs 7:00 to 19:00. Every time in the app is minutes since midnight. */
export const DAY_START = 7 * 60
export const DAY_END = 19 * 60
/** Blocks snap to quarter hours. */
export const STEP = 15
/** One hour of rail at full size. Short screens shrink it so the whole day still fits. */
export const HOUR_PX = 56
/** 7:00's line sits this far into the rail, level with the middle of its label. */
export const RAIL_TOP = 12
/** The lengths a block can be given in the forms. */
export const DURATIONS = [15, 30, 45, 60, 90, 120]

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
export const snap = (m: number) => Math.round(m / STEP) * STEP
export const minToPx = (m: number, hourPx = HOUR_PX) => (m * hourPx) / 60
export const pxToMin = (px: number, hourPx = HOUR_PX) => (px * 60) / hourPx
/** Where a time sits on the rail. */
export const railY = (t: number, hourPx = HOUR_PX) => RAIL_TOP + minToPx(t - DAY_START, hourPx)

/** 9:00, 10:24, 13:05 — 24-hour, no leading zero. */
export function fmt(t: number): string {
  const h = Math.floor(t / 60)
  const m = t % 60
  return `${h}:${m < 10 ? '0' + m : m}`
}

export const fmtRange = (start: number, end: number) => `${fmt(start)} – ${fmt(end)}`

/** A block ended early when its recorded end lies strictly inside its planned span. */
export function endedEarly(b: Block): boolean {
  return b.endedAt !== undefined && b.endedAt > b.start && b.endedAt < b.start + b.dur
}

/** What really happened: a block that ended early stops at its recorded end. */
export function realEnd(b: Block): number {
  return b.endedAt !== undefined && endedEarly(b) ? b.endedAt : b.start + b.dur
}

export function currentBlock(blocks: Block[], now: number): Block | undefined {
  return blocks.find((b) => b.start <= now && now < realEnd(b))
}

export function nextBlock(blocks: Block[], now: number): Block | undefined {
  return blocks.filter((b) => b.start > now).sort((a, b) => a.start - b.start)[0]
}

/** The first block that a stretch from `start` lasting `dur` minutes would run into, judged by real ends. */
export function overlapping(blocks: Block[], start: number, dur: number): Block | undefined {
  return blocks.find((b) => b.start < start + dur && start < realEnd(b))
}

/**
 * The first quarter hour from now where a block of `dur` minutes fits between the others and ends by 19:00
 * (at 10:24 on the sample day, an hour fits at 11:30), or null when no such quarter hour is left today.
 */
export function firstFreeStart(blocks: Block[], now: number, dur: number): number | null {
  const latest = DAY_END - dur
  let s = Math.max(DAY_START, Math.ceil(now / STEP) * STEP)
  while (s <= latest) {
    const hit = overlapping(blocks, s, dur)
    if (!hit) return s
    s = Math.ceil(realEnd(hit) / STEP) * STEP
  }
  return null
}

/** The start a form offers when nothing is free: the next quarter hour, kept inside the day. */
export function fallbackStart(now: number, dur: number): number {
  return clamp(Math.ceil(now / STEP) * STEP, DAY_START, DAY_END - dur)
}
