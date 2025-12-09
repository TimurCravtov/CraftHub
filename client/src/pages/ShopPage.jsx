import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../component/Header.jsx'
import ProductCard from '../component/ProductCard.jsx'
import { Star, Heart, Search, ShoppingCart, User, Facebook, Instagram, MapPin, Mail, Globe, ArrowRight, Store } from 'lucide-react'
import { useAuthApi } from '../context/apiAuthContext.jsx'
import { useTranslation } from '../context/translationContext.jsx'

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState('description')
  const navigate = useNavigate()
  const { id } = useParams()
  const [shopName, setShopName] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [shopImage, setShopImage] = useState('')
  const [shopLogo, setShopLogo] = useState('')
  const [artisanName, setArtisanName] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])
  const { api } = useAuthApi()
  const { t } = useTranslation()

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        // Fetch shop details by shop ID using unified api client
        const shopResp = await api.get(`/api/shops/${id}`, {noAuth: true})
        const shopData = shopResp?.data || {}

        // Normalize and set shop fields
        setShopName(shopData.name || shopData.shopName || '')
        setShopDescription(shopData.description || shopData.shopDescription || '')
        setShopImage(shopData.image || shopData.coverImage || '')
        setShopLogo(shopData.logo || shopData.shopLogo || '')

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
          const prodResp = await api.get(`/api/shops/${id}/products`, {noAuth: true})
          const prodData = prodResp?.data || []
          // normalize product shape to ensure image/price exist
          const normalized = (Array.isArray(prodData) ? prodData : []).map(p => ({
            ...p,
            id: p.id,
            title: p.title || p.name || 'Untitled',
            description: p.description || p.shortDescription || '',
            price: p.price ?? p.cost ?? 0,
            imageLinks: p.imageLinks || (p.image ? [p.image] : []) || (p.imageUrl ? [p.imageUrl] : []),
            shop: shopData,
            shopId: id
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden group">
        <div className="absolute inset-0">
            <img 
                src={shopImage || '/assets/handmade_stuff.png'} 
                alt={shopName} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-6 bg-black/20 backdrop-blur-sm w-fit px-4 py-2 rounded-full border border-white/10">
                <a href="/" className="hover:text-white transition-colors">Home</a>
                <span>/</span>
                <a href="/shops" className="hover:text-white transition-colors">Shops</a>
                <span>/</span>
                <span className="text-white">{shopName}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end gap-8">
                <div className="relative">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white">
                        <img 
                            src={shopLogo || '/assets/shop-placeholder.svg'} 
                            alt="Shop Logo" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-[#16533A] text-white p-2 rounded-xl shadow-lg">
                        <Store className="h-6 w-6" />
                    </div>
                </div>
                
                <div className="flex-1 text-white pb-2">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{shopName}</h1>
                    <div className="flex items-center gap-6 text-gray-300">
                        <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {artisanName || 'Artisan'}
                        </span>
                        <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Global Shipping
                        </span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Column: About & Contact */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    About the Artisan
                </h3>
                <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                    Discover the fine, handmade best of craft in this artisan marketplace online where talented makers like {artisanName || 'this creator'} showcase their unique creations. From pottery to jewelry, each piece tells a story of passion and skill.
                </p>
                
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Connect</h4>
                    <div className="flex gap-3">
                        <button className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Facebook className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                            <Instagram className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors">
                            <Mail className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                            <Globe className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Content & Products */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    {['description', 'additional'].map((tab) => (
                    <button
                        key={tab}
                        className={`flex-1 py-4 text-sm font-medium transition-all relative ${
                            activeTab === tab 
                            ? 'text-[#16533A] bg-green-50/50' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'description' && 'About the Shop'}
                        {tab === 'additional' && 'Policies & Info'}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16533A]" />
                        )}
                    </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === 'description' && (
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {shopDescription || "This shop hasn't added a description yet."}
                            </p>
                        </div>
                    )}

                    {activeTab === 'additional' && (
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600">
                                Additional shop policies, shipping information, and returns details would appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Products */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Store className="h-6 w-6 text-[#16533A]" />
                        Shop Collection
                    </h2>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        {relatedProducts.length} Items
                    </span>
                </div>

                {relatedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {relatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 border-dashed">
                        <p className="text-gray-500">No products available yet.</p>
                    </div>
                )}
                
                {relatedProducts.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        <button
                        type="button"
                        onClick={() => navigate(`/shops/${id}/Itempage`)}
                        className="px-8 py-3 rounded-full bg-[#16533A] text-white font-medium hover:bg-[#16533A]/90 transition-all shadow-lg shadow-[#16533A]/20 flex items-center gap-2 hover:-translate-y-0.5"
                        >
                        View All Items <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}