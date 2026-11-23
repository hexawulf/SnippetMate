import { test } from 'node:test'
import assert from 'node:assert'
import { THEME_STORAGE_KEY, readStoredTheme, resolveInitialTheme, applyTheme } from './theme.js'

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)) },
  }
}

test('resolveInitialTheme prefers stored value over prefers-color-scheme', () => {
  const storage = memoryStorage({ [THEME_STORAGE_KEY]: 'dark' })
  assert.strictEqual(resolveInitialTheme({ storage, matchMedia: () => ({ matches: false }) }), 'dark')
})

test('resolveInitialTheme falls back to prefers-color-scheme when unset or invalid', () => {
  const empty = memoryStorage()
  assert.strictEqual(resolveInitialTheme({ storage: empty, matchMedia: () => ({ matches: true }) }), 'dark')
  assert.strictEqual(resolveInitialTheme({ storage: empty, matchMedia: () => ({ matches: false }) }), 'light')
  const invalid = memoryStorage({ [THEME_STORAGE_KEY]: 'sepia' })
  assert.strictEqual(readStoredTheme(invalid), null)
  assert.strictEqual(resolveInitialTheme({ storage: invalid, matchMedia: () => ({ matches: true }) }), 'dark')
})

test('applyTheme sets data-bs-theme and persists safely even if storage throws', () => {
  const attrs = {}
  const root = { setAttribute: (k, v) => { attrs[k] = v } }
  const storage = memoryStorage()

  assert.strictEqual(applyTheme('dark', { root, storage }), 'dark')
  assert.strictEqual(attrs['data-bs-theme'], 'dark')
  assert.strictEqual(storage.getItem(THEME_STORAGE_KEY), 'dark')

  const broken = {
    getItem() { throw new Error('blocked') },
    setItem() { throw new Error('quota') },
  }
  assert.strictEqual(readStoredTheme(broken), null)
  assert.strictEqual(applyTheme('light', { root, storage: broken }), 'light')
  assert.strictEqual(attrs['data-bs-theme'], 'light')
})
