import { useCallback } from 'react'
import { sanitizeEmail, sanitizeEmailForDisplay, sanitizeUserInput, sanitizePassword, sanitizeName, sanitizeNameForDisplay, escapeHtml, safeUrl, validateEmailFormat } from '../utils/sanitize.js'

export const useSecurity = () => {
  const sanitizeInput = useCallback((input, type = 'text') => {
    if (!input) return ''
    
    switch (type) {
      case 'email':
        return sanitizeEmailForDisplay(input) // Use display version for UI
      case 'html':
        return escapeHtml(input)
      case 'url':
        return safeUrl(input)
      case 'password':
        return sanitizePassword(input)
      case 'name':
        return sanitizeNameForDisplay(input) // Use display version for UI
      case 'text':
      default:
        return sanitizeUserInput(input)
    }
  }, [])

  const validateInput = useCallback((input, type = 'text') => {
    if (!input) return false
    
    switch (type) {
      case 'email':
        return validateEmailFormat(input)
      case 'password':
        return input.length >= 8
      case 'url':
        try {
          new URL(input)
          return true
        } catch {
          return false
        }
      default:
        return input.length > 0
    }
  }, [])

  const sanitizeFormData = useCallback((formData) => {
    const sanitized = {}
    for (const [key, value] of Object.entries(formData)) {
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value)
      } else if (key.toLowerCase().includes('password')) {
        sanitized[key] = sanitizePassword(value)
      } else if (key.toLowerCase().includes('name')) {
        sanitized[key] = sanitizeName(value) // Use server version for submission
      } else if (key.toLowerCase().includes('url')) {
        sanitized[key] = safeUrl(value)
      } else {
        sanitized[key] = sanitizeUserInput(value)
      }
    }
    return sanitized
  }, [])

  return {
    sanitizeInput,
    validateInput,
    sanitizeFormData
  }
}
