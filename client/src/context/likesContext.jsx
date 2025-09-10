import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LikesContext = createContext(null)

export function LikesProvider({ children }) {
  const [likes, setLikes] = useState(() => {
    try {
      const raw = localStorage.getItem('likes')
      return raw ? JSON.parse(raw) : []
    } catch (_) {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('likes', JSON.stringify(likes))
    } catch (_) {
      // ignore
    }
  }, [likes])

  function isLiked(id) {
    return likes.some(p => p.id === id)
  }

  function toggleLike(product) {
    setLikes((prev) => {
      const exists = prev.some(p => p.id === product.id)
      if (exists) return prev.filter(p => p.id !== product.id)
      return [product, ...prev]
    })
  }

  const value = useMemo(() => ({ likes, isLiked, toggleLike }), [likes])

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>
}

export function useLikes() {
  const ctx = useContext(LikesContext)
  if (!ctx) throw new Error('useLikes must be used within LikesProvider')
  return ctx
}


