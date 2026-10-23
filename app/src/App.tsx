import { useRoute, type Route } from './lib/router'
import { Focus } from './screens/Focus/Focus'
import { Inbox } from './screens/Inbox/Inbox'
import { NewBlock } from './screens/NewBlock/NewBlock'
import { Schedule } from './screens/Schedule/Schedule'
import { Today } from './screens/Today/Today'
import './App.css'

function screenFor(route: Route) {
  switch (route.name) {
    case 'today':
      return <Today />
    case 'new':
      return <NewBlock />
    case 'focus':
      return <Focus key={route.id ?? ''} id={route.id} />
    case 'inbox':
      return <Inbox />
    case 'schedule':
      return <Schedule key={route.id} id={route.id} />
  }
}

export function App() {
  return <div className="tb-app">{screenFor(useRoute())}</div>
}
