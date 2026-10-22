import * as React from 'react'
import { Button, ColorSwatches, Field, OptionPills, ScreenHeader, StartStepper, TextField } from '../../components'
import { bucketName } from '../../lib/buckets'
import { useNow } from '../../lib/now'
import { navigate, paths } from '../../lib/router'
import { DURATIONS, fallbackStart, firstFreeStart } from '../../lib/time'
import { useStore } from '../../state/store'
import type { InboxItem } from '../../state/types'
import { uid } from '../../utils/uid'
import { useBlockDraft } from '../useBlockDraft'

const MINUTE_OPTIONS = DURATIONS.map((m) => ({ value: m, label: String(m), ariaLabel: `${m} minutes` }))

/** "Give it a time": an Inbox item, prefilled, placed on today's rail. */
export function Schedule({ id }: { id: string }) {
  const { state } = useStore()
  const item = state.inbox.find((i) => i.id === id)
  React.useEffect(() => {
    if (!item) navigate(paths.inbox, { replace: true })
  }, [item])
  return item ? <ScheduleForm item={item} /> : null
}

function ScheduleForm({ item }: { item: InboxItem }) {
  const { state, dispatch } = useStore()
  const { minutes: now } = useNow()
  // the item keeps its length and colour; it lands at the first quarter hour after now where it fits,
  // or, when today has no such gap left, at the next quarter hour for the stepper to move
  const { draft, setTitle, setStart, setDur, setColor } = useBlockDraft(() => ({
    title: item.title,
    dur: item.minutes,
    color: item.color,
    start: firstFreeStart(state.blocks, now, item.minutes) ?? fallbackStart(now, item.minutes),
  }))
  const title = draft.title.trim()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    navigate(paths.today)
    dispatch({
      type: 'scheduleInboxItem',
      id: item.id,
      block: { id: uid(), title, start: draft.start, dur: draft.dur, color: draft.color },
    })
  }

  return (
    <form className="tb-screen tb-screen--scroll" onSubmit={submit}>
      <ScreenHeader title="Give it a time" subtitle={`From ${bucketName(item.bucket)}`} closeHref={paths.inbox} />
      <div className="tb-screen__body">
        <TextField id="block-title" label="Title" value={draft.title} onChange={setTitle} placeholder="What will you do?" />
        <StartStepper start={draft.start} dur={draft.dur} onChange={setStart} />
        <OptionPills label="Minutes" options={MINUTE_OPTIONS} value={draft.dur} onChange={setDur} />
        <Field label="Color">
          <ColorSwatches inset value={draft.color} onChange={setColor} />
        </Field>
      </div>
      <div className="tb-screen__footer">
        <Button type="submit" fullWidth disabled={!title}>
          Add to today
        </Button>
      </div>
    </form>
  )
}
