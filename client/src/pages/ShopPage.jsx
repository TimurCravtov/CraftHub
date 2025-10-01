import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../component/Header.jsx'
import { Star, Heart, Search, ShoppingCart, User, Facebook, Instagram } from 'lucide-react'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState('description')
  const navigate = useNavigate()
  const { id } = useParams()
  const [shopName, setShopName] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [artisanName, setArtisanName] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])
  const { api } = useAuthApi()

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        // Fetch shop details by shop ID using unified api client
        const shopResp = await api.get(`/api/shops/${id}`, {noAuth: true})
        const shopData = shopResp?.data || {}

        // Normalize and set shop fields
        setShopName(shopData.name || shopData.shopName || '')
        setShopDescription(shopData.description || shopData.shopDescription || '')

        // If shop has user_id or owner id, fetch user details
        const userId = shopData.user_id || shopData.ownerId || shopData.userId
        if (userId) {
          try {
            const userResp = await api.get(`/api/users/${userId}`)
            const userData = userResp?.data || {}
            setArtisanName(userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim())
          } catch (uErr) {
            // not fatal
            console.warn('Failed to fetch user for shop', uErr)
          }
        }

        // Fetch related products for the shop
        try {
          const prodResp = await api.get(`/api/products/by-shop/${id}`, {noAuth: true})
          const prodData = prodResp?.data || []
          // normalize product shape to ensure image/price exist
          const normalized = (Array.isArray(prodData) ? prodData : []).map(p => ({
            id: p.id,
            title: p.title || p.name || 'Untitled',
            description: p.description || p.shortDescription || '',
            price: p.price ?? p.cost ?? 0,
            image: (p.imageLinks && p.imageLinks[0]) || p.image || p.imageUrl || 'https://source.unsplash.com/featured/800x600?craft',
          }))
          setRelatedProducts(normalized)
        } catch (pErr) {
          console.warn('Failed to fetch products for shop', pErr)
        }
      } catch (error) {
        console.error('Error fetching shop details:', error)
      }
    }

    if (id) fetchShopDetails()
  }, [id])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">{shopName}</h1>
          <div className="flex items-center space-x-2 text-white/80">
            <a href="/" className="hover:text-white">Home</a>
            <span>&gt;</span>
            <a href="/shops" className="hover:text-white">Shops</a>
            <span>&gt;</span>
            <span>{shopName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-orange-100 rounded-lg overflow-hidden">
              <img src="/assets/modern-plant-store-interior.jpg" alt="Product" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">{artisanName}</h1>
            <p className="text-gray-600 leading-relaxed">
              Discover the fine, handmade best of craft in this artisan marketplace online where talented makers like you showcase their unique creations. From pottery to jewelry, each piece tells a story of passion and skill.
            </p>
            <div className="flex items-center space-x-4">
              <Facebook className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-600" />
              <Instagram className="w-6 h-6 text-gray-600 cursor-pointer hover:text-pink-600" />
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid w-full grid-cols-2 max-w-md mx-auto border rounded-lg overflow-hidden">
            {['description', 'additional'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm ${activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' && 'Description'}
                {tab === 'additional' && 'Additional Information'}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="mt-8 max-w-4xl mx-auto text-gray-600 leading-relaxed space-y-4">
              <p>
                {shopDescription}
              </p>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="mt-8 max-w-4xl mx-auto text-gray-600">
              <p>Additional product information and specifications would go here.</p>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-video bg-orange-100 rounded-lg overflow-hidden">
            <img src="/assets/modern-plant-store-interior.jpg" alt="Product detail 1" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-video bg-orange-100 rounded-lg overflow-hidden">
            <img src="/assets/modern-plant-store-interior.jpg" alt="Product detail 2" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow rounded-2xl overflow-hidden border">
                <div className="p-0">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{product.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{product.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{product.price}</p>
                      <button className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 text-gray-500 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 hover:scale-110">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => navigate(`/shops/${id}/Itempage`)}
              className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              View Shop Items
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}