import { describe, expect, it } from 'vitest'
import { parseRoute, paths } from './router'

describe('parseRoute', () => {
  it('reads every screen', () => {
    expect(parseRoute('')).toEqual({ name: 'today' })
    expect(parseRoute('#/new')).toEqual({ name: 'new' })
    expect(parseRoute('#/focus')).toEqual({ name: 'focus' })
    expect(parseRoute('#/inbox')).toEqual({ name: 'inbox' })
  })

  it('round-trips block and item ids', () => {
    expect(parseRoute(paths.focus('a/b c'))).toEqual({ name: 'focus', id: 'a/b c' })
    expect(parseRoute(paths.schedule('a/b c'))).toEqual({ name: 'schedule', id: 'a/b c' })
  })

  it('treats a malformed escape as no id instead of throwing', () => {
    expect(parseRoute('#/inbox/%')).toEqual({ name: 'inbox' })
    expect(parseRoute('#/focus/%E0%A4%A')).toEqual({ name: 'focus' })
  })
})
