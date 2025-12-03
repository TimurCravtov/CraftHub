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
      <div className="min-h-screen bg-white">
        <Header />

        <div className="relative h-64">
          {/* Plain image */}
          <img
              src="/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg"
              alt="Plant store"
              className="w-full h-full object-cover brightness-40"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white mb-4">Artisan Shops</h1>
            <p className="text-white/90 mb-4 text-lg">
              Discover unique handmade creations from talented artisans
            </p>
            <div className="flex items-center space-x-2 text-white/80">
              <a href="/" className="hover:text-white">Home</a>
              <span>&gt;</span>
              <span>Welcome</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

          {/* Categories Filter */}
          <div className="mt-6 flex items-center gap-3 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
                <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 border backdrop-blur bg-white/70 hover:bg-white/90 shadow-sm ${activeCategory === c ? 'border-transparent text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_4px_24px_rgba(99,102,241,0.35)]' : 'border-slate-200 text-slate-700'}`}
                >
                  {t(`categories.${c}`)} {/* Use t for category names */}
                </button>
            ))}
          </div>

          {/* Featured carousel */}
          <div className="mt-8 relative">
            <div ref={featuredRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2 no-scrollbar">
              {filteredFeatured.map((f) => (
                  <div key={f.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                    <ProductCard product={f} />
                  </div>
              ))}
            </div>
          </div>

          {/* Recently added */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('recentlyAdded')}</h2> {/* Use t for section title */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">

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
          </div>

          {/* Top shops section to enrich page */}
          <div className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('topShops')}</h2> {/* Use t for section title */}
            </div>
            <div className="relative mt-4">
              <div className="relative">
                <div className="mx-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pagedShops.map((s) => (
                      <a key={s.id} href={`/shops/${s.id}`} className="group block w-full bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow">
                        <div className="relative h-48 bg-slate-100">
                          <img src={safeUrl(s.image)} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={safeUrl(s.logo || '/assets/react.svg')} alt={`${s.name} logo`} className="h-10 w-10 rounded-full object-cover border" />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{s.name}</h3>
                              <p className="text-xs text-gray-500 truncate">{s.description || s.artisan}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(s.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">{s.rating?.toFixed?.(1) ?? s.rating}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Controls (outside grid) */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Prev shops"
                        onClick={() => setShopsPage((p) => Math.max(0, p - 1))}
                        className="p-2 rounded-full bg-white border shadow hover:bg-slate-50 disabled:opacity-40"
                        disabled={shopsPage === 0}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        aria-label="Next shops"
                        onClick={() => setShopsPage((p) => Math.min(totalShopPages - 1, p + 1))}
                        className="p-2 rounded-full bg-white border shadow hover:bg-slate-50 disabled:opacity-40"
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
                          className={`h-2.5 w-2.5 rounded-full transition-colors ${i === shopsPage ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                          aria-label={`Go to page ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Show more CTA */}
          <div className="mt-12 flex justify-center">
            <a href="/shops" className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">{t('showMore')}</a> {/* Use t for button text */}
          </div>

        </div>

        <footer className="bg-slate-50 mt-16 border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CraftHub.</h3>
                <p className="text-sm text-slate-600 mb-4">Connecting artisans with craft lovers<br />400 University Drive Suite 200<br />Coral Gables, FL 33134 USA</p>
              </div>
              <div>
                <h4 className="font-medium mb-4 text-slate-600">Links</h4>
                <div className="space-y-2">
                  <a href="/" className="block text-sm hover:text-slate-900">Home</a>
                  <a href="/shop" className="block text-sm hover:text-slate-900">Shop</a>
                  <a href="/about" className="block text-sm hover:text-slate-900">About</a>
                  <a href="/contact" className="block text-sm hover:text-slate-900">Contact</a>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-4 text-slate-600">Help</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-sm hover:text-slate-900">Payment Options</a>
                  <a href="#" className="block text-sm hover:text-slate-900">Privacy Policies</a>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-4 text-slate-600">Newsletter</h4>
                <div className="flex space-x-2">
                  <input placeholder="Enter your Email Address" className="flex-1 border rounded px-3 py-2" />
                  <button className="px-4 py-2 rounded bg-blue-600 text-white">SUBSCRIBE</button>
                </div>
              </div>
            </div>
            <div className="border-t mt-8 pt-8">
              <p className="text-sm text-slate-600">All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}