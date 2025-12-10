import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    } catch (_) {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch (_) {
      // ignore
    }
  }, [items])

  // Allow components to dispatch a global event to remove an item (used by toast Undo)
  useEffect(() => {
    function handleRemoveEvent(e) {
      const id = e.detail?.id
      if (id !== undefined) {
        setItems(prev => prev.filter(p => p.id !== id))
      }
    }
    window.addEventListener('cart:remove', handleRemoveEvent)
    return () => window.removeEventListener('cart:remove', handleRemoveEvent)
  }, [])

  function addToCart(product, qty = 1, options = { allowIncrement: false }) {
    setItems(prev => {
      const existing = prev.find(p => p.id === product.id)
      if (existing) {
        if (options.allowIncrement) {
          return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + qty } : p)
        }
        return prev
      }
      return [...prev, { ...product, qty }]
    })
  }

  function removeFromCart(id) {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  function updateQty(id, qty) {
    setItems(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = useMemo(() => items.reduce((sum, p) => sum + p.price * p.qty, 0), [items])

  const value = useMemo(() => ({ items, addToCart, removeFromCart, updateQty, clearCart, subtotal }), [items, subtotal])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


