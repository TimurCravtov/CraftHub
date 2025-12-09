import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Plus, ExternalLink, Edit } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16533A]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Shops</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your storefronts and products</p>
        </div>
        <button
          onClick={() => navigate('/create-shop')}
          className="flex items-center gap-2 px-4 py-2 bg-[#16533A] text-white rounded-lg hover:bg-[#16533A]/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create New Shop
        </button>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
            <Store className="h-8 w-8 text-[#16533A]" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shops yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Create your first shop to start selling your handmade products to the world.
          </p>
          <button
            onClick={() => navigate('/create-shop')}
            className="px-6 py-2.5 bg-[#16533A] text-white rounded-lg hover:bg-[#16533A]/90 transition-colors shadow-sm font-medium"
          >
            Create Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div 
              key={shop.id} 
              className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#16533A]/30"
            >
              <div className="flex items-start gap-4 mb-4">
                {shop.shopImageUrl || shop.logo ? (
                  <img 
                    src={shop.shopImageUrl || shop.logo} 
                    alt={shop.name} 
                    className="h-16 w-16 rounded-lg object-cover border border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="h-16 w-16 bg-[#16533A]/5 rounded-lg flex items-center justify-center border border-[#16533A]/10">
                    <Store className="h-8 w-8 text-[#16533A]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#16533A] transition-colors">
                    {shop.shopName || shop.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {shop.description || 'No description provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/edit-shop/${shop.uuid}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-[#16533A] transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/shops/${shop.uuid}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#16533A] bg-[#16533A]/5 rounded-lg hover:bg-[#16533A]/10 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
