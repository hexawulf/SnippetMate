// Small pure helpers shared by components (and covered by node:test).

/** True only for absolute http/https URLs: the only ones rendered as links. */
export function isHttpUrl(value) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** "a, B, a , b" -> ["a", "B"]: trimmed, no empties, no case-insensitive repeats. */
export function parseTagInput(text) {
  const seen = new Set()
  const tags = []
  for (const raw of String(text ?? '').split(',')) {
    const name = raw.trim()
    const key = name.toLowerCase()
    if (!name || seen.has(key)) continue
    seen.add(key)
    tags.push(name)
  }
  return tags
}

/** The message to show for a failed API call. */
export function apiErrorMessage(err, fallback) {
  const fromServer = err?.response?.data?.error
  if (typeof fromServer === 'string' && fromServer) return fromServer
  if (err?.response?.status === 413) return 'That is too large to send.'
  if (err?.response?.status === 401) return 'Your session has expired. Please sign in again.'
  if (err?.response) return fallback
  return 'Could not reach the server. Check your connection and try again.'
}
