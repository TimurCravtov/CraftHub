import { createContext, useContext } from 'react'
import { useSecurity } from '../hooks/useSecurity.js'

const SecurityContext = createContext()

export const SecurityProvider = ({ children }) => {
  const security = useSecurity()
  
  return (
    <SecurityContext.Provider value={security}>
      {children}
    </SecurityContext.Provider>
  )
}

export const useSecurityContext = () => {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider')
  }
  return context
}
