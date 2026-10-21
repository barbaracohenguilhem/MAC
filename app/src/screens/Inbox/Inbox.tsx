import { ScreenHeader } from '../../components'
import { BUCKETS } from '../../lib/buckets'
import { paths } from '../../lib/router'
import { useStore } from '../../state/store'
import { cx } from '../../utils/cx'
import './Inbox.css'

/** Everything waiting for a time, by when it is meant for. A row opens Give it a time. */
export function Inbox() {
  const { state } = useStore()
  // a section shows only when it has items; the whole list gives way to the empty state when none do
  const groups = BUCKETS.map((b) => ({ ...b, items: state.inbox.filter((i) => i.bucket === b.key) })).filter(
    (g) => g.items.length > 0,
  )

  return (
    <div className="tb-screen">
      <ScreenHeader title="Inbox" closeHref={paths.today} />
      {groups.length > 0 ? (
        <div className="tb-inbox">
          {groups.map((g) => (
            <section key={g.key} className="tb-inbox__group" aria-labelledby={`inbox-${g.key}`}>
              <h2 id={`inbox-${g.key}`} className="tb-inbox__name type-caption text-muted">
                {g.name}
              </h2>
              {g.items.map((it) => (
                // a row with a note reads on two lines (60px); without one it is a single 56px line
                <a key={it.id} href={paths.schedule(it.id)} className={cx('tb-inbox__row', it.note && 'tb-inbox__row--note')}>
                  <span className="tb-inbox__text">
                    <span className="tb-inbox__title type-body">{it.title}</span>
                    {it.note && <span className="type-caption text-muted">{it.note}</span>}
                  </span>
                  <span className="tb-inbox__minutes type-caption text-muted">{it.minutes} min</span>
                </a>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <div className="tb-inbox tb-inbox--empty">
          <span className="type-body">Nothing waiting.</span>
          <span className="type-body-sm text-muted">Blocks you give to Tomorrow, This week or Someday collect here.</span>
        </div>
      )}
    </div>
  )
}
