export const THEME_STORAGE_KEY = 'snippetmate-theme'

export function readStoredTheme(storage = globalThis.localStorage) {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function resolveInitialTheme({ storage = globalThis.localStorage, matchMedia = globalThis.matchMedia } = {}) {
  const stored = readStoredTheme(storage)
  if (stored) return stored
  try {
    return matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme, { root = globalThis.document?.documentElement, storage = globalThis.localStorage } = {}) {
  const next = theme === 'dark' ? 'dark' : 'light'
  root?.setAttribute('data-bs-theme', next)
  try {
    storage?.setItem(THEME_STORAGE_KEY, next)
  } catch {}
  return next
}
