import * as React from 'react'
import { Button, ColorSwatches, Field, OptionPills, ScreenHeader, StartStepper, TextField } from '../../components'
import { BUCKETS } from '../../lib/buckets'
import { useNow } from '../../lib/now'
import { navigate, paths } from '../../lib/router'
import { DURATIONS, fallbackStart, firstFreeStart, overlapping } from '../../lib/time'
import { useStore } from '../../state/store'
import type { Bucket } from '../../state/types'
import { uid } from '../../utils/uid'
import { useBlockDraft } from '../useBlockDraft'

const WHEN_OPTIONS = BUCKETS.map((b) => ({ value: b.key, label: b.name }))
const MINUTE_OPTIONS = DURATIONS.map((m) => ({ value: m, label: String(m), ariaLabel: `${m} minutes` }))

/** A block for today, at the first free quarter hour after now, or one handed to the Inbox for later. */
export function NewBlock() {
  const { state, dispatch } = useStore()
  const { minutes: now } = useNow()
  const [free] = React.useState(() => firstFreeStart(state.blocks, now, 60))
  // with no free hour left on today's rail, the block is offered to tomorrow instead
  const [when, setWhen] = React.useState<Bucket>(free === null ? 'tomorrow' : 'today')
  const { draft, setTitle, setStart, setDur, setColor } = useBlockDraft(() => ({
    title: '',
    dur: 60,
    color: 'grey',
    start: free ?? fallbackStart(now, 60),
  }))
  const title = draft.title.trim()
  // the rail allows overlaps, but a form should never place one silently
  const clash = overlapping(state.blocks, draft.start, draft.dur)
  const saveLabel = BUCKETS.find((b) => b.key === when)?.save

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    if (when === 'today') {
      navigate(paths.today)
      dispatch({ type: 'addBlock', block: { id: uid(), title, start: draft.start, dur: draft.dur, color: draft.color } })
    } else {
      navigate(paths.inbox)
      dispatch({ type: 'addInboxItem', item: { id: uid(), title, minutes: draft.dur, color: draft.color, bucket: when } })
    }
  }

  return (
    <form className="tb-screen tb-screen--scroll" onSubmit={submit}>
      <ScreenHeader title="New block" closeHref={paths.today} focusTitle={false} />
      <div className="tb-screen__body">
        <TextField
          id="block-title"
          label="Title"
          value={draft.title}
          onChange={setTitle}
          placeholder="What will you do?"
          autoFocus
        />
        <OptionPills label="When" options={WHEN_OPTIONS} value={when} onChange={setWhen} />
        {when === 'today' ? (
          <StartStepper
            start={draft.start}
            dur={draft.dur}
            onChange={setStart}
            note={clash && `Overlaps ${clash.title}`}
          />
        ) : (
          <p className="tb-screen__note type-body-sm text-muted">It waits in the Inbox until you give it a time.</p>
        )}
        <OptionPills label="Minutes" options={MINUTE_OPTIONS} value={draft.dur} onChange={setDur} />
        <Field label="Color">
          <ColorSwatches inset value={draft.color} onChange={setColor} />
        </Field>
      </div>
      <div className="tb-screen__footer">
        {/* the muted pill until there is a title; Enter in the title saves once there is */}
        <Button type="submit" fullWidth disabled={!title}>
          {saveLabel}
        </Button>
      </div>
    </form>
  )
}
