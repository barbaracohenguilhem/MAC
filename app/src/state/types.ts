/** One of the six block fills; see `src/lib/blockColors.ts`. */
export type ColorKey = 'grey' | 'green' | 'blue' | 'yellow' | 'red' | 'purple'

/** Where an inbox item waits: rolled over into today, or given to a later day. */
export type Bucket = 'today' | 'tomorrow' | 'week' | 'someday'

/** A planned stretch of today. Every time is minutes since midnight. */
export interface Block {
  id: string
  title: string
  start: number
  dur: number
  color: ColorKey
  /** Set when the block really ended before its planned end; the rest of the plan shows as a ghost. */
  endedAt?: number
}

/** Something waiting for a time. It keeps its length and colour, which prefill the block it becomes. */
export interface InboxItem {
  id: string
  title: string
  minutes: number
  color: ColorKey
  bucket: Bucket
  /** A second line under the title, such as why it is waiting. */
  note?: string
}

export interface State {
  /** The day `blocks` belong to, as YYYY-MM-DD. */
  day: string
  blocks: Block[]
  inbox: InboxItem[]
}

export type Action =
  | { type: 'addBlock'; block: Block }
  | { type: 'updateBlock'; block: Block }
  | { type: 'removeBlock'; id: string }
  | { type: 'endBlock'; id: string; at: number }
  | { type: 'addInboxItem'; item: InboxItem }
  | { type: 'scheduleInboxItem'; id: string; block: Block }
  | { type: 'rollover'; day: string }
