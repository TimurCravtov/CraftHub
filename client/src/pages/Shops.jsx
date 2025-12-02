import { Filter, Grid3X3, List, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../component/Header.jsx'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function Shops() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const q = (params.get('q') || '').toLowerCase()

  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const { api } = useAuthApi()


  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopResponse = await api.get('/api/shops/')
        const shopsData = shopResponse.data
        
      
        const shopsWithArtisans = await Promise.all(
          shopsData.map(async (shop) => {
            const userResponse = await api.get(`/api/users/${shop.user_id}`)
            const userData = userResponse.data
            shop.artisan = userData.name  
            return shop
          })
        )

        setShops(shopsWithArtisans)
      } catch (error) {
        console.error('Error fetching shops or users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  const filtered = q
    ? shops.filter(
        (s) =>
          (s.shopName || s.name).toLowerCase().includes(q) ||
          s.artisan.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    : shops

  if (loading) {
    return (
      <div className="page-loading page-loading--light">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="shops-page futuristic-page-base">
      <Header />

      <div className="page-content page-content--no-hero">
        <div className="page-toolbar">
          <div className="page-toolbar-left">
            <button className="btn-primary" style={{ gap: '0.5rem' }}>
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <div className="shops-view-toggle">
              <button>
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button>
                <List className="h-4 w-4" />
              </button>
            </div>
            <span className="shops-summary">Showing {filtered.length} of {shops.length} artisan shops</span>
          </div>

          <div className="page-toolbar-right">
            <div className="page-toolbar-left">
              <span className="shops-summary">Show</span>
              <select className="toolbar-select">
                <option>8</option>
                <option>16</option>
                <option>32</option>
              </select>
            </div>

            <div className="page-toolbar-left">
              <span className="shops-summary">Sort by</span>
              <select className="toolbar-select">
                <option>Default</option>
                <option>Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="auto-fit-grid shops-grid">
          {filtered.map((shop) => (
            <div
              onClick={() => navigate(`/shops/${shop.id}`)}
              key={shop.id}
              className="shops-card"
            >
              <div className="shops-card-image">
                <img src={shop.image} alt={shop.shopName || shop.name} />

                <button className="shops-card-like" type="button">
                  <Heart className="w-4 h-4" />
                </button>

                <div className="shops-card-logo">
                  <img
                    src={shop.logo}
                    alt={`${shop.shopName || shop.name} logo`}
                  />
                </div>
              </div>

              <div className="shops-card-body">
                <h3 className="shops-card-title">{shop.shopName || shop.name}</h3>
                <p className="shops-card-subtitle">by {shop.artisan}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
