import { BLOCK_COLORS } from '../../lib/blockColors'
import type { ColorKey } from '../../state/types'
import { cx } from '../../utils/cx'
import './ColorSwatches.css'

export interface ColorSwatchesProps {
  value: ColorKey
  onChange: (value: ColorKey) => void
  /** Pulls the row 8px left so the first dot, not its 44px target, lines up with the text above. */
  inset?: boolean
}

/** The six block fills as 28px dots in 44px targets. The chosen one wears the selection ring; the rest a hairline. */
export function ColorSwatches({ value, onChange, inset = false }: ColorSwatchesProps) {
  return (
    <div role="group" aria-label="Block color" className={cx('tb-color-swatches', inset && 'tb-color-swatches--inset')}>
      {BLOCK_COLORS.map((c) => {
        const on = c.key === value
        return (
          <button
            key={c.key}
            type="button"
            aria-label={c.name}
            aria-pressed={on}
            className="tb-color-swatches__swatch"
            onClick={() => onChange(c.key)}
          >
            <span
              aria-hidden="true"
              className={cx('tb-color-swatches__dot', on && 'tb-color-swatches__dot--on')}
              style={{ background: c.fill }}
            />
          </button>
        )
      })}
    </div>
  )
}
