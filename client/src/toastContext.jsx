import { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'info', durationMs = 1800, options = {}) {
    const { actionLabel, onAction } = options
    setToast({ message, type, actionLabel, onAction })
    if (durationMs > 0) {
      window.clearTimeout(showToast._t)
      showToast._t = window.setTimeout(() => setToast(null), durationMs)
    }
  }

  const value = useMemo(() => ({ toast, showToast, hideToast: () => setToast(null) }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-green-600' : 'bg-gray-900'}`}>
            <span className="text-sm">{toast.message}</span>
            {toast.actionLabel && (
              <button
                onClick={() => {
                  try { toast.onAction && toast.onAction() } finally { setToast(null) }
                }}
                className="ml-2 px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-xs"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


