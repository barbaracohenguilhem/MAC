import * as React from 'react'

export type Route =
  | { name: 'today' }
  | { name: 'new' }
  | { name: 'focus' }
  | { name: 'inbox' }
  | { name: 'schedule'; id: string }

/** Every screen is a hash, so links stay plain `<a href>` and the back button works. */
export const paths = {
  today: '#/',
  newBlock: '#/new',
  focus: '#/focus',
  inbox: '#/inbox',
  schedule: (id: string) => `#/inbox/${encodeURIComponent(id)}`,
}

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  if (path === '/new') return { name: 'new' }
  if (path === '/focus') return { name: 'focus' }
  if (path === '/inbox') return { name: 'inbox' }
  const item = /^\/inbox\/(.+)$/.exec(path)
  if (item) return { name: 'schedule', id: decodeURIComponent(item[1]) }
  return { name: 'today' }
}

const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('hashchange', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('hashchange', onChange)
  }
}

export function useRoute(): Route {
  const hash = React.useSyncExternalStore(subscribe, () => window.location.hash)
  return React.useMemo(() => parseRoute(hash), [hash])
}

/** Goes to a screen. `replace` swaps the current history entry, for screens that should not be returned to. */
export function navigate(to: string, { replace = false } = {}) {
  if (replace) window.location.replace(to)
  else window.location.hash = to.replace(/^#/, '')
  // `hashchange` arrives later; telling the app now renders the new screen together with any state change
  // made alongside it, so the screen being left never sees that change (Schedule losing its item, say)
  listeners.forEach((onChange) => onChange())
}
