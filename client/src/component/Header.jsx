import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User, Search, Heart, ShoppingCart, X } from 'lucide-react'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef(null)
  const searchPopupRef = useRef(null)

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  function handleSearchClick() {
    if (location.pathname !== '/shops') {
      navigate('/shops#search')
      return
    }
    setIsSearchOpen((prev) => !prev)
  }

  function handleAccountClick() {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        navigate('/account')
      } else {
        navigate('/signup')
      }
    } catch (_) {
      navigate('/signup')
    }
  }

  // Open search automatically if navigated with #search, then clear hash
  useEffect(() => {
    if (location.pathname === '/shops' && location.hash === '#search') {
      setIsSearchOpen(true)
      navigate('/shops', { replace: true })
    }
  }, [location, navigate])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (!isSearchOpen) return
      if (searchPopupRef.current && !searchPopupRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }
    function handleKey(event) {
      if (!isSearchOpen) return
      if (event.key === 'Escape') setIsSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isSearchOpen])

  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <img src="/assets/logo.png" alt="Craft Hub Logo" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#733c91] to-purple-600 bg-clip-text text-transparent">
                CraftHub
            </span>

            </a>
          </div>


          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'} relative`}>
              Home
              {location.pathname === '/' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
              )}
            </a>
            <a href="/shops" className={`text-sm font-medium ${location.pathname === '/shops' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'} relative`}>
              Shops
              {location.pathname === '/shops' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
              )}
            </a>
            <a href="/about" className={`text-sm font-medium ${location.pathname === '/about' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'} relative`}>
              About
              {location.pathname === '/about' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
              )}
            </a>
            <a href="/contact" className={`text-sm font-medium ${location.pathname === '/contact' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'} relative`}>
              Contact
              {location.pathname === '/contact' && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
              )}
            </a>
          </nav>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded hover:bg-slate-100" onClick={handleAccountClick}><User className="h-5 w-5" /></button>
            <button className={`p-2 rounded hover:bg-slate-100 ${isSearchOpen ? 'text-blue-600' : ''}`} onClick={handleSearchClick}>
              <Search className={`h-5 w-5 ${isSearchOpen ? 'text-blue-600' : ''}`} />
            </button>
            <button className={`p-2 rounded hover:bg-slate-100 ${location.pathname === '/liked' ? 'text-pink-600' : ''}`} onClick={() => navigate('/liked')}>
              <Heart className={`h-5 w-5 ${location.pathname === '/liked' ? 'text-pink-600 fill-pink-600' : ''}`} />
            </button>
            <button className={`p-2 rounded hover:bg-slate-100 ${location.pathname === '/cart' ? 'text-blue-600' : ''}`} onClick={() => navigate('/cart')}><ShoppingCart className="h-5 w-5" /></button>
          </div>
        </div>
        {location.pathname === '/shops' && isSearchOpen && (
          <div className="fixed top-20 right-8 z-[100] w-[92%] max-w-xl">
            <div ref={searchPopupRef} className="p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/60 via-fuchsia-500/60 to-cyan-500/60 shadow-[0_8px_40px_rgba(99,102,241,0.25)]">
              <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Search className="h-5 w-5 text-slate-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search artisan shops..."
                    className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
