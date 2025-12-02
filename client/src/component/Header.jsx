import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User, Search, Heart, ShoppingCart, X, LogOut, Settings } from 'lucide-react'
import { LanguagePicker } from './LanguagePicker.jsx'
import {useAuthApi} from "../context/apiAuthContext.jsx";
import { useSecurity } from '../hooks/useSecurity.js'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const searchInputRef = useRef(null)
  const searchPopupRef = useRef(null)
  const {user, setUser, login, logout, getMe} = useAuthApi()
  const { sanitizeInput } = useSecurity()
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
    localStorage.removeItem('auth')
    localStorage.removeItem('user') // Keep for backward compatibility
    logout() // Use the logout function from auth context
    setMenuOpen(false)
    navigate('/')
  }

  useEffect(() => {

    if (localStorage.getItem('user')) {
      setUser(localStorage.getItem("user"))
    }

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
    // Sanitize search input to prevent XSS
    const sanitizedValue = sanitizeInput(value, 'text')
    setSearchTerm(sanitizedValue)
    const params = new URLSearchParams(location.search)
    if (sanitizedValue) params.set('q', sanitizedValue)
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
      <header className="header">
        <div className="container-2xl header-container">
          <div className="header-content">
            {/* Logo */}
            <div className="header-logo-wrapper">
              <a href="/" className="header-logo">
                <img src="/assets/logo.png" alt="Craft Hub Logo" className="header-logo-image" />
                <span className="header-logo-text">
                CraftHub
              </span>
              </a>
            </div>

            {/* Navigation */}
            <nav className="header-nav">
              {[
                { href: "/", label: "Home" },
                { href: "/shops", label: "Shops" },
                { href: "/items", label: "Items" },
              ].map(link => (
                  <a
                      key={link.href}
                      href={link.href}
                      className={`header-nav-link ${location.pathname === link.href ? 'header-nav-link--active' : ''}`}
                  >
                    {link.label}
                    {location.pathname === link.href && (
                        <div className="header-nav-link-indicator" />
                    )}
                  </a>
              ))}
            </nav>

            {/* Right side */}
            <div className="header-actions">
              {/* User Icon + Dropdown */}
              <div id="user-menu" className="header-user-menu">
                <button
                    className="header-icon-button"
                    onClick={handleAccountClick}
                >
                  <User className="header-icon" />
                  {user && (
                    <span className="header-user-name">
                      Hi, {user.name}{" "}
                      <span className="header-user-role">
                        ({user.role || (isSeller ? "seller" : "buyer")})
                      </span>
                    </span>
                  )}
                </button>

                {menuOpen && user && (
                    <div className="header-user-dropdown">
                      <button
                          onClick={() => { navigate("/settings"); setMenuOpen(false) }}
                          className="header-dropdown-item"
                      >
                        <Settings className="header-dropdown-icon" /> Settings
                      </button>
                      <button
                          onClick={handleLogout}
                          className="header-dropdown-item header-dropdown-item--danger"
                      >
                        <LogOut className="header-dropdown-icon" /> Logout
                      </button>
                    </div>
                )}
              </div>

              {/* Search */}
              <button
                  className={`header-icon-button ${isSearchOpen ? 'header-icon-button--active' : ''}`}
                  onClick={handleSearchClick}
              >
                <Search className="header-icon" />
              </button>

              {/* Favorites */}
              <button
                  className={`header-icon-button ${location.pathname === '/liked' ? 'header-icon-button--active header-icon-button--pink' : ''}`}
                  onClick={() => navigate('/liked')}
              >
                <Heart className="header-icon" />
              </button>

              {/* Cart */}
              <button
                  className={`header-icon-button ${location.pathname === '/cart' ? 'header-icon-button--active' : ''}`}
                  onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="header-icon" />
              </button>

              {/* Language Picker */}
              <LanguagePicker />
            </div>

            {/* Search popup */}
            {isSearchablePage && isSearchOpen && (
                <div className="header-search-popup">
                  <div ref={searchPopupRef} className="header-search-popup-wrapper">
                    <div className="header-search-popup-content">
                      <div className="header-search-popup-inner">
                        <Search className="header-search-icon" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={getSearchPlaceholder()}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="header-search-input"
                        />
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(false)}
                            className="header-search-close"
                            aria-label="Close search"
                        >
                          <X className="header-search-close-icon" />
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
