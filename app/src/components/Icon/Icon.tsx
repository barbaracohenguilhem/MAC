const PATHS = {
  close: ['M3 3l12 12M15 3L3 15'],
  plus: ['M9 2v14M2 9h14'],
  minus: ['M2 9h14'],
  inbox: ['M2.5 10.5l2-6h9l2 6v4h-13z', 'M2.5 10.5h4l1 2h3l1-2h4'],
} satisfies Record<string, string[]>

export type IconName = keyof typeof PATHS

export interface IconProps {
  /** The glyph: `close`, `plus`, `minus` or `inbox`. */
  name: IconName
}

/** An 18px, 1.5px-stroke glyph in the current text colour. Always decorative: the control around it carries the name. */
export function Icon({ name }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
