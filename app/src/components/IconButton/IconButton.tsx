import { cx } from '../../utils/cx'
import { Icon, type IconName } from '../Icon'
import './IconButton.css'

export interface IconButtonProps {
  /** The glyph from the Icon set. */
  icon: IconName
  /** Accessible name, applied as `aria-label`. Say what it does ("Close", "15 minutes later"), not what the icon is. */
  label: string
  /** `default` draws the icon in the foreground; `muted` in the muted grey, for Close. */
  variant?: 'default' | 'muted'
  /** Makes it a link to another screen instead of a button. */
  href?: string
  onClick?: () => void
  /** Dims the button and ignores presses. It stays focusable, so the stepper's limits are still announced. */
  disabled?: boolean
  className?: string
}

/** A bare 44px circle holding one icon: Close, Inbox, New block, the stepper's minus and plus. */
export function IconButton({ icon, label, variant = 'default', href, onClick, disabled = false, className }: IconButtonProps) {
  const classes = cx('tb-icon-button', `tb-icon-button--${variant}`, disabled && 'tb-icon-button--disabled', className)
  if (href) {
    return (
      <a href={href} aria-label={label} className={classes}>
        <Icon name={icon} />
      </a>
    )
  }
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={classes}
      onClick={disabled ? undefined : onClick}
    >
      <Icon name={icon} />
    </button>
  )
}
