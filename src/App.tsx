import { useState } from 'react'
import Landing from './pages/Landing'
import Main from './pages/Main'

export default function App() {
  const [started, setStarted] = useState(false)

  if (!started) {
    return <Landing onStart={() => setStarted(true)} />
  }

  return <Main onGoHome={() => setStarted(false)} />
}
