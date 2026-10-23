import * as React from 'react'
import { cx } from '../../utils/cx'
import './Button.css'

export type ButtonVariant = 'primary' | 'outline'

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /** `primary` is the one filled action per view (the black pill); `outline` is a quieter pill with a 1px ink edge. */
  variant?: ButtonVariant
  /** Stretches the button to fill its container's width. */
  fullWidth?: boolean
}

/**
 * Button is a 48px pill. Use one `primary` per screen. Disabled, it turns to the muted fill and label
 * until it can act (the forms' save button before a title is typed).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', fullWidth = false, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('tb-button', `tb-button--${variant}`, fullWidth && 'tb-button--full', 'type-control', className)}
      {...rest}
    />
  )
})
