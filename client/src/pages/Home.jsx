import Header from '../component/Header.jsx'
import ProductCard from '../component/ProductCard.jsx'
import { useRef, useEffect, useMemo, useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { safeUrl } from '../utils/sanitize.js'
import { useTranslation } from '../context/translationContext.jsx'

const shops = [
  { id: 1, name: "Luna's Ceramics", image: "/assets/modern-plant-store-interior.jpg", logo: "/assets/react.svg", rating: 4.9, reviews: 87, description: 'Handcrafted pottery & ceramic art pieces', artisan: 'Luna Martinez', category: 'Ceramics' },
  { id: 2, name: 'Silversmith Studio', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.8, reviews: 124, description: 'Custom jewelry & metalwork creations', artisan: 'Alex Chen', category: 'Jewelry' },
  { id: 3, name: 'Woven Dreams', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.7, reviews: 156, description: 'Hand-woven textiles & fiber art', artisan: 'Maya Patel', category: 'Textiles' },
  { id: 4, name: 'Woodcraft Atelier', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.9, reviews: 92, description: 'Artisan furniture & wooden sculptures', artisan: 'David Kim', category: 'Woodwork' },
  { id: 5, name: 'Glass & Light', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.6, reviews: 78, description: 'Blown glass art & lighting fixtures', artisan: 'Sofia Rodriguez', category: 'Glass' },
  { id: 6, name: 'Leather & Stitch', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.8, reviews: 134, description: 'Handcrafted leather goods & accessories', artisan: 'James Wilson', category: 'Leather' },
  { id: 7, name: 'Paper Trails', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.5, reviews: 58, description: 'Handcrafted paper goods & stationery', artisan: 'Elena Popa', category: 'Paper' },
  { id: 8, name: 'Stone & Soul', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.7, reviews: 73, description: 'Stone carvings & decor', artisan: 'Radu Ionescu', category: 'Stone' },
  { id: 9, name: 'Printed Dreams', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.4, reviews: 41, description: 'Art prints & posters', artisan: 'Ana Dumitrescu', category: 'Prints' },
  { id: 10, name: 'Wicker Wonders', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.6, reviews: 66, description: 'Baskets & woven homeware', artisan: 'Bogdan Marin', category: 'Baskets' },
  { id: 11, name: 'Candle Co.', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.8, reviews: 102, description: 'Hand-poured candles', artisan: 'Ioana Petrescu', category: 'Candles' },
  { id: 12, name: 'Botanical Art', image: '/assets/modern-plant-store-interior.jpg', logo: '/assets/react.svg', rating: 4.7, reviews: 89, description: 'Botanical illustrations', artisan: 'Mihai Georgescu', category: 'Art' },
]

export default function Home() {
  const featuredRef = useRef(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const recent = [
    { id: 1, productName: 'Minimalist Table', sellerName: 'Andrei\'s Shop', price: 20, imageUrl: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353', category: 'Furniture' },
    { id: 2, productName: 'Handmade Vase', sellerName: 'Maria Handmade', price: 35, imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4', category: 'Ceramics' },
    { id: 3, productName: 'Wooden Chair', sellerName: 'Crafts by Ion', price: 50, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', category: 'Furniture' },
    { id: 4, productName: 'Ceramic Cup', sellerName: 'Luna\'s Ceramics', price: 12, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657', category: 'Ceramics' },
    { id: 5, productName: 'Macrame Wall', sellerName: 'Woven Dreams', price: 28, imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4', category: 'Textiles' },
    { id: 6, productName: 'Leather Wallet', sellerName: 'Leather & Stitch', price: 22, imageUrl: 'https://images.unsplash.com/photo-1511381939415-c1a43ea3a07b', category: 'Leather' },
    { id: 7, productName: 'Glass Pendant', sellerName: 'Glass & Light', price: 42, imageUrl: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7', category: 'Glass' },
    { id: 8, productName: 'Silver Ring', sellerName: 'Silversmith Studio', price: 39, imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3', category: 'Jewelry' }
  ]

  const { t } = useTranslation()

  const categories = useMemo(() => [
    t('categories.All'),
    t('categories.Furniture'),
    t('categories.Ceramics'),
    t('categories.Textiles'),
    t('categories.Jewelry'),
    t('categories.Woodwork'),
    t('categories.Glass'),
    t('categories.Leather'),
    t('categories.Art'),
    t('categories.Paper'),
    t('categories.Stone'),
    t('categories.Prints'),
    t('categories.Baskets'),
    t('categories.Candles')
  ], [t])

  const filteredRecent = useMemo(() => activeCategory === 'All' ? recent : recent.filter(r => r.category === activeCategory), [activeCategory, recent])
  const filteredShops = useMemo(() => activeCategory === 'All' ? shops : shops.filter(s => s.category === activeCategory), [activeCategory])
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

  const featured = [
    { id: 'f1', title: 'Editor\'s pick', subtitle: 'Timeless ceramics', image: '/assets/modern-plant-store-interior.jpg', category: 'Ceramics' },
    { id: 'f2', title: 'Trending now', subtitle: 'Minimal furniture', image: '/assets/modern-plant-store-interior.jpg', category: 'Furniture' },
    { id: 'f3', title: 'Gift ideas', subtitle: 'Under 25 lei', image: '/assets/modern-plant-store-interior.jpg', category: 'Candles' },
    { id: 'f4', title: 'Nature vibes', subtitle: 'Botanical prints', image: '/assets/modern-plant-store-interior.jpg', category: 'Art' },
    { id: 'f5', title: 'Shimmer & shine', subtitle: 'Handmade jewelry', image: '/assets/modern-plant-store-interior.jpg', category: 'Jewelry' },
    { id: 'f6', title: 'Textile tales', subtitle: 'Cozy weaves', image: '/assets/modern-plant-store-interior.jpg', category: 'Textiles' }
  ]

  const filteredFeatured = useMemo(() => activeCategory === 'All' ? featured : featured.filter(f => f.category === activeCategory), [activeCategory])

  function scrollFeatured(direction) {
    const container = featuredRef.current
    if (!container) return
    const amount = container.clientWidth * 1.2
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // Auto-scroll featured horizontally in an endless loop (pause on hover)
  useEffect(() => {
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

      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Artisan Shops</h1>
          <p className="text-white/90 mb-4 text-lg">Discover unique handmade creations from talented artisans</p>
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
              {c}
            </button>
          ))}
        </div>

        {/* Featured carousel */}
        <div className="mt-8 relative">
          <div ref={featuredRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2 no-scrollbar">
            {filteredFeatured.map((f) => (
              <div key={f.id} className="min-w-[280px] md:min-w-[360px] snap-start relative rounded-2xl overflow-hidden border bg-white">
                <img src={safeUrl(f.image)} alt={f.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="text-xs text-slate-500">{f.title}</p>
                  <h3 className="text-lg font-semibold">{f.subtitle}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently added */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recently added</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredRecent.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                productName={p.productName}
                sellerName={p.sellerName}
                price={p.price}
                imageUrl={p.imageUrl}
              />
            ))}
          </div>
        </div>

        {/* Top shops section to enrich page */}
        <div className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Top rated shops</h2>
          </div>
          <div className="relative mt-4">
            <div className="relative">
              <div className="mx-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {pagedShops.map((s) => (
                  <div key={s.id} className="relative w-full bg-white rounded-2xl overflow-hidden border">
                    <div className="relative h-48">
                      <img src={safeUrl(s.image)} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{s.name}</h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(s.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-xs text-gray-600">{s.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate">by {s.artisan}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
                <button
                  aria-label="Prev shops"
                  onClick={() => setShopsPage((p) => Math.max(0, p - 1))}
                  className="pointer-events-auto -ml-4 p-3 rounded-full bg-white border shadow hover:bg-slate-50 disabled:opacity-40"
                  disabled={shopsPage === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next shops"
                  onClick={() => setShopsPage((p) => Math.min(totalShopPages - 1, p + 1))}
                  className="pointer-events-auto -mr-4 p-3 rounded-full bg-white border shadow hover:bg-slate-50 disabled:opacity-40"
                  disabled={shopsPage >= totalShopPages - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2">
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

        {/* Show more CTA */}
        <div className="mt-12 flex justify-center">
          <a href="/shops" className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">Show more</a>
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


