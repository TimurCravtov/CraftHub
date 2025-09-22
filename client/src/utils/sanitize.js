// Enhanced client-side XSS defenses for untrusted strings and URLs

// Escape text for safe insertion into text/attribute contexts
export function escapeText(input) {
  const str = String(input ?? '')
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;') // Escape forward slashes
}

// Escape HTML for safe insertion into HTML content (more restrictive)
export function escapeHtml(input) {
  const str = String(input ?? '')
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;') // Escape backticks
    .replace(/=/g, '&#x3D;') // Escape equals
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

// Validate and sanitize email addresses
export function sanitizeEmail(email) {
  if (!email) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? escapeText(email) : ''
}

// Sanitize user input for display (removes potentially dangerous characters)
export function sanitizeUserInput(input) {
  if (!input) return ''
  return escapeText(input)
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
}


