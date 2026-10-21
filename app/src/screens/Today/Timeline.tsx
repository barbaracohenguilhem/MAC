import * as React from 'react'
import { ColorSwatches } from '../../components'
import { blockColor } from '../../lib/blockColors'
import { paths } from '../../lib/router'
import {
  DAY_END,
  DAY_START,
  HOUR_PX,
  RAIL_TOP,
  STEP,
  clamp,
  currentBlock,
  endedEarly,
  fmt,
  fmtRange,
  minToPx,
  nextBlock,
  pxToMin,
  railY,
  realEnd,
} from '../../lib/time'
import { useStore } from '../../state/store'
import type { Block } from '../../state/types'
import { cx } from '../../utils/cx'
import { uid } from '../../utils/uid'
import { step, type Drag } from './gesture'
import './Timeline.css'

const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i)
/** Room under 19:00's line for its label. */
const RAIL_FOOT = 16
/** An hour never shrinks below this; under it the rail scrolls instead. */
const MIN_HOUR_PX = 36
/** The action pill floats 40px off the bottom and is 56px tall; a selected block reaching into it sends the pill up under the header. */
const PILL_CLEARANCE = 40 + 56 + 8

export interface TimelineProps {
  blocks: Block[]
  /** Minutes since midnight. */
  now: number
}

/**
 * The day from 7:00 to 19:00. Press and drag on empty time to draw a block; drag a block to move it;
 * tap it to select it, then drag its handle to resize, or recolour or delete it from the pill.
 */
