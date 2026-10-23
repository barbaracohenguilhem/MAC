import * as React from 'react'

/** Moves focus to the element when its screen opens, so a screen reader starts there. */
export function useFocusOnMount<T extends HTMLElement>(enabled = true) {
  const ref = React.useRef<T>(null)
  React.useEffect(() => {
    if (enabled) ref.current?.focus({ preventScroll: true })
  }, [enabled])
  return ref
}
