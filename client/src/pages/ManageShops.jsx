import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Plus, Edit, ExternalLink, Package } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Shops</h1>
            <p className="mt-2 text-gray-600">View and manage your storefronts</p>
          </div>
          <button
            onClick={() => navigate('/create-shop')}
            className="flex items-center gap-2 px-6 py-3 bg-[#16533A] text-white rounded-xl hover:bg-[#0f3b29] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Create Shop
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-96 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            {shops.map((shop) => (
              <div 
                key={shop.id} 
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <img
                    src={shop.shopBannerImageUrl || shop.coverImage || '/assets/modern-plant-store-interior.jpg'}
                    alt={shop.shopName}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <h2 className="text-xl font-bold text-white mb-1">{shop.name || shop.shopName}</h2>
                    <p className="text-white/80 text-sm line-clamp-1">
                      {shop.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#16533A]" />
                      <span>{shop.products?.length || 0} Products</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[#16533A]" />
                      <span>Active</span>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate(`/edit-shop/${shop.uuid}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[#16533A] hover:text-[#16533A] transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/shop/${shop.uuid}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#16533A] text-white rounded-xl hover:bg-[#0f3b29] transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#16533A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-[#16533A]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Shops Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start your journey by creating your first shop. It only takes a few minutes to get set up.
            </p>
            <button
              onClick={() => navigate('/create-shop')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#16533A] text-white rounded-xl hover:bg-[#0f3b29] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-lg"
            >
              <Plus className="w-6 h-6" />
              Create Your First Shop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}