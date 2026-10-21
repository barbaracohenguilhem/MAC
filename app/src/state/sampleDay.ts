import { uid } from '../utils/uid'
import type { State } from './types'

/** The day the design shows, so a first launch has something on the rail. Times are minutes since midnight. */
export function sampleDay(day: string): State {
  return {
    day,
    blocks: [
      // planned 7:30–8:30, really ended at 8:15
      { id: uid(), title: 'Morning run', start: 450, dur: 60, endedAt: 495, color: 'green' },
      { id: uid(), title: 'Deep work · proposal draft', start: 540, dur: 120, color: 'blue' },
      { id: uid(), title: 'Email', start: 660, dur: 30, color: 'grey' },
      { id: uid(), title: 'Lunch', start: 750, dur: 45, color: 'yellow' },
      { id: uid(), title: 'Design review', start: 840, dur: 90, color: 'purple' },
      { id: uid(), title: 'Admin', start: 960, dur: 60, color: 'grey' },
    ],
    inbox: [
      { id: uid(), title: 'Send invoice reminder', minutes: 15, color: 'grey', bucket: 'today', note: 'Not done yesterday' },
      { id: uid(), title: 'Call accountant', minutes: 30, color: 'red', bucket: 'tomorrow' },
      { id: uid(), title: 'Draft newsletter', minutes: 60, color: 'blue', bucket: 'tomorrow' },
      { id: uid(), title: 'Renew passport', minutes: 45, color: 'yellow', bucket: 'week' },
      { id: uid(), title: 'Plan Q4 offsite', minutes: 90, color: 'purple', bucket: 'week' },
      { id: uid(), title: 'Invoice October', minutes: 30, color: 'grey', bucket: 'week' },
      { id: uid(), title: 'Reorganize studio', minutes: 90, color: 'green', bucket: 'someday' },
      { id: uid(), title: 'Learn Rust', minutes: 60, color: 'grey', bucket: 'someday' },
    ],
  }
}
