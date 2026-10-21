import * as React from 'react'
import { cx } from '../../utils/cx'
import { Field } from '../Field'
import './TextField.css'

export interface TextFieldProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'> {
  id: string
  /** The caption over the input; it is the input's `<label>`. */
  label: string
  value: string
  onChange: (value: string) => void
}

/** A 48px pill input under its caption: a hairline at rest, a darker 2px ring while focused. */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, value, onChange, className, type = 'text', ...rest },
  ref,
) {
  return (
    <Field label={label} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className={cx('tb-text-field', 'type-body', className)}
        {...rest}
      />
    </Field>
  )
})
