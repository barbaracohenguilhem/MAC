import type { ColorKey } from '../state/types'

export interface BlockColor {
  key: ColorKey
  name: string
  fill: string
  /** The fill mixed 50/50 with the white ground: finished blocks are told apart by their paler fill only. */
  past: string
}

/** Six fills at one OKLCH lightness and chroma (L 0.905, C 0.040; grey near-neutral). All text on them is the foreground. */
export const BLOCK_COLORS: BlockColor[] = [
  { key: 'grey', name: 'Grey', fill: '#E1DFDC', past: '#F0EFEE' },
  { key: 'green', name: 'Green', fill: '#D0E7D0', past: '#E8F3E8' },
  { key: 'blue', name: 'Blue', fill: '#D1E0FB', past: '#E8F0FD' },
  { key: 'yellow', name: 'Yellow', fill: '#EBDFC2', past: '#F5EFE0' },
  { key: 'red', name: 'Red', fill: '#F9D6D2', past: '#FCEBE8' },
  { key: 'purple', name: 'Purple', fill: '#E6DAF6', past: '#F2ECFB' },
]

export function blockColor(key: ColorKey): BlockColor {
  return BLOCK_COLORS.find((c) => c.key === key) ?? BLOCK_COLORS[0]
}
