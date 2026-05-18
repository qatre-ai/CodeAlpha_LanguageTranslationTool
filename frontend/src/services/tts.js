/**
 * ============================================================
 * Text-to-Speech Utility (Web Speech API)
 * ============================================================
 * Provides a clean wrapper around the browser's native
 * speechSynthesis API for speaking translated text aloud.
 *
 * Features:
 * - Automatic voice selection matching the target language
 * - Cancel previous utterance before starting a new one
 * - Graceful fallback when the API is unavailable
 * ============================================================
 */

/**
 * Check whether the Web Speech API is available in the
 * current browser environment.
 *
 * @returns {boolean} True if speechSynthesis is supported.
 */
export function isTTSAvailable() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
  
  /**
   * Speak the given text aloud using the browser's speechSynthesis.
   *
   * How it works:
   * 1. Cancels any ongoing speech first.
   * 2. Creates a SpeechSynthesisUtterance with the text.
   * 3. Attempts to find a voice that matches the target language code.
   * 4. Falls back to the default voice if no match is found.
   * 5. Speaks the utterance.
   *
   * @param {Object} params
   * @param {string} params.text     - The text to speak aloud.
   * @param {string} params.langCode - BCP-47 language code (e.g., "en", "es", "fr").
   *                                   Used to select an appropriate voice.
   * @param {number} [params.rate=0.9]  - Speech rate (0.1 to 10, default 0.9 for clarity).
   * @param {number} [params.pitch=1]   - Speech pitch (0 to 2, default 1).
   *
   * @returns {Promise<void>} Resolves when speech finishes, rejects on error.
   */
  export function speakText({ text, langCode, rate = 0.9, pitch = 1 }) {
    return new Promise((resolve, reject) => {
      if (!isTTSAvailable()) {
        reject(new Error('Text-to-Speech is not supported in this browser.'));
        return;
      }
  
      // Cancel any speech currently in progress
      window.speechSynthesis.cancel();
  
      // Create the utterance
      const utterance = new SpeechSynthesisUtterance(text);
  
      // Map common language codes to BCP-47 format for voice matching
      // The deep-translator codes like "zh-CN" already work;
      // short codes like "en" need a region suffix for best results.
      const bcp47Map = {
        zh: 'zh-CN',
        tw: 'zh-TW',
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        ja: 'ja-JP',
        ko: 'ko-KR',
        ru: 'ru-RU',
        ar: 'ar-SA',
        hi: 'hi-IN',
        nl: 'nl-NL',
        pl: 'pl-PL',
        sv: 'sv-SE',
        tr: 'tr-TR',
        vi: 'vi-VN',
        th: 'th-TH',
      };
  
      // Use the mapped BCP-47 code, or the raw code if no mapping exists
      const mappedCode = bcp47Map[langCode] || langCode;
      utterance.lang = mappedCode;
  
      // Try to find a matching voice from the browser's available voices
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (voice) => voice.lang.startsWith(mappedCode.split('-')[0])
      );
  
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
  
      // Set rate and pitch
      utterance.rate = rate;
      utterance.pitch = pitch;
  
      // Resolve / reject based on speech events
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        // "canceled" errors are intentional, so don't reject for those
        if (event.error === 'canceled') {
          resolve();
        } else {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };
  
      // Speak!
      window.speechSynthesis.speak(utterance);
    });
  }
  
  /**
   * Stop any currently playing speech.
   * Useful as a cleanup function when components unmount.
   */
  export function stopSpeaking() {
    if (isTTSAvailable()) {
      window.speechSynthesis.cancel();
    }
  }