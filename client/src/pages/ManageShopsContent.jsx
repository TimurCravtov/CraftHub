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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Shops</h2>
        <button
          onClick={() => navigate('/account')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Store className="h-4 w-4" />
          Create New Shop
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-600">Loading shops...</div>
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shops yet</h3>
          <p className="text-gray-600 mb-4">Create your first shop to start selling</p>
          <button
            onClick={() => navigate('/account')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                {shop.logo ? (
                  <img 
                    src={shop.logo} 
                    alt={shop.name} 
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Store className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{shop.shopName || shop.name}</h3>
                  <p className="text-sm text-gray-600">{shop.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/account?shopId=${shop.id}`)}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Edit Shop
                </button>
                <button
                  onClick={() => navigate(`/shops/${shop.id}`)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
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
