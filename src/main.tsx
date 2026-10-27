import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ModeProvider } from './lib/mode'

/* Commit Mono is self-hosted; Cabinet Grotesk comes from Fontshare in
   index.html. Those two are the whole typographic system. */
import '@fontsource/commit-mono/400.css'
import '@fontsource/commit-mono/500.css'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ModeProvider>
  </StrictMode>,
)
