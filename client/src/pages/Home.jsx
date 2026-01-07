import Header from '../component/Header.jsx'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../component/ProductCard.jsx'
import { useRef, useEffect, useMemo, useState } from 'react'
import { Star, ChevronLeft, ChevronRight, ArrowRight, Sparkles, TrendingUp, Store } from 'lucide-react'
import { safeUrl } from '../utils/sanitize.js'
import { useTranslation } from '../context/translationContext.jsx'
import { useAuthApi } from "../context/apiAuthContext.jsx"


export default function Home() {
  const { t } = useTranslation() // Use the translation hook
  const featuredRef = useRef(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const navigate = useNavigate()
  const {api} = useAuthApi()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])

  useEffect(() => {
      api.get('/api/tags/').then(res => setCategories(['All', ...(Array.isArray(res.data) ? res.data : [])])).catch(console.error)
  }, [api])

  // derive recently added items from real products state
  const filteredRecent = useMemo(() => {
    if (!products || products.length === 0) return []
    if (activeCategory === 'All') return products.slice(0, 8)
    return products.filter(p => p.tags && p.tags.includes(activeCategory))
  }, [activeCategory, products])
  const [shops, setShops] = useState([])

  const filteredShops = useMemo(() => {
    if (activeCategory === 'All') return shops;
    // Find shop IDs that have products with the active tag
    const shopIdsWithTag = new Set(
      products
        .filter(p => p.tags && p.tags.includes(activeCategory))
        .map(p => p.shopId)
    );
    return shops.filter(s => shopIdsWithTag.has(s.id));
  }, [activeCategory, shops, products])
  const [shopsPage, setShopsPage] = useState(0)
  const shopsPerPage = 6
  const pagedShops = useMemo(() => {
    const start = shopsPage * shopsPerPage
    return filteredShops.slice(start, start + shopsPerPage)
  }, [filteredShops, shopsPage])
  const totalShopPages = Math.max(1, Math.ceil(filteredShops.length / shopsPerPage))

  // Ensure current page is valid when filters change
  useEffect(() => {
    setShopsPage(0)
  }, [activeCategory])

  // featured carousel derived from newest products
  const featured = useMemo(() => {
    if (!products || products.length === 0) return []
    return products.slice(0, 6).map((p) => ({
      ...p,
      // Ensure we have the fields ProductCard needs if they aren't already on p
      imageLinks: p.imageLinks || ['/assets/product-placeholder.svg'],
      shop: p.shop,
      shopId: p.shopId,
      shopUuid: p.shopUuid
    }))
  }, [products])

  const filteredFeatured = useMemo(() => activeCategory === 'All' ? featured : featured.filter(f => f.tags && f.tags.includes(activeCategory)), [activeCategory, featured])

  function scrollFeatured(direction) {
    const container = featuredRef.current
    if (!container) return
    const amount = container.clientWidth * 1.2
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // Auto-scroll featured horizontally in an endless loop (pause on hover)
  useEffect(() => {


    async function loadProducts() {
      try {
        const res = await api.get("/api/products/findall", {noAuth: true})
        console.log(res.data) // <- now it's correct
        setProducts(Array.isArray(res.data) ? res.data : []) // if you want to store them in state
      } catch (err) {
        console.error("Failed to fetch products:", err)
      }
    }

    async function loadShops() {
      try {
        const res = await api.get("/api/shops/", {noAuth: true})
        console.log(res.data) // <- now it's correct
        setShops(Array.isArray(res.data) ? res.data : []) // if you want to store them in state
      } catch (err) {
        console.error("Failed to fetch shops:", err)
      }
    }

    loadProducts()
    loadShops()

    const container = featuredRef.current
    if (!container) return
    let animationFrameId
    let isPaused = false
    const speed = 0.9
    const tick = () => {
      if (!isPaused) {
        container.scrollLeft += speed
        const maxScroll = container.scrollWidth - container.clientWidth
        if (container.scrollLeft >= maxScroll - 1) {
          container.scrollLeft = 0
        }
      }
      animationFrameId = requestAnimationFrame(tick)
    }
    const handleEnter = () => { isPaused = true }
    const handleLeave = () => { isPaused = false }
    container.addEventListener('mouseenter', handleEnter)
    container.addEventListener('mouseleave', handleLeave)
    animationFrameId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('mouseenter', handleEnter)
      container.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  // Categories are static pills; featured below auto-slides
  return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Header />

        {/* Hero Section */}
        <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
              src="/assets/crafthub_hero.png"
              alt="Artisan Workshop"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[20s] hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-gray-900/90 z-20" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 z-30">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Handmade with Love
            </span>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Crafted with Soul.
            </h1>
            <p className="mb-10 max-w-2xl text-xl text-gray-100 sm:text-2xl drop-shadow-lg font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Discover unique handmade creations from talented artisans around the world.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <button 
                onClick={() => navigate('/shops')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16533A] px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-[#0f3b29] hover:shadow-lg hover:shadow-[#16533A]/30 active:scale-95"
              >
                Explore Shops
                <Store className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/items')}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20 hover:border-white active:scale-95"
              >
                Browse Items
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

          {/* Categories Filter */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                 <Sparkles className="w-6 h-6 text-[#16533A]" />
                 Browse by Category
               </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar mask-linear-fade">
              {categories.map((c) => (
                  <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`group relative flex-shrink-0 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 ${
                        activeCategory === c 
                        ? 'bg-[#16533A] text-white shadow-lg shadow-[#16533A]/20 ring-2 ring-[#16533A] ring-offset-2' 
                        : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 hover:shadow-md ring-1 ring-gray-200'
                      }`}
                  >
                    {t(`categories.${c}`, c)}
                  </button>
              ))}
            </div>
          </div>

          {/* Featured carousel */}
          <section className="mb-24">
            <div className="mb-10 flex items-end justify-between">
               <div>
                 <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                   Featured Collections
                   <span className="px-3 py-1 rounded-full bg-[#16533A]/10 text-[#16533A] text-xs font-bold uppercase tracking-wider">Hot</span>
                 </h2>
                 <p className="mt-2 text-gray-500 text-lg">Curated picks just for you.</p>
               </div>
               <button onClick={() => navigate('/items')} className="hidden text-sm font-semibold text-[#16533A] hover:text-[#0f3b29] sm:flex items-center gap-1 group">
                 View all items <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
               </button>
            </div>

            <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
              <div ref={featuredRef} className="flex gap-8 overflow-x-auto pb-12 pt-4 no-scrollbar snap-x">
                {filteredFeatured.map((f) => (
                    <div key={f.id} className="min-w-[280px] md:min-w-[340px] snap-center transition-transform hover:scale-[1.02]">
                      <ProductCard product={f} />
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recently added */}
          <section className="mb-24">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-[#16533A]" />
                {t('recentlyAdded')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-8">
              {products.map((p) => {
                const product = {
                  id: p.id,
                  uuid: p.uuid,
                  title: p.title,
                  description: p.description || '',
                  price: p.price,
                  imageLinks: p.imageLinks || ['/assets/product-placeholder.svg'],
                  shop: p.shop,
                  shopId: p.shopId,
                  shopUuid: p.shopUuid
                }

                return <ProductCard key={product.id} product={product} />
              })}
            </div>
          </section>

          {/* Top shops section */}
          <section className="mb-20">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                <Store className="h-8 w-8 text-[#16533A]" />
                {t('topShops')}
              </h2>
              <a href="/shops" className="text-sm font-semibold text-[#16533A] hover:text-[#16533A]/80 group flex items-center gap-1">
                 View all shops <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {pagedShops.map((s) => (
                <a key={s.id} href={`/shops/${s.uuid || s.id}`} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img src={safeUrl(s.image || '/assets/cover-placeholder.png')} alt={s.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    <div className="absolute bottom-5 left-5 right-5 flex items-center gap-4">
                      <img src={safeUrl(s.logo || '/assets/shop-placeholder.svg')} alt={`${s.name} logo`} className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-lg" />
                      <div className="text-white">
                        <h3 className="text-lg font-bold leading-tight">{s.name}</h3>
                        <p className="text-sm opacity-90 font-light">{s.artisan}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gray-600">{s.description || s.artisan}</p>
                    <div className="mt-auto flex items-center gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(s.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-500">({s.rating?.toFixed?.(1) ?? s.rating})</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Prev shops"
                  onClick={() => setShopsPage((p) => Math.max(0, p - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40"
                  disabled={shopsPage === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next shops"
                  onClick={() => setShopsPage((p) => Math.min(totalShopPages - 1, p + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40"
                  disabled={shopsPage >= totalShopPages - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalShopPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setShopsPage(i)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${i === shopsPage ? 'w-8 bg-[#16533A]' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Show more CTA */}
          <div className="mt-20 flex justify-center">
            <a href="/shops" className="px-10 py-4 rounded-full bg-[#16533A] text-white font-semibold shadow-lg hover:bg-[#16533A]/90 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
              {t('showMore')} <ArrowRight className="h-5 w-5" />
            </a>
          </div>

        </div>

        <footer className="bg-gray-900 text-gray-300 mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">CraftHub.</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Connecting artisans with craft lovers around the globe. Discover the beauty of handmade.</p>
                <div className="pt-4">
                   <p className="text-sm text-gray-500">400 University Drive Suite 200<br />Coral Gables, FL 33134 USA</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-6">Explore</h4>
                <div className="space-y-3">
                  <a href="/" className="block text-sm hover:text-white transition-colors">Home</a>
                  <a href="/shops" className="block text-sm hover:text-white transition-colors">Shops</a>
                  <a href="/items" className="block text-sm hover:text-white transition-colors">Items</a>
                  <a href="/about" className="block text-sm hover:text-white transition-colors">About Us</a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-6">Support</h4>
                <div className="space-y-3">
                  <a href="/contact" className="block text-sm hover:text-white transition-colors">Contact Us</a>
                  <a href="#" className="block text-sm hover:text-white transition-colors">Payment Options</a>
                  <a href="#" className="block text-sm hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="block text-sm hover:text-white transition-colors">Terms of Service</a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-6">Stay Updated</h4>
                <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
                <div className="flex flex-col space-y-3">
                  <input placeholder="Enter your email" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#16533A]" />
                  <button className="w-full px-4 py-2.5 rounded-lg bg-[#16533A] text-white font-medium hover:bg-[#16533A]/90 transition-colors">Subscribe</button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">© 2024 CraftHub. All rights reserved.</p>
              <div className="flex space-x-6">
                 {/* Social icons could go here */}
              </div>
            </div>
          </div>
        </footer>
      </div>
  )
}