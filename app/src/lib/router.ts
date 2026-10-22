import * as React from 'react'

export type Route =
  | { name: 'today' }
  | { name: 'new' }
  | { name: 'focus'; id?: string }
  | { name: 'inbox' }
  | { name: 'schedule'; id: string }

/** Every screen is a hash, so links stay plain `<a href>` and the back button works. */
export const paths = {
  today: '#/',
  newBlock: '#/new',
  /** One block's countdown; with no id, whichever block is in progress. */
  focus: (id?: string) => (id ? `#/focus/${encodeURIComponent(id)}` : '#/focus'),
  inbox: '#/inbox',
  schedule: (id: string) => `#/inbox/${encodeURIComponent(id)}`,
}

/** A hash can come from anywhere (a pasted link, history), so a malformed escape is no id rather than a crash. */
function decode(segment: string): string | null {
  try {
    return decodeURIComponent(segment)
  } catch {
    return null
  }
}

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  if (path === '/new') return { name: 'new' }
  if (path === '/focus') return { name: 'focus' }
  if (path === '/inbox') return { name: 'inbox' }
  const block = /^\/focus\/(.+)$/.exec(path)
  if (block) return { name: 'focus', id: decode(block[1]) ?? undefined }
  const item = /^\/inbox\/(.+)$/.exec(path)
  if (item) {
    const id = decode(item[1])
    return id === null ? { name: 'inbox' } : { name: 'schedule', id }
  }
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
