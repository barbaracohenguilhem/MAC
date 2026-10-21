import type * as React from 'react'
import './Field.css'

export interface FieldProps {
  /** The caption over the control ("Title", "Minutes"). */
  label: string
  /** The control's id. With it the caption is the control's `<label>`; without it the control names itself, as a group does with `aria-label`. */
  htmlFor?: string
  children: React.ReactNode
}

/** A muted caption stacked 8px over its control. */
export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="tb-field">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="type-caption text-muted">
          {label}
        </label>
      ) : (
        <span className="type-caption text-muted">{label}</span>
      )}
      {children}
    </div>
  )
}
