import * as React from 'react'
import { Button, ScreenHeader } from '../../components'
import { useNow } from '../../lib/now'
import { navigate, paths } from '../../lib/router'
import { currentBlock, fmt, fmtRange, nextBlock, realEnd } from '../../lib/time'
import { useStore } from '../../state/store'
import './Focus.css'

/** The block in progress, counting down. Ending it early keeps the rest of its plan as a ghost on Today. */
export function Focus() {
  const { state, dispatch } = useStore()
  const { minutes: now } = useNow()
  const block = currentBlock(state.blocks, now)
  // nothing in progress (it ended, or Focus was opened between blocks): back to the day
  React.useEffect(() => {
    if (!block) navigate(paths.today, { replace: true })
  }, [block])
  if (!block) return null

  const end = realEnd(block)
  const left = end - now
  const next = nextBlock(state.blocks, now)
  const endNow = () => {
    navigate(paths.today, { replace: true })
    dispatch({ type: 'endBlock', id: block.id, at: now })
  }

  return (
    <div className="tb-screen">
      <ScreenHeader title={block.title} subtitle={fmtRange(block.start, block.start + block.dur)} closeHref={paths.today} flush />
      <div className="tb-focus__count">
        <span className="tb-focus__minutes">{left}</span>
        <span className="type-body-sm text-muted">min left</span>
      </div>
      <div className="tb-focus__foot">
        {/* what is left of the block, draining toward the right */}
        <div aria-hidden="true" className="tb-focus__track">
          <div className="tb-focus__fill" style={{ width: `${(left / (end - block.start)) * 100}%` }} />
        </div>
        <div className="tb-focus__next-row">
          {next && (
            <div className="tb-focus__next">
              <span className="type-caption text-muted">Next</span>
              <span className="tb-focus__next-title type-body">
                {next.title} · {fmt(next.start)}
              </span>
            </div>
          )}
          <Button variant="outline" className="tb-focus__end" onClick={endNow}>
            End now
          </Button>
        </div>
      </div>
    </div>
  )
}
