import { useFocusOnMount } from '../../lib/useFocusOnMount'
import { cx } from '../../utils/cx'
import { IconButton } from '../IconButton'
import './ScreenHeader.css'

export interface ScreenHeaderProps {
  title: string
  /** A muted line under the title ("From Tomorrow", "9:00 – 11:00"). */
  subtitle?: string
  /** Where Close goes. */
  closeHref: string
  /** Drops the 8px under the header, for a screen whose content brings its own space (Focus). */
  flush?: boolean
  /** Whether the title takes focus when the screen opens. Off where a field should have it instead. */
  focusTitle?: boolean
}

/** The top of every screen but Today: a 20px title, an optional muted line, and Close at the right. */
export function ScreenHeader({ title, subtitle, closeHref, flush = false, focusTitle = true }: ScreenHeaderProps) {
  const titleRef = useFocusOnMount<HTMLHeadingElement>(focusTitle)
  const heading = (
    <h1 ref={titleRef} tabIndex={-1} className="type-subheading">
      {title}
    </h1>
  )
  return (
    <header className={cx('tb-screen-header', subtitle && 'tb-screen-header--stacked', flush && 'tb-screen-header--flush')}>
      {subtitle ? (
        <div className="tb-screen-header__titles">
          {heading}
          <span className="type-body-sm text-muted">{subtitle}</span>
        </div>
      ) : (
        heading
      )}
      <IconButton href={closeHref} icon="close" label="Close" variant="muted" className="tb-screen-header__close" />
    </header>
  )
}
