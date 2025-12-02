import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function ManageShopsContent() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { api } = useAuthApi()

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await api.get('/api/shops/my-shops')
        setShops(response.data)
      } catch (error) {
        console.error('Error fetching shops:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  return (
    <div className="manageshops-panel">
      <div className="manageshops-panel-header">
        <h2 className="manageshops-panel-title">Your Shops</h2>
        <button
          onClick={() => navigate('/account')}
          className="btn-primary manageshops-panel-btn"
        >
          <Store className="h-4 w-4" />
          Create New Shop
        </button>
      </div>

      {loading ? (
        <div className="manageshops-loading-box">
          <div className="manageshops-loading-text">Loading shops...</div>
        </div>
      ) : shops.length === 0 ? (
        <div className="manageshops-empty-panel">
          <Store className="manageshops-empty-icon" />
          <h3 className="manageshops-empty-title">No shops yet</h3>
          <p className="manageshops-empty-subtitle">Create your first shop to start selling</p>
          <button
            onClick={() => navigate('/account')}
            className="btn-primary manageshops-empty-button"
          >
            Create Shop
          </button>
        </div>
      ) : (
        <div className="manageshops-panel-grid">
          {shops.map((shop) => (
            <div key={shop.id} className="manageshops-panel-card">
              <div className="manageshops-panel-card-header">
                {shop.logo ? (
                  <img 
                    src={shop.logo} 
                    alt={shop.name} 
                    className="manageshops-panel-logo"
                  />
                ) : (
                  <div className="manageshops-panel-logo-fallback">
                    <Store className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="manageshops-panel-name">{shop.shopName || shop.name}</h3>
                  <p className="manageshops-panel-description">{shop.description}</p>
                </div>
              </div>
              <div className="manageshops-panel-actions">
                <button
                  onClick={() => navigate(`/account?shopId=${shop.id}`)}
                  className="manageshops-panel-edit"
                >
                  Edit Shop
                </button>
                <button
                  onClick={() => navigate(`/shops/${shop.id}`)}
                  className="manageshops-panel-view"
                >
                  View Shop
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
