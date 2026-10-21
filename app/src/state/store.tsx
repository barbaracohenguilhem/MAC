import * as React from 'react'
import { dayKey, useNow } from '../lib/now'
import { reducer } from './reducer'
import { sampleDay } from './sampleDay'
import type { Action, State } from './types'

const STORAGE_KEY = 'time-block/v1'

function load(day: string): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as State
      if (typeof saved.day === 'string' && Array.isArray(saved.blocks) && Array.isArray(saved.inbox)) {
        return reducer(saved, { type: 'rollover', day })
      }
    }
  } catch {
    // unreadable storage starts the app afresh
  }
  return sampleDay(day)
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

  const store = React.useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = React.useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}
