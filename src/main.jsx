import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '@fontsource/press-start-2p'
import './styles.css'
import App from './App.jsx'

function redactRoomCode(event) {
  const url = new URL(event.url)
  url.searchParams.delete('room')

  return { ...event, url: url.toString() }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {import.meta.env.VERCEL && <Analytics beforeSend={redactRoomCode} />}
  </StrictMode>,
)