export function Timeline({ blocks, now }: TimelineProps) {
  const { dispatch } = useStore()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const railRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<Drag | null>(null)
  // a press that really moved a block must not also open Focus from the block's link
  const lastMoved = React.useRef(false)
  const [drag, setDrag] = React.useState<Drag | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [view, setView] = React.useState({ height: 0, scrollTop: 0 })

  React.useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () =>
      setView((v) =>
        v.height === el.clientHeight && v.scrollTop === el.scrollTop ? v : { height: el.clientHeight, scrollTop: el.scrollTop },
      )
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    el.addEventListener('scroll', measure, { passive: true })
    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', measure)
    }
  }, [])

  // the whole day fits at full size on an 844px phone; a shorter screen shrinks the hour rather than hide the evening
  const hourPx = view.height ? clamp((view.height - RAIL_TOP - RAIL_FOOT) / 12, MIN_HOUR_PX, HOUR_PX) : HOUR_PX
  const y = (t: number) => railY(t, hourPx)

  const finish = (d: Drag) => {
    lastMoved.current = d.moved
    if (d.mode === 'move' && !d.moved && d.base) {
      // a press without movement on a block is a tap: it selects the block, or lets it go
      const id = d.base.id
      setSelectedId((cur) => (cur === id ? null : id))
    } else if (d.fresh && d.preview) {
      dispatch({ type: 'addBlock', block: d.preview })
      // a freshly drawn block stays selected so it can be coloured, resized again or deleted
      if (d.moved) setSelectedId(d.preview.id)
    } else if (d.moved && d.preview) {
      dispatch({ type: 'updateBlock', block: d.preview })
    }
  }

  const dragging = drag !== null
  React.useLayoutEffect(() => {
    if (!dragging) return
    const move = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      const next = step(d, e.clientY, uid)
      if (next === d) return
      dragRef.current = next
      setDrag(next)
    }
    const up = () => {
      const d = dragRef.current
      dragRef.current = null
      setDrag(null)
      if (d) finish(d)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    // `finish` only reaches stable setters and refs, so the listeners can keep the first one
  }, [dragging])

  const begin = (d: Drag) => {
    dragRef.current = d
    setDrag(d)
  }

  const pressBlock = (e: React.PointerEvent, b: Block, mode: 'move' | 'resize') => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    begin({ mode, y0: e.clientY, start0: b.start, dur0: b.dur, hourPx, base: b, fresh: false, moved: false, preview: null })
  }

  const pressRail = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !railRef.current) return
    e.preventDefault()
    // a press on empty time while a block is selected only clears the selection
    if (selectedId !== null) {
      setSelectedId(null)
      return
    }
    const top = railRef.current.getBoundingClientRect().top
    const slot = Math.floor(pxToMin(e.clientY - top - RAIL_TOP, hourPx) / STEP) * STEP
    const start = clamp(DAY_START + slot, DAY_START, DAY_END - STEP)
    // nothing is added yet: the block appears on the first movement
    begin({ mode: 'create', y0: e.clientY, start0: start, dur0: STEP, hourPx, base: null, fresh: false, moved: false, preview: null })
  }

  const keyBlock = (e: React.KeyboardEvent<HTMLDivElement>, b: Block) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedId((cur) => (cur === b.id ? null : b.id))
    } else if (e.key === 'Escape') {
      setSelectedId(null)
    }
  }

  const openFocus = (e: React.MouseEvent) => {
    if (lastMoved.current) e.preventDefault()
  }

  const preview = drag?.preview ?? null
  const shown = blocks.map((b) => (preview && b.id === preview.id ? preview : b))
  if (preview && drag?.fresh) shown.push(preview)
  const draggedId = drag?.base?.id ?? null
  const selected = shown.find((b) => b.id === selectedId) ?? null
  const pillAtTop =
    !!selected && view.height > 0 && y(selected.start + selected.dur) - view.scrollTop > view.height - PILL_CLEARANCE

  const current = currentBlock(shown, now)
  const next = nextBlock(shown, now)
  const nowVisible = now >= DAY_START && now <= DAY_END
  const nowY = y(now)
  const lastEnd = shown.reduce((m, b) => Math.max(m, realEnd(b)), 0)
  // when the day really ends 90 minutes or more before 19:00, say so once, under the last block
  const showAside = shown.length > 0 && DAY_END - lastEnd >= 90

  return (
    <>
      <div ref={scrollRef} className="tb-timeline">
        <div ref={railRef} className="tb-timeline__rail" style={{ height: y(DAY_END) + RAIL_FOOT }} onPointerDown={pressRail}>
          {HOURS.map((h, i) => {
            const top = RAIL_TOP + i * hourPx
            // an hour's label gives way to the now label where they would overlap
            const covered = nowVisible && Math.abs(top - nowY) < 16
            return (
              <React.Fragment key={h}>
                {!covered && (
                  <span className="tb-timeline__hour type-caption text-muted" style={{ top: top - 8 }}>
                    {h}
                  </span>
                )}
                <div className="tb-timeline__line" style={{ top }} />
              </React.Fragment>
            )
          })}

          {shown.map((b) => {
            const c = blockColor(b.color)
            const plannedEnd = b.start + b.dur
            const ghost = endedEarly(b)
            // what really happened: the filled part runs to the real end; the planned rest is only a ghost
            const end = realEnd(b)
            const past = end <= now
            const isCurrent = b.start <= now && now < end
            const isDragged = b.id === draggedId
            const resizing = isDragged && drag?.mode === 'resize'
            const isSelected = b.id === selectedId
            // the 2px gap to the next block sits at the planned end, so a ghosted block keeps it on its ghost
            const height = minToPx(end - b.start, hourPx) - (ghost ? 0 : 2)
            const tall = end - b.start > 45
            const micro = height < 20
            const range = fmtRange(b.start, plannedEnd)
            const left = `${end - now} min left`
            const status = isCurrent ? ', in progress' : past ? `, finished${ghost ? ` at ${fmt(end)}` : ''}` : ''
            // SceneSnap: no edge and no shadow at rest; shadow-md while dragging; the selection ring while selected
            const shadow = [isSelected && 'var(--ring-selected)', isDragged && 'var(--shadow-md)'].filter(Boolean).join(', ') || 'none'
            // later start on top; same start: shorter on top; selected above resting; dragged above all
            const z =
              10 +
              2 * Math.round((b.start - DAY_START) / STEP) +
              (b.dur <= 45 ? 1 : 0) +
              (isSelected ? 100 : 0) +
              (isDragged ? 300 : 0)
            return (
              <div
                key={b.id}
                role="button"
                tabIndex={0}
                aria-label={`${b.title}, ${range}${status}`}
                aria-pressed={isSelected}
                className={cx('tb-block', tall ? 'tb-block--tall' : 'tb-block--row', micro && 'tb-block--micro', ghost && 'tb-block--ghosted')}
                style={
                  {
                    top: y(b.start),
                    height,
                    zIndex: z,
                    background: past ? c.past : c.fill,
                    '--tb-block-shadow': shadow,
                  } as React.CSSProperties
                }
                onPointerDown={(e) => pressBlock(e, b, 'move')}
                onKeyDown={(e) => keyBlock(e, b)}
              >
                <span className="tb-block__title">{b.title}</span>
                {/* no times inside blocks at rest: the range reads out only while resizing, as gesture feedback */}
                {!tall && !micro && resizing && <span className="tb-block__caption type-caption">{range}</span>}
                {!tall && !micro && isCurrent && (
                  <a href={paths.focus} className="tb-block__left type-body-sm" onClick={openFocus}>
                    {left}
                  </a>
                )}
                {tall && resizing && <span className="type-caption">{range}</span>}
                {tall && isCurrent && (
                  <a href={paths.focus} className="tb-block__left tb-block__left--fill type-body-sm" onClick={openFocus}>
                    {left}
                  </a>
                )}
                {ghost && (
                  <div aria-hidden="true" className="tb-block__ghost" style={{ height: minToPx(plannedEnd - end, hourPx) - 2 }} />
                )}
                {isSelected && (
                  <div aria-hidden="true" className="tb-block__handle" onPointerDown={(e) => pressBlock(e, b, 'resize')}>
                    <span className="tb-block__handle-dot" />
                  </div>
                )}
              </div>
            )
          })}

          {nowVisible && !current && next && (
            <span className="tb-timeline__free type-caption text-muted" style={{ top: nowY - 18 }}>
              Free until {fmt(next.start)} · {next.title}
            </span>
          )}
          {nowVisible && (
            <>
              <span className="tb-timeline__now-label type-caption" style={{ top: nowY - 8 }}>
                {fmt(now)}
              </span>
              <div className="tb-timeline__now-line" style={{ top: nowY }} />
            </>
          )}
          {showAside && (
            <span className="tb-timeline__aside type-body-sm text-muted" style={{ top: y(lastEnd) + 16 }}>
              Nothing after {fmt(lastEnd)}.
            </span>
          )}
        </div>
      </div>

      {selected && (
        <div
          role="group"
          aria-label="Selected block"
          className={cx('tb-action-pill', pillAtTop ? 'tb-action-pill--top' : 'tb-action-pill--bottom')}
        >
          <ColorSwatches
            value={selected.color}
            onChange={(color) => dispatch({ type: 'updateBlock', block: { ...selected, color } })}
          />
          <span aria-hidden="true" className="tb-action-pill__divider" />
          <button
            type="button"
            className="tb-action-pill__delete type-control"
            onClick={() => {
              dispatch({ type: 'removeBlock', id: selected.id })
              setSelectedId(null)
            }}
          >
            Delete
          </button>
        </div>
      )}
    </>
  )
}
