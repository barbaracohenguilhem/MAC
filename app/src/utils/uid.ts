/** A random id for a block or an inbox item. `randomUUID` is missing outside secure contexts (a LAN address over http). */
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}
