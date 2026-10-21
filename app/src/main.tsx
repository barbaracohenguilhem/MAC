import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { NowProvider } from './lib/now'
import { StoreProvider } from './state/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NowProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </NowProvider>
  </StrictMode>,
)
