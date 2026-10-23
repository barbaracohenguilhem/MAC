import * as React from 'react'

export interface Now {
  /** Minutes since midnight. */
  minutes: number
  date: Date
}

/** `?now=10:24` pins the clock to that minute, so a moment of the day can be looked at on purpose. */
function pinned(): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(new URLSearchParams(window.location.search).get('now') ?? '')
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

function read(): Now {
  const date = new Date()
  return { date, minutes: pinned() ?? date.getHours() * 60 + date.getMinutes() }
}

/** The calendar day of `d` as YYYY-MM-DD, in local time. */
export function dayKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

const NowContext = React.createContext<Now | null>(null)

/** One clock for the whole app; it ticks when the minute or the day changes. */
export function NowProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = React.useState(read)
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNow((prev) => {
        const next = read()
        return next.minutes === prev.minutes && dayKey(next.date) === dayKey(prev.date) ? prev : next
      })
    }, 10_000)
    return () => window.clearInterval(id)
  }, [])
  return <NowContext.Provider value={now}>{children}</NowContext.Provider>
}

export function useNow(): Now {
  const now = React.useContext(NowContext)
  if (!now) throw new Error('useNow must be used inside <NowProvider>')
  return now
}
