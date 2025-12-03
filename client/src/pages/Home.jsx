import Header from '../component/Header.jsx'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../component/ProductCard.jsx'
import { useRef, useEffect, useMemo, useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { safeUrl } from '../utils/sanitize.js'
import { useTranslation } from '../context/translationContext.jsx'
import {useAuthApi} from "../context/apiAuthContext.jsx"; // Import the useTranslation hook


export default function Home() {
  const { t } = useTranslation() // Use the translation hook
  const featuredRef = useRef(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const navigate = useNavigate()
  const {api} = useAuthApi()

  const [products, setProducts] = useState([])

  const categories = useMemo(() => [
    'All',
    'Furniture',
    'Ceramics',
    'Textiles',
    'Jewelry',
    'Woodwork',
    'Glass',
    'Leather',
    'Art',
    'Paper',
    'Stone',
    'Prints',
    'Baskets',
    'Candles'
  ], [])
  // derive recently added items from real products state
  const filteredRecent = useMemo(() => {
    if (!products || products.length === 0) return []
    if (activeCategory === 'All') return products.slice(0, 8)
    return products.filter(p => (p.category || '').toString() === activeCategory)
  }, [activeCategory, products])
  const [shops, setShops] = useState([])

  const filteredShops = useMemo(() => activeCategory === 'All' ? shops : shops.filter(s => (s.category || '').toString() === activeCategory), [activeCategory, shops])
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
      imageLinks: p.imageLinks || ['/assets/modern-plant-store-interior.jpg'],
      shop: p.shop,
      shopId: p.shopId,
      shopUuid: p.shopUuid
    }))
  }, [products])

  const filteredFeatured = useMemo(() => activeCategory === 'All' ? featured : featured.filter(f => f.category === activeCategory), [activeCategory, featured])

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
        const res = await api.get("api/products/findall", {noAuth: true})
        console.log(res.data) // <- now it's correct
        setProducts(res.data) // if you want to store them in state
      } catch (err) {
        console.error("Failed to fetch products:", err)
      }
    }

    async function loadShops() {
      try {
        const res = await api.get("api/shops/", {noAuth: true})
        console.log(res.data) // <- now it's correct
        setShops(res.data) // if you want to store them in state
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
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Header />

        {/* Hero Section */}
        <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
          <img
              src="/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg"
              alt="Artisan Workshop"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[20s] hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-slate-900/10" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-2xl">
              Crafted with Soul.
            </h1>
            <p className="mb-10 max-w-2xl text-xl text-slate-100 sm:text-2xl drop-shadow-lg font-light">
              Discover unique handmade creations from talented artisans around the world.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up">
              <a 
                href="/shops" 
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95"
              >
                Explore Shops
              </a>
              <a 
                href="/items" 
                className="inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20 hover:border-white active:scale-95"
              >
                Browse Items
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

          {/* Categories Filter */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold tracking-tight text-slate-900">Browse by Category</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar mask-linear-fade">
              {categories.map((c) => (
                  <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`group relative flex-shrink-0 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 ${
                        activeCategory === c 
                        ? 'bg-slate-900 text-white shadow-lg ring-2 ring-slate-900 ring-offset-2' 
                        : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:shadow-md ring-1 ring-slate-200'
                      }`}
                  >
                    {t(`categories.${c}`)}
                  </button>
              ))}
            </div>
          </div>

          {/* Featured carousel */}
          <section className="mb-24">
            <div className="mb-10 flex items-end justify-between">
               <div>
                 <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured Collections</h2>
                 <p className="mt-2 text-slate-500 text-lg">Curated picks just for you.</p>
               </div>
               <a href="/items" className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block group">
                 View all items <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
               </a>
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
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('recentlyAdded')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-8">
              {products.map((p) => {
                const product = {
                  id: p.id,
                  uuid: p.uuid,
                  title: p.title,
                  description: p.description || '',
                  price: p.price,
                  imageLinks: p.imageLinks || ['https://source.unsplash.com/featured/800x600?handmade'],
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
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('topShops')}</h2>
              <a href="/shops" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 group">
                 View all shops <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {pagedShops.map((s) => (
                <a key={s.id} href={`/shops/${s.id}`} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ring-1 ring-slate-200/50">
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img src={safeUrl(s.image)} alt={s.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    <div className="absolute bottom-5 left-5 right-5 flex items-center gap-4">
                      <img src={safeUrl(s.logo || '/assets/react.svg')} alt={`${s.name} logo`} className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-lg" />
                      <div className="text-white">
                        <h3 className="text-lg font-bold leading-tight">{s.name}</h3>
                        <p className="text-sm opacity-90 font-light">{s.artisan}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-slate-600">{s.description || s.artisan}</p>
                    <div className="mt-auto flex items-center gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(s.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                      <span className="ml-2 text-sm font-medium text-slate-500">({s.rating?.toFixed?.(1) ?? s.rating})</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Prev shops"
                  onClick={() => setShopsPage((p) => Math.max(0, p - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
                  disabled={shopsPage === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next shops"
                  onClick={() => setShopsPage((p) => Math.min(totalShopPages - 1, p + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
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
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${i === shopsPage ? 'w-8 bg-slate-900' : 'bg-slate-300 hover:bg-slate-400'}`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Show more CTA */}
          <div className="mt-20 flex justify-center">
            <a href="/shops" className="px-10 py-4 rounded-full bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              {t('showMore')}
            </a>
          </div>

        </div>

        <footer className="bg-slate-900 text-slate-300 mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">CraftHub.</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Connecting artisans with craft lovers around the globe. Discover the beauty of handmade.</p>
                <div className="pt-4">
                   <p className="text-sm text-slate-500">400 University Drive Suite 200<br />Coral Gables, FL 33134 USA</p>
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
                <p className="text-sm text-slate-400 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
                <div className="flex flex-col space-y-3">
                  <input placeholder="Enter your email" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">Subscribe</button>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">© 2024 CraftHub. All rights reserved.</p>
              <div className="flex space-x-6">
                 {/* Social icons could go here */}
              </div>
            </div>
          </div>
        </footer>
      </div>
  )
}