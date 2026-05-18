/**
 * ============================================================
 * TranslationForm — Main Component
 * ============================================================
 * The core translation UI with a glassmorphism split-screen
 * layout. Orchestrates all sub-components and state management.
 *
 * State managed here:
 *   - languages: fetched from the backend on mount
 *   - sourceLang / targetLang: selected language codes
 *   - sourceText: the input text
 *   - translatedText: the API response
 *   - isLoading: translation in-progress flag
 *   - error: error message from failed translations
 *   - copied: clipboard feedback flag
 *   - isSpeakingSource / isSpeakingTarget: TTS state flags
 *   - swapAnimating: swap button rotation trigger
 *
 * Features:
 *   ✅ Dynamic language dropdowns from backend
 *   ✅ Swap languages with smooth rotation animation
 *   ✅ Loading spinner during API call
 *   ✅ Copy to clipboard with checkmark feedback
 *   ✅ Text-to-Speech for both source & target
 *   ✅ Empty input validation with subtle warning
 *   ✅ Character counter (5,000 max)
 *   ✅ Auto-translate on Ctrl+Enter
 * ============================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowUpDown, Languages } from 'lucide-react'

import LanguageSelector from './LanguageSelector'
import TextPanel from './TextPanel'
import LoadingSpinner from './LoadingSpinner'

import { fetchLanguages, translateText } from '../services/api'
import { speakText, stopSpeaking, isTTSAvailable } from '../services/tts'

function TranslationForm() {
  // ── State ──────────────────────────────────────────────────
  const [languages, setLanguages] = useState([])
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('es')
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSpeakingSource, setIsSpeakingSource] = useState(false)
  const [isSpeakingTarget, setIsSpeakingTarget] = useState(false)
  const [swapAnimating, setSwapAnimating] = useState(false)
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)
  const [languagesLoading, setLanguagesLoading] = useState(true)

  // Ref for the translate button (to trigger on Ctrl+Enter)
  const translateBtnRef = useRef(null)

  // ── Fetch languages on mount ────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadLanguages() {
      try {
        const langs = await fetchLanguages()
        if (!cancelled) {
          setLanguages(langs)
        }
      } catch (err) {
        console.error('Failed to load languages:', err)
        if (!cancelled) {
          setError('Could not load languages. Is the backend running?')
        }
      } finally {
        if (!cancelled) {
          setLanguagesLoading(false)
        }
      }
    }

    loadLanguages()

    // Cleanup: prevent state updates if component unmounts
    return () => {
      cancelled = true
    }
  }, [])

  // ── Cleanup TTS on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  // ── Clear empty warning when user types ─────────────────────
  useEffect(() => {
    if (sourceText.trim()) {
      setShowEmptyWarning(false)
    }
  }, [sourceText])

  // ── Auto-reset copied state after 2 seconds ────────────────
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  // ── Translate Handler ───────────────────────────────────────
  const handleTranslate = useCallback(async () => {
    // Validate: don't send empty text
    if (!sourceText.trim()) {
      setShowEmptyWarning(true)
      return
    }

    // Clear previous state
    setError('')
    setTranslatedText('')
    setIsLoading(true)
    setShowEmptyWarning(false)

    try {
      const result = await translateText({
        text: sourceText.trim(),
        sourceLang,
        targetLang,
      })
      setTranslatedText(result.translated_text)
    } catch (err) {
      setError(err.message || 'Translation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [sourceText, sourceLang, targetLang])

  // ── Swap Languages Handler ──────────────────────────────────
  const handleSwapLanguages = useCallback(() => {
    // Trigger rotation animation
    setSwapAnimating(true)

    // Swap the language codes
    const prevSource = sourceLang
    setSourceLang(targetLang)
    setTargetLang(prevSource)

    // Also swap the text content
    const prevText = sourceText
    setSourceText(translatedText)
    setTranslatedText(prevText)

    // Reset animation after it completes
    setTimeout(() => setSwapAnimating(false), 400)
  }, [sourceLang, targetLang, sourceText, translatedText])

  // ── Copy to Clipboard Handler ───────────────────────────────
  const handleCopy = useCallback(async () => {
    if (!translatedText) return

    try {
      await navigator.clipboard.writeText(translatedText)
      setCopied(true)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = translatedText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
    }
  }, [translatedText])

  // ── TTS Handlers ────────────────────────────────────────────
  const handleSpeakSource = useCallback(async () => {
    if (!sourceText.trim() || !isTTSAvailable()) return

    try {
      setIsSpeakingSource(true)
      await speakText({ text: sourceText, langCode: sourceLang })
    } catch (err) {
      console.error('TTS error (source):', err)
    } finally {
      setIsSpeakingSource(false)
    }
  }, [sourceText, sourceLang])

  const handleSpeakTarget = useCallback(async () => {
    if (!translatedText.trim() || !isTTSAvailable()) return

    try {
      setIsSpeakingTarget(true)
      await speakText({ text: translatedText, langCode: targetLang })
    } catch (err) {
      console.error('TTS error (target):', err)
    } finally {
      setIsSpeakingTarget(false)
    }
  }, [translatedText, targetLang])

  // ── Keyboard shortcut: Ctrl+Enter to translate ──────────────
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleTranslate()
      }
    },
    [handleTranslate]
  )

  // ── Render ──────────────────────────────────────────────────
  return (
    <div
      className="
        w-full max-w-5xl
        rounded-3xl
        border border-white/10
        bg-white/[0.03] backdrop-blur-xl
        shadow-2xl shadow-purple-950/50
        overflow-hidden
      "
    >
      {/* ── Top Bar: Language Selectors + Swap ──────────────── */}
      <div
        className="
          flex flex-col sm:flex-row items-center gap-3 sm:gap-0
          px-4 md:px-6 py-4
          border-b border-white/5
          bg-white/[0.02]
        "
      >
        {/* Source Language Selector */}
        <div className="flex-1 w-full sm:w-auto">
          <LanguageSelector
            languages={languages}
            value={sourceLang}
            onChange={setSourceLang}
            label="From"
            id="source-lang"
            disabled={languagesLoading || isLoading}
          />
        </div>

        {/* Swap Languages Button */}
        <button
          onClick={handleSwapLanguages}
          disabled={languagesLoading || isLoading}
          title="Swap languages"
          className={`
            mx-2 md:mx-4
            p-2.5 rounded-xl
            border border-white/10
            bg-white/5 hover:bg-violet-500/20 hover:border-violet-500/30
            text-purple-300/70 hover:text-violet-300
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            ${swapAnimating ? 'animate-spin-180' : ''}
          `}
          aria-label="Swap source and target languages"
        >
          <ArrowUpDown size={18} />
        </button>

        {/* Target Language Selector */}
        <div className="flex-1 w-full sm:w-auto">
          <LanguageSelector
            languages={languages}
            value={targetLang}
            onChange={setTargetLang}
            label="To"
            id="target-lang"
            disabled={languagesLoading || isLoading}
          />
        </div>
      </div>

      {/* ── Split-Screen: Source & Target Panels ────────────── */}
      <div className="flex flex-col md:flex-row">
        {/* Source (Left) */}
        <TextPanel
          type="source"
          value={sourceText}
          onChange={setSourceText}
          onKeyDown={handleKeyDown}
          placeholder="Enter text to translate..."
          languageCode={sourceLang}
          onSpeak={handleSpeakSource}
          isSpeaking={isSpeakingSource}
          disabled={isLoading}
        />

        {/* Divider (visible on md+) */}
        <div className="hidden md:block w-px bg-white/5" />

        {/* Target (Right) */}
        <TextPanel
          type="target"
          value={translatedText}
          placeholder="Translation will appear here..."
          languageCode={targetLang}
          onSpeak={handleSpeakTarget}
          onCopy={handleCopy}
          copied={copied}
          isSpeaking={isSpeakingTarget}
          disabled={isLoading}
        />
      </div>

      {/* ── Empty Input Warning ─────────────────────────────── */}
      {showEmptyWarning && (
        <div
          className="
            px-5 py-2.5
            bg-amber-500/10 border-t border-amber-500/20
            text-amber-300/80 text-sm
            animate-fade-in-up
          "
        >
          Please enter some text before translating.
        </div>
      )}

      {/* ── Error Message ───────────────────────────────────── */}
      {error && (
        <div
          className="
            px-5 py-2.5
            bg-red-500/10 border-t border-red-500/20
            text-red-300/80 text-sm
            animate-fade-in-up
          "
        >
          {error}
        </div>
      )}

      {/* ── Loading Spinner ─────────────────────────────────── */}
      {isLoading && <LoadingSpinner size="md" />}

      {/* ── Translate Button ────────────────────────────────── */}
      <div className="px-4 md:px-6 py-4 border-t border-white/5 bg-white/[0.02]">
        <button
          ref={translateBtnRef}
          onClick={handleTranslate}
          disabled={isLoading || languagesLoading}
          className="
            w-full py-3 rounded-xl
            bg-gradient-to-r from-violet-600 to-fuchsia-600
            hover:from-violet-500 hover:to-fuchsia-500
            active:from-violet-700 active:to-fuchsia-700
            text-white font-semibold text-base
            shadow-lg shadow-violet-500/25
            hover:shadow-violet-500/40
            transition-all duration-300
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-violet-500/25
            focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-purple-950
          "
          aria-label="Translate text"
        >
          <span className="flex items-center justify-center gap-2">
            <Languages size={20} />
            {isLoading ? 'Translating...' : 'Translate'}
          </span>
        </button>
        <p className="mt-2 text-center text-purple-300/30 text-xs">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300/50">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300/50">Enter</kbd> to translate
        </p>
      </div>
    </div>
  )
}

export default TranslationForm