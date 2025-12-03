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
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Shops</h1>
          <button
            onClick={() => navigate('/create-shop')}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            Create Shop
          </button>
        </div>

        {loading ? (
          <p>Loading shops...</p>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map(shop => (
              <div 
                key={shop.id} 
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={shop.shopBannerImageUrl || shop.coverImage || '/assets/modern-plant-store-interior.jpg'}
                  alt={shop.shopName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{shop.name || shop.shopName}</h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {shop.description || 'No description provided'}
                  </p>
                  <button
                    onClick={() => navigate(`/edit-shop/${shop.uuid}`)}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                  >
                    Edit Shop
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You don't have any shops yet</p>
            <button
              onClick={() => navigate('/create-shop')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Create Your First Shop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}