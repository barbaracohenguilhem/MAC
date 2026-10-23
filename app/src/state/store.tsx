import * as React from 'react'
import { dayKey, useNow } from '../lib/now'
import { reducer } from './reducer'
import { sampleDay } from './sampleDay'
import type { Action, State } from './types'

const STORAGE_KEY = 'time-block/v1'

/** A saved state, or null when there is none or it is unreadable. */
function parse(raw: string | null): State | null {
  if (!raw) return null
  try {
    const saved = JSON.parse(raw) as State
    if (typeof saved.day === 'string' && Array.isArray(saved.blocks) && Array.isArray(saved.inbox)) return saved
  } catch {
    // unreadable storage counts as none
  }
  return null
}

function load(day: string): State {
  let saved: State | null = null
  try {
    saved = parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    // storage refused (a locked-down private window): start afresh
  }
  return saved ? reducer(saved, { type: 'rollover', day }) : sampleDay(day)
}

interface Store {
  state: State
  dispatch: React.Dispatch<Action>
}

const StoreContext = React.createContext<Store | null>(null)

/** The day's blocks and the inbox, kept in this browser's storage. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const day = dayKey(useNow().date)
  const [state, dispatch] = React.useReducer(reducer, day, load)

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // private windows may refuse storage; the app still works for this visit
    }
  }, [state])

  React.useEffect(() => {
    dispatch({ type: 'rollover', day })
  }, [day])

  // Each save writes the whole state, so a tab must take on what another tab saved before it saves again,
  // or its stale copy would erase that tab's edits. Saving the adopted state back writes the same value,
  // which raises no further event.
  React.useEffect(() => {
    const adopt = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const saved = parse(e.newValue)
      if (saved) dispatch({ type: 'replace', state: saved })
    }
    window.addEventListener('storage', adopt)
    return () => window.removeEventListener('storage', adopt)
  }, [])

  const store = React.useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = React.useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}
