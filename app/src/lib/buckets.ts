import type { Bucket } from '../state/types'

/** The Inbox's sections, in order, and the words the forms use for each. */
export const BUCKETS: Array<{ key: Bucket; name: string; save: string }> = [
  { key: 'today', name: 'Today', save: 'Add to today' },
  { key: 'tomorrow', name: 'Tomorrow', save: 'Add to tomorrow' },
  { key: 'week', name: 'This week', save: 'Add to this week' },
  { key: 'someday', name: 'Someday', save: 'Add to someday' },
]

export function bucketName(key: Bucket): string {
  return BUCKETS.find((b) => b.key === key)?.name ?? ''
}
