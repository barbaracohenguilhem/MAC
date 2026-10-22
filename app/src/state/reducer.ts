import type { Action, State } from './types'

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addBlock':
      return { ...state, blocks: [...state.blocks, action.block] }
    case 'updateBlock':
      return { ...state, blocks: state.blocks.map((b) => (b.id === action.block.id ? action.block : b)) }
    case 'removeBlock':
      return { ...state, blocks: state.blocks.filter((b) => b.id !== action.id) }
    case 'endBlock':
      return {
        ...state,
        blocks: state.blocks.flatMap((b) => {
          if (b.id !== action.id) return [b]
          // ending a block before it began cancels it; ending it on time changes nothing
          if (action.at <= b.start) return []
          if (action.at >= b.start + b.dur) return [b]
          return [{ ...b, endedAt: action.at }]
        }),
      }
    case 'addInboxItem':
      return { ...state, inbox: [...state.inbox, action.item] }
    case 'scheduleInboxItem':
      return {
        ...state,
        inbox: state.inbox.filter((i) => i.id !== action.id),
        blocks: [...state.blocks, action.block],
      }
    case 'rollover':
      if (action.day === state.day) return state
      // a new day starts with an empty rail; what was given to tomorrow is now today's
      return {
        day: action.day,
        blocks: [],
        inbox: state.inbox.map((i) => (i.bucket === 'tomorrow' ? { ...i, bucket: 'today' } : i)),
      }
    case 'replace':
      // a tab still on an earlier day saved; carry its state forward to this tab's day (YYYY-MM-DD sorts as dates)
      return action.state.day < state.day ? reducer(action.state, { type: 'rollover', day: state.day }) : action.state
  }
}
