/**
 * ============================================================
 * TextPanel Component
 * ============================================================
 * A reusable panel for the split-screen layout.
 * Used for both the source input (left) and the translated
 * output (right) sides of the TranslationForm.
 *
 * Props:
 *   - type: "source" | "target"
 *   - value: string (text content — controlled by parent)
 *   - onChange: (text: string) => void (only for source type)
 *   - onKeyDown: (event: KeyboardEvent) => void (for Ctrl+Enter)
 *   - placeholder: string
 *   - languageCode: string (for TTS voice selection)
 *   - onSpeak: () => void (TTS callback)
 *   - onCopy: () => void (copy callback, target only)
 *   - copied: boolean (shows checkmark when true)
 *   - isSpeaking: boolean (highlights TTS button while speaking)
 *   - disabled: boolean
 * ============================================================
 */

import { Volume2, VolumeX, Copy, Check } from 'lucide-react'

function TextPanel({
  type = 'source',
  value = '',
  onChange,
  onKeyDown,
  placeholder = '',
  languageCode = '',
  onSpeak,
  onCopy,
  copied = false,
  isSpeaking = false,
  disabled = false,
}) {
  const isSource = type === 'source'

  return (
    <div
      className={`
        flex-1 flex flex-col rounded-2xl
        border border-white/10
        bg-white/5 backdrop-blur-md
        overflow-hidden
        transition-all duration-300
        ${isSource ? 'hover:border-violet-500/30' : 'hover:border-fuchsia-500/30'}
      `}
    >
      {/* ── Panel Header Bar ────────────────────────────── */}
      <div
        className={`
          flex items-center justify-between px-4 py-2
          border-b border-white/5
          ${isSource ? 'bg-violet-500/5' : 'bg-fuchsia-500/5'}
        `}
      >
        <span
          className={`
            text-xs font-semibold uppercase tracking-wider
            ${isSource ? 'text-violet-400/70' : 'text-fuchsia-400/70'}
          `}
        >
          {isSource ? 'Source' : 'Translation'}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Text-to-Speech button */}
          {value && onSpeak && (
            <button
              onClick={onSpeak}
              disabled={disabled}
              title={isSpeaking ? 'Stop speaking' : 'Listen'}
              className={`
                p-1.5 rounded-lg transition-all duration-200
                ${
                  isSpeaking
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-purple-300/50 hover:text-purple-300 hover:bg-white/10'
                }
                disabled:opacity-30 disabled:cursor-not-allowed
              `}
              aria-label={isSpeaking ? 'Stop speaking' : 'Listen to text'}
            >
              {isSpeaking ? (
                <VolumeX size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
          )}

          {/* Copy to Clipboard button (target only) */}
          {!isSource && value && onCopy && (
            <button
              onClick={onCopy}
              title={copied ? 'Copied!' : 'Copy to clipboard'}
              className={`
                p-1.5 rounded-lg transition-all duration-200
                ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-purple-300/50 hover:text-purple-300 hover:bg-white/10'
                }
              `}
              aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Text Area / Output Area ─────────────────────── */}
      {isSource ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="
            flex-1 min-h-[200px] md:min-h-[260px]
            bg-transparent text-white/90
            placeholder-purple-300/30
            px-5 py-4 text-base leading-relaxed
            resize-none focus:outline-none
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          aria-label="Source text input"
          spellCheck={false}
        />
      ) : (
        <div
          className="
            flex-1 min-h-[200px] md:min-h-[260px]
            px-5 py-4 text-base leading-relaxed
          "
          aria-label="Translated text output"
          aria-live="polite"
        >
          {value ? (
            <p className="text-white/90 animate-fade-in-up whitespace-pre-wrap">
              {value}
            </p>
          ) : (
            <p className="text-purple-300/20 italic">
              {placeholder}
            </p>
          )}
        </div>
      )}

      {/* ── Character Count (source only) ───────────────── */}
      {isSource && (
        <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02]">
          <span
            className={`
              text-xs
              ${value.length > 4500 ? 'text-amber-400/70' : 'text-purple-300/30'}
              ${value.length >= 5000 ? 'text-red-400/80' : ''}
            `}
          >
            {value.length} / 5,000
          </span>
        </div>
      )}
    </div>
  )
}

export default TextPanel