import { cx } from '../../utils/cx'
import { Field } from '../Field'
import './OptionPills.css'

export interface Option<T extends string | number> {
  value: T
  label: string
  /** A fuller name for screen readers when the label is terse ("30" → "30 minutes"). */
  ariaLabel?: string
}

export interface OptionPillsProps<T extends string | number> {
  /** The caption over the row; it also names the group. */
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/**
 * A row of pill tabs for picking one of a few values (When, Minutes). The chosen one sits on a muted pill
 * in the foreground; the rest are quiet muted labels. Each is a 44px-tall toggle button.
 */
export function OptionPills<T extends string | number>({ label, options, value, onChange }: OptionPillsProps<T>) {
  return (
    <Field label={label}>
      <div role="group" aria-label={label} className="tb-option-pills">
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={on}
              aria-label={o.ariaLabel}
              className="tb-option-pills__option"
              onClick={() => onChange(o.value)}
            >
              <span className={cx('tb-option-pills__chip', 'type-nav', on && 'tb-option-pills__chip--on')}>{o.label}</span>
            </button>
          )
        })}
      </div>
    </Field>
  )
}
