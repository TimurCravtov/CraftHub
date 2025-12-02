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
      id: p.id ? `f-${p.id}` : `f-${Math.random().toString(36).slice(2, 7)}`,
      title: p.title || t('featured'),
      subtitle: (p.description && p.description.slice(0, 80)) || '',
      image: (p.imageLinks && p.imageLinks[0]) || '/assets/modern-plant-store-interior.jpg',
      category: p.category || 'All',
    }))
  }, [products, t])

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
      <div className="home-page futuristic-page-base">
        <Header />

        {/* Minimalist Gradient Transition */}
        <div className="home-minimalist-transition"></div>

        <div className="page-content">

          {/* Categories Filter */}
          <div className="home-categories">
            {categories.map((c) => (
                <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={activeCategory === c ? 'home-category-btn is-active' : 'home-category-btn'}
                >
                  {t(`categories.${c}`)} {/* Use t for category names */}
                </button>
            ))}
          </div>

          {/* Featured carousel */}
          <div className="home-featured">
            <div ref={featuredRef} className="home-featured-carousel">
              {filteredFeatured.map((f) => (
                  <div key={f.id} className="home-featured-card">
                    <img src={safeUrl(f.image)} alt={f.title} className="home-featured-card-image" />
                    <div className="home-featured-card-body">
                      <p className="home-featured-card-category">{f.title}</p>
                      <h3 className="home-featured-card-title">{f.subtitle}</h3>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* Recently added */}
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">{t('recentlyAdded')}</h2> {/* Use t for section title */}
            </div>
            <div className="responsive-grid">

        {products.map((p) => {
          const product = {
            id: p.id,
            title: p.title,
            description: p.description || '',
            price: p.price,
            imageLinks: p.imageLinks || ['https://source.unsplash.com/featured/800x600?handmade'],
            shop: p.shopId ? { id: p.shopId, name: p.sellerName || '' } : undefined,
          }

          return <ProductCard key={product.id} product={product} />
        })}
            </div>
          </div>

          {/* Top shops section to enrich page */}
          <div className="home-shops-section">
            <div className="home-section-header">
              <h2 className="home-section-title">{t('topShops')}</h2> {/* Use t for section title */}
            </div>
            <div className="home-shops-container">
              <div className="home-shops-grid-wrapper">
                <div className="home-shops-grid">
                  {pagedShops.map((s) => (
                    <a key={s.id} href={`/shops/${s.id}`} className="home-shop-card">
                      <div className="home-shop-card-image-wrapper">
                        <img src={safeUrl(s.image)} alt={s.name} className="home-shop-card-image" />
                      </div>
                      <div className="home-shop-card-body">
                        <div className="home-shop-card-header">
                          <img src={safeUrl(s.logo || '/assets/react.svg')} alt={`${s.name} logo`} className="home-shop-card-logo" />
                          <div className="home-shop-card-info">
                            <h3 className="home-shop-card-name">{s.name}</h3>
                            <p className="home-shop-card-description">{s.description || s.artisan}</p>
                          </div>
                          <div className="home-shop-card-rating">
                            <div className="home-shop-card-stars">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`home-shop-card-star ${i < Math.floor(s.rating) ? 'home-shop-card-star--filled' : 'home-shop-card-star--empty'}`} />
                              ))}
                            </div>
                            <span className="home-shop-card-rating-value">{s.rating?.toFixed?.(1) ?? s.rating}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Controls (outside grid) */}
                <div className="home-shops-controls">
                  <div className="home-shops-nav">
                    <button
                      aria-label="Prev shops"
                      onClick={() => setShopsPage((p) => Math.max(0, p - 1))}
                      className="home-shops-nav-btn"
                      disabled={shopsPage === 0}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      aria-label="Next shops"
                      onClick={() => setShopsPage((p) => Math.min(totalShopPages - 1, p + 1))}
                      className="home-shops-nav-btn"
                      disabled={shopsPage >= totalShopPages - 1}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="home-shops-pagination">
                    {Array.from({ length: totalShopPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setShopsPage(i)}
                        className={i === shopsPage ? 'home-shops-pagination-dot is-active' : 'home-shops-pagination-dot'}
                        aria-label={`Go to page ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Show more CTA */}
          <div className="home-show-more">
            <a href="/shops" className="btn-primary">{t('showMore')}</a> {/* Use t for button text */}
          </div>

        </div>

      </div>
  )
}