import { IconButton } from '../../components'
import { useNow } from '../../lib/now'
import { paths } from '../../lib/router'
import { useFocusOnMount } from '../../lib/useFocusOnMount'
import { useStore } from '../../state/store'
import { Timeline } from './Timeline'
import './Today.css'

/** The day on one rail, under its weekday in Petrona, with the Inbox and New block a tap away. */
export function Today() {
  const { state } = useStore()
  const now = useNow()
  const titleRef = useFocusOnMount<HTMLHeadingElement>()
  const waiting = state.inbox.length
  return (
    <div className="tb-screen">
      <header className="tb-today__header">
        <div className="tb-today__date">
          <h1 ref={titleRef} tabIndex={-1} className="tb-today__weekday">
            {now.date.toLocaleDateString('en-US', { weekday: 'long' })}
          </h1>
          <span className="type-body-sm text-muted">
            {now.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="tb-today__actions">
          <IconButton href={paths.inbox} icon="inbox" label={waiting ? `Inbox, ${waiting} waiting` : 'Inbox'} />
          <IconButton href={paths.newBlock} icon="plus" label="New block" />
        </div>
      </header>
      <Timeline blocks={state.blocks} now={now.minutes} />
    </div>
  )
}
