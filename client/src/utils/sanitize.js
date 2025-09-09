// Minimal client-side XSS defenses for untrusted strings and URLs

// Escape text for safe insertion into text/attribute contexts
export function escapeText(input) {
  const str = String(input ?? '')
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Allow only http(s) or same-origin relative paths for URLs like img src
export function safeUrl(url) {
  if (!url) return ''
  try {
    if (url.startsWith('/')) return url
    const u = new URL(url)
    if (u.protocol === 'http:' || u.protocol === 'https:') return url
    return ''
  } catch (_) {
    return ''
  }
}


