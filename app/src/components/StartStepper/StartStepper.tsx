import { DAY_END, DAY_START, STEP, fmt } from '../../lib/time'
import { IconButton } from '../IconButton'
import './StartStepper.css'

export interface StartStepperProps {
  /** Minutes since midnight. */
  start: number
  /** The block's length, which sets its end and the latest start that still ends by 19:00. */
  dur: number
  onChange: (start: number) => void
  /** A short warning read after the end time, such as the block this one would overlap. */
  note?: string
}

/** The start time read out large, with its end under it, and minus/plus buttons that move it by a quarter hour within 7:00–19:00. */
export function StartStepper({ start, dur, onChange, note }: StartStepperProps) {
  const latest = DAY_END - dur
  const atStart = start <= DAY_START
  const atEnd = start >= latest
  return (
    <div className="tb-start-stepper">
      <div className="tb-start-stepper__readout">
        <span className="type-caption text-muted">Start</span>
        <span aria-live="polite" className="type-subheading">
          {fmt(start)}
        </span>
        <span aria-live="polite" className="type-caption text-muted">
          Ends {fmt(start + dur)}
          {note && ` · ${note}`}
        </span>
      </div>
      <div className="tb-start-stepper__buttons">
        <IconButton
          icon="minus"
          label="15 minutes earlier"
          disabled={atStart}
          onClick={() => onChange(Math.max(DAY_START, start - STEP))}
        />
        <IconButton
          icon="plus"
          label="15 minutes later"
          disabled={atEnd}
          onClick={() => onChange(Math.min(latest, start + STEP))}
        />
      </div>
    </div>
  )
}
