/**
 * ============================================================
 * LoadingSpinner Component
 * ============================================================
 * A pulsing, glassmorphism-styled loading indicator shown
 * while the translation API is processing the request.
 *
 * Uses concentric rings with staggered animation delays
 * for a smooth, premium feel.
 *
 * Props:
 *   - size: string ("sm" | "md" | "lg") — defaults to "md"
 * ============================================================
 */

function LoadingSpinner({ size = 'md' }) {
    // Size mapping for the spinner dimensions
    const sizeMap = {
      sm: 'w-6 h-6',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
    }
  
    const dimension = sizeMap[size] || sizeMap.md
  
    return (
      <div className="flex items-center justify-center gap-3 py-4">
        {/* Outer pulsing ring */}
        <div className="relative">
          <div
            className={`
              ${dimension} rounded-full
              border-2 border-violet-400/30
              animate-pulse-ring
              absolute inset-0
            `}
          />
          {/* Inner spinning ring */}
          <div
            className={`
              ${dimension} rounded-full
              border-2 border-t-violet-400 border-r-violet-400/30
              border-b-violet-400/30 border-l-violet-400/30
              animate-spin
            `}
          />
        </div>
        <span className="text-purple-300/60 text-sm animate-pulse">
          Translating...
        </span>
      </div>
    )
  }
  
  export default LoadingSpinner