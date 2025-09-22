import { useCallback } from 'react'
import { sanitizeEmail, sanitizeUserInput, escapeHtml, safeUrl } from '../utils/sanitize.js'

export const useSecurity = () => {
  const sanitizeInput = useCallback((input, type = 'text') => {
    if (!input) return ''
    
    switch (type) {
      case 'email':
        return sanitizeEmail(input)
      case 'html':
        return escapeHtml(input)
      case 'url':
        return safeUrl(input)
      case 'password':
      case 'text':
      default:
        return sanitizeUserInput(input)
    }
  }, [])

  const validateInput = useCallback((input, type = 'text') => {
    if (!input) return false
    
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(input)
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
        sanitized[key] = sanitizeInput(value, 'email')
      } else if (key.toLowerCase().includes('password')) {
        sanitized[key] = sanitizeInput(value, 'password')
      } else if (key.toLowerCase().includes('url')) {
        sanitized[key] = sanitizeInput(value, 'url')
      } else {
        sanitized[key] = sanitizeInput(value, 'text')
      }
    }
    return sanitized
  }, [sanitizeInput])

  return {
    sanitizeInput,
    validateInput,
    sanitizeFormData
  }
}
