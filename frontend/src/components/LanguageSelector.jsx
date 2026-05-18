/**
 * ============================================================
 * LanguageSelector Component
 * ============================================================
 * A styled dropdown for selecting a source or target language.
 * Populated dynamically from the backend's /api/languages endpoint.
 *
 * Props:
 *   - languages: Array<{code: string, name: string}>
 *   - value: string (currently selected language code)
 *   - onChange: (code: string) => void
 *   - label: string (accessibility label, e.g., "Source language")
 *   - id: string (unique ID for the <select> element)
 *   - disabled: boolean (optional, greys out the dropdown)
 * ============================================================
 */

function LanguageSelector({
    languages = [],
    value,
    onChange,
    label = 'Language',
    id = 'language-select',
    disabled = false,
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        {/* Screen-reader label */}
        <label
          htmlFor={id}
          className="text-xs font-medium text-purple-300/70 uppercase tracking-wider"
        >
          {label}
        </label>
  
        {/* Custom-styled select dropdown */}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || languages.length === 0}
          className="
            w-full rounded-xl border border-white/10
            bg-white/5 backdrop-blur-sm
            px-4 py-2.5 text-sm text-white
            focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
            hover:bg-white/10 transition-colors duration-200
            appearance-none cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed
            [&>option]:bg-slate-800 [&>option]:text-white
          "
          aria-label={label}
        >
          {languages.length === 0 && (
            <option value="" disabled>
              Loading languages...
            </option>
          )}
          {languages.map(({ code, name }) => (
            <option key={code} value={code}>
              {name} ({code})
            </option>
          ))}
        </select>
      </div>
    )
  }
  
  export default LanguageSelector