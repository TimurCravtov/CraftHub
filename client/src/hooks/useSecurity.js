import { useCallback } from 'react'
import { sanitizeEmail, sanitizeEmailForDisplay, sanitizeUserInput, sanitizePassword, sanitizeName, sanitizeNameForDisplay, escapeHtml, safeUrl, validateEmailFormat, sanitize2FA, sanitizeDescription, sanitizePhone, sanitizeAddress } from '../utils/sanitize.js'

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
      case '2fa':
      case 'twoFactor':
        return sanitize2FA(input)
      case 'description':
        return sanitizeDescription(input)
      case 'phone':
        return sanitizePhone(input)
      case 'address':
        return sanitizeAddress(input)
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
      const lowerKey = key.toLowerCase()
      
      // Skip file objects and null/undefined values
      if (value === null || value === undefined || value instanceof File || value instanceof FileList) {
        sanitized[key] = value
        continue
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => {
          if (item instanceof File || typeof item === 'object') return item
          return sanitizeFormData({ [key]: item })[key]
        })
        continue
      }
      
      // Handle objects (but not File objects)
      if (typeof value === 'object' && value !== null && !(value instanceof File)) {
        sanitized[key] = sanitizeFormData(value)
        continue
      }
      
      // Handle strings based on field name
      if (lowerKey.includes('email')) {
        sanitized[key] = sanitizeEmail(String(value))
      } else if (lowerKey.includes('password')) {
        sanitized[key] = sanitizePassword(String(value))
      } else if (lowerKey.includes('name') && !lowerKey.includes('description')) {
        sanitized[key] = sanitizeName(String(value)) // Use server version for submission
      } else if (lowerKey.includes('url')) {
        sanitized[key] = safeUrl(String(value))
      } else if (lowerKey.includes('2fa') || lowerKey.includes('twofactor') || (lowerKey.includes('code') && lowerKey.includes('factor'))) {
        sanitized[key] = sanitize2FA(String(value))
      } else if (lowerKey.includes('description')) {
        sanitized[key] = sanitizeDescription(String(value))
      } else if (lowerKey.includes('phone')) {
        sanitized[key] = sanitizePhone(String(value))
      } else if (lowerKey.includes('address') || lowerKey.includes('city') || lowerKey.includes('town')) {
        sanitized[key] = sanitizeAddress(String(value))
      } else {
        sanitized[key] = sanitizeUserInput(String(value))
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
