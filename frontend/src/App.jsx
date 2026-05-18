/**
 * ============================================================
 * App — Root Component
 * ============================================================
 * Renders the full Language Translation Tool UI with a
 * glassmorphism-styled split-screen layout.
 *
 * Layout:
 *   - Header         → Title, subtitle, branding
 *   - TranslationForm→ The main split-panel translation UI
 *   - Footer         → Attribution & credits
 * ============================================================
 */

import { useEffect } from 'react'
import './App.css'
import TranslationForm from './components/TranslationForm'

function App() {
  // Preload voices for TTS on app mount (some browsers need this)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Trigger voice loading — some browsers load voices asynchronously
      window.speechSynthesis.getVoices()

      // Chrome loads voices asynchronously; listen for the event
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices()
      }
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex flex-col">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="text-center pt-8 pb-4 px-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          Language Translation Tool
        </h1>
        <p className="mt-2 text-purple-300/70 text-sm md:text-base max-w-xl mx-auto">
          Translate between 100+ languages instantly. Powered by Google Translate
          with text-to-speech support.
        </p>
      </header>

      {/* ── Main Content ───────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 pb-8 pt-4">
        <TranslationForm />
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="text-center py-4 text-purple-400/40 text-xs">
        <p>
          Built with FastAPI + React + deep-translator &bull;
          CodeAlpha Internship Task 1
        </p>
      </footer>
    </div>
  )
}

export default App