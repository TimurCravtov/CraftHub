import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User, Search, Heart, ShoppingCart, X, LogOut, Settings } from 'lucide-react'
import { LanguagePicker } from './LanguagePicker.jsx'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const searchInputRef = useRef(null)
  const searchPopupRef = useRef(null)

  function getSellerFromJwt() {
    try {
      const authRaw = localStorage.getItem('auth')
      if (!authRaw) return false
      const auth = JSON.parse(authRaw)
      const token = auth?.accessToken || auth?.token
      if (!token || token.split('.').length !== 3) return false
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.accountType === 'seller' || payload?.role === 'SELLER' || payload?.role === 'seller'
    } catch {
      return false
    }
  }

  const isSeller = getSellerFromJwt()

  const hasShop = (() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      const userId = auth?.userId
      const shopKey = `shop:${userId || 'current'}`
      return !!localStorage.getItem(shopKey)
    } catch {
      return false
    }
  })()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  const isSearchablePage = location.pathname === '/shops' || location.pathname === '/items'

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) searchInputRef.current.focus()
  }, [isSearchOpen])

  function handleSearchClick() {
    if (!isSearchablePage) {
      navigate('/shops#search')
      return
    }
    setIsSearchOpen(prev => !prev)
  }

  function handleAccountClick() {
    if (user) setMenuOpen(prev => !prev)
    else navigate('/signup')
  }

  function handleLogout() {
    localStorage.removeItem('user')
    setUser(null)
    setMenuOpen(false)
    navigate('/')
  }

  useEffect(() => {
    if (location.pathname === '/shops' && location.hash === '#search') {
      setIsSearchOpen(true)
      navigate('/shops', { replace: true })
    }
  }, [location, navigate])

  useEffect(() => {
    if (isSearchablePage) {
      const params = new URLSearchParams(location.search)
      const q = params.get('q') || ''
      setSearchTerm(q)
    }
  }, [location, isSearchablePage])

  function handleSearchChange(e) {
    const value = e.target.value
    setSearchTerm(value)
    const params = new URLSearchParams(location.search)
    if (value) params.set('q', value)
    else params.delete('q')

    const path = isSearchablePage ? location.pathname : '/shops'
    if (!isSearchablePage) {
      navigate(`${path}?${params.toString()}`)
      setIsSearchOpen(true)
    } else {
      navigate(`${path}?${params.toString()}`, { replace: true })
    }
  }

  function getSearchPlaceholder() {
    if (location.pathname === '/items') return 'Search items...'
    return 'Search artisan shops...'
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (!isSearchOpen && !menuOpen) return
      if (searchPopupRef.current && !searchPopupRef.current.contains(event.target)) setIsSearchOpen(false)
      if (!event.target.closest("#user-menu")) setMenuOpen(false)
    }
    function handleKey(event) {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isSearchOpen, menuOpen])

  return (
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <img src="/assets/logo.png" alt="Craft Hub Logo" className="h-8 w-8 object-contain" />
                <span className="text-xl font-bold bg-gradient-to-r from-[#733c91] to-purple-600 bg-clip-text text-transparent">
                CraftHub
              </span>
              </a>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { href: "/", label: "Home" },
                { href: "/shops", label: "Shops" },
                { href: "/items", label: "Items" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map(link => (
                  <a
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-medium ${location.pathname === link.href ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'} relative`}
                  >
                    {link.label}
                    {location.pathname === link.href && (
                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                    )}
                  </a>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-2 relative">
              {/* User Icon + Dropdown */}
              <div id="user-menu" className="relative">
                <button
                    className="p-2 rounded hover:bg-slate-100 flex items-center gap-2"
                    onClick={handleAccountClick}
                >
                  <User className="h-5 w-5" />
                  {user && <span className="text-sm font-medium">Hi, {user.name}</span>}
                </button>

                {menuOpen && user && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border py-2 z-50">
                      <button
                          onClick={() => { navigate("/settings"); setMenuOpen(false) }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-100"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </button>
                      <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                )}
              </div>

              {/* Search */}
              <button
                  className={`p-2 rounded hover:bg-slate-100 ${isSearchOpen ? 'text-blue-600' : ''}`}
                  onClick={handleSearchClick}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Favorites */}
              <button
                  className={`p-2 rounded hover:bg-slate-100 ${location.pathname === '/liked' ? 'text-pink-600' : ''}`}
                  onClick={() => navigate('/liked')}
              >
                <Heart className="h-5 w-5" />
              </button>

              {/* Cart */}
              <button
                  className={`p-2 rounded hover:bg-slate-100 ${location.pathname === '/cart' ? 'text-blue-600' : ''}`}
                  onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
              </button>

              {/* Language Picker */}
              <LanguagePicker />
            </div>

            {/* Search popup */}
            {isSearchablePage && isSearchOpen && (
                <div className="fixed top-20 right-8 z-[100] w-[92%] max-w-xl">
                  <div ref={searchPopupRef} className="p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/60 via-fuchsia-500/60 to-cyan-500/60 shadow-[0_8px_40px_rgba(99,102,241,0.25)]">
                    <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Search className="h-5 w-5 text-slate-500" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={getSearchPlaceholder()}
                            value={searchTerm}
                            onChange={handleSearchChange}
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
        </div>
      </header>
  )
}
