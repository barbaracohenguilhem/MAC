import { describe, expect, it } from 'vitest'
import { sampleDay } from '../state/sampleDay'
import { currentBlock, endedEarly, firstFreeStart, fmt, nextBlock, realEnd } from './time'

const at = (h: number, m: number) => h * 60 + m
const { blocks } = sampleDay('2026-10-15')
const titled = (title: string) => blocks.find((b) => b.title === title)!

describe('fmt', () => {
  it('writes 24-hour times without a leading zero', () => {
    expect(fmt(at(9, 0))).toBe('9:00')
    expect(fmt(at(10, 24))).toBe('10:24')
    expect(fmt(at(13, 5))).toBe('13:05')
  })
})

describe('realEnd', () => {
  it('stops a block that ended early at its recorded end', () => {
    const run = titled('Morning run')
    expect(endedEarly(run)).toBe(true)
    expect(realEnd(run)).toBe(at(8, 15))
  })

  it('keeps the planned end otherwise', () => {
    expect(realEnd(titled('Email'))).toBe(at(11, 30))
  })
})

describe('currentBlock and nextBlock', () => {
  it('read Deep work as in progress at 10:24, with Email next', () => {
    expect(currentBlock(blocks, at(10, 24))?.title).toBe('Deep work · proposal draft')
    expect(nextBlock(blocks, at(10, 24))?.title).toBe('Email')
  })

  it('treat a block as over once it really ended', () => {
    expect(currentBlock(blocks, at(8, 20))).toBeUndefined()
  })
})

describe('firstFreeStart', () => {
  it('finds 11:30 at 10:24 on the sample day, as the design shows', () => {
    expect(firstFreeStart(blocks, at(10, 24), 60)).toBe(at(11, 30))
    expect(firstFreeStart(blocks, at(10, 24), 30)).toBe(at(11, 30))
  })

  it('counts the time after an early end as free', () => {
    expect(firstFreeStart(blocks, at(7, 50), 30)).toBe(at(8, 15))
  })

  it('starts the day at 7:00', () => {
    expect(firstFreeStart([], at(5, 30), 60)).toBe(at(7, 0))
  })

  it('keeps the block inside the day', () => {
    expect(firstFreeStart([], at(18, 40), 60)).toBe(at(18, 0))
  })
})
