import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../component/Header'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function ManageShops() {
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
    <div className="manageshops-page futuristic-page-base">
      <Header />
      
      <div className="container-2xl manageshops-container">
        <div className="page-header">
          <h1 className="page-header-title">Manage Shops</h1>
          <button
            onClick={() => navigate('/create-shop')}
            className="btn-primary manageshops-create-btn"
          >
            Create Shop
          </button>
        </div>

        {loading ? (
          <p className="manageshops-loading">Loading shops...</p>
        ) : shops.length > 0 ? (
          <div className="auto-fit-grid">
            {shops.map(shop => (
              <div 
                key={shop.id} 
                className="manageshops-card"
              >
                <img
                  src={shop.coverImage || '/assets/modern-plant-store-interior.jpg'}
                  alt={shop.shopName}
                  className="manageshops-card-image"
                />
                <div className="manageshops-card-body">
                  <h2 className="manageshops-card-title">{shop.shopName}</h2>
                  <p className="manageshops-card-description line-clamp-2">
                    {shop.description || 'No description provided'}
                  </p>
                  <button
                    onClick={() => navigate(`/account/shops/${shop.id}`)}
                    className="btn-primary manageshops-card-btn"
                  >
                    Manage Shop
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-state-text">You don't have any shops yet</p>
            <button
              onClick={() => navigate('/create-shop')}
              className="btn-primary manageshops-empty-btn"
            >
              Create Your First Shop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}