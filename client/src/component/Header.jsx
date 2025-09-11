import { User, Search, Heart, ShoppingCart } from 'lucide-react'
import logo from '../../public/assets/logo.png'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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

  // Check if we're on a searchable page
  const isSearchablePage = location.pathname === '/shops' || location.pathname === '/items'

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  function handleSearchClick() {
    if (!isSearchablePage) {
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

  // Sync searchTerm with URL ?q= when on searchable pages
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
    
    // Stay on current page if already on a searchable page, otherwise go to shops
    const path = isSearchablePage ? location.pathname : '/shops'
    
    if (!isSearchablePage) {
      navigate(`${path}?${params.toString()}`)
      setIsSearchOpen(true)
    } else {
      navigate(`${path}?${params.toString()}`, { replace: true })
    }
  }

  // Get appropriate placeholder text based on current page
  function getSearchPlaceholder() {
    if (location.pathname === '/items') {
      return 'Search items...'
    }
    return 'Search artisan shops...'
  }

  // Close on outside click or escape key
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

            {/* Logo + Title */}
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
              <a
                  href="/"
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                CraftHub
              </a>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Home</a>
              <a href="/shops" className="text-sm font-medium text-slate-900 relative">
                Shops
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
              </a>
              <a href="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900">About</a>
              <a href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900">Contact</a>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded hover:bg-slate-100"><User className="h-5 w-5" /></button>
              <button className="p-2 rounded hover:bg-slate-100"><Search className="h-5 w-5" /></button>
              <button className="p-2 rounded hover:bg-slate-100"><Heart className="h-5 w-5" /></button>
              <button className="p-2 rounded hover:bg-slate-100"><ShoppingCart className="h-5 w-5" /></button>
            </div>

          </div>
        </div>
      </header>
  )
}
