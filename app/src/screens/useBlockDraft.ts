import * as React from 'react'
import { DAY_END } from '../lib/time'
import type { ColorKey } from '../state/types'

export interface BlockDraft {
  title: string
  /** Minutes since midnight. */
  start: number
  dur: number
  color: ColorKey
}

/** The fields New block and Give it a time share. A longer block that would run past 19:00 pulls its start earlier. */
export function useBlockDraft(init: () => BlockDraft) {
  const [draft, setDraft] = React.useState(init)
  return {
    draft,
    setTitle: (title: string) => setDraft((d) => ({ ...d, title })),
    setStart: (start: number) => setDraft((d) => ({ ...d, start })),
    setDur: (dur: number) => setDraft((d) => ({ ...d, dur, start: Math.min(d.start, DAY_END - dur) })),
    setColor: (color: ColorKey) => setDraft((d) => ({ ...d, color })),
  }
}
