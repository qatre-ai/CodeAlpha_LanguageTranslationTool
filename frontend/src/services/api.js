/**
 * ============================================================
 * API Service Layer
 * ============================================================
 * Centralises all communication with the FastAPI backend.
 * Uses the native Fetch API — no external HTTP library needed.
 *
 * During development, Vite proxies /api/* requests to the
 * FastAPI backend at http://localhost:8000 (see vite.config.js).
 * In production, set VITE_API_BASE_URL to the backend origin.
 * ============================================================
 */

// ── Base URL Configuration ──────────────────────────────────
// Vite proxy handles /api routes in dev; for production,
// set the environment variable VITE_API_BASE_URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ── Language Cache ───────────────────────────────────────────
// Languages rarely change, so we cache the result after the
// first successful fetch to avoid redundant network requests.
let languagesCache = null;

/**
 * Fetch the list of supported languages from the backend.
 *
 * The backend returns: { "languages": { "en": "English", ... } }
 * We transform it into a sorted array for easy dropdown rendering:
 * [{ code: "en", name: "English" }, ...]
 *
 * @returns {Promise<Array<{code: string, name: string}>>}
 *   Sorted array of language objects.
 */
export async function fetchLanguages() {
  // Return cached data if available
  if (languagesCache) return languagesCache;

  const response = await fetch(`${BASE_URL}/api/languages`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch languages (HTTP ${response.status})`
    );
  }

  const data = await response.json();

  // Transform the { code: name } dict into a sorted array
  const languages = Object.entries(data.languages)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Cache for subsequent calls
  languagesCache = languages;

  return languages;
}

/**
 * Translate text from one language to another.
 *
 * Sends a POST to /api/translate with the required payload
 * and returns the full translation response object.
 *
 * @param {Object} params
 * @param {string} params.text       - The text to translate (1–5000 chars).
 * @param {string} params.sourceLang - Source language code (e.g., "en").
 * @param {string} params.targetLang - Target language code (e.g., "es").
 *
 * @returns {Promise<{translated_text: string, source_lang: string, target_lang: string, original_text: string}>}
 *   The translation result from the backend.
 *
 * @throws {Error} If the request fails or returns a non-2xx status.
 */
export async function translateText({ text, sourceLang, targetLang }) {
  const response = await fetch(`${BASE_URL}/api/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
    }),
  });

  // Handle error responses with the backend's detail message
  if (!response.ok) {
    let detail = `Translation failed (HTTP ${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        detail = errorData.detail;
      }
    } catch {
      // If we can't parse the error JSON, use the default message
    }
    throw new Error(detail);
  }

  const data = await response.json();

  return data;
}

/**
 * Clear the languages cache (useful for testing or forced refresh).
 */
export function clearLanguagesCache() {
  languagesCache = null;
}