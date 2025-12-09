import { Filter, Grid3X3, List, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../component/Header.jsx'
import ShopCard from '../component/ShopCard.jsx'
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
            if (shop.userId) {
                try {
                    const userResponse = await api.get(`/api/users/${shop.userId}`)
                    const userData = userResponse.data
                    shop.artisan = userData.name
                } catch (e) {
                    console.warn("Failed to fetch user for shop", shop.id)
                    shop.artisan = "Unknown Artisan"
                }
            } else {
                shop.artisan = "Unknown Artisan"
            }
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0">
            <img 
                src="/assets/handmade_stuff.png" 
                alt="Shops Hero" 
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Artisan Shops</h1>
          <p className="text-gray-200 mb-8 text-lg max-w-2xl font-light">
            Discover unique handmade creations from talented artisans around the world
          </p>
          <div className="flex items-center space-x-2 text-gray-300 text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <span className="text-white">Shops</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center space-x-2 border border-gray-200 rounded-xl px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button className="p-1.5 rounded-md bg-white shadow-sm text-gray-900">
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-md text-gray-500 hover:text-gray-900">
                <List className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-gray-500 hidden sm:inline-block">Showing {filtered.length} of {shops.length} artisan shops</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show</span>
              <select className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A]">
                <option>8</option>
                <option>16</option>
                <option>32</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by</span>
              <select className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A]">
                <option>Default</option>
                <option>Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">CraftHub.</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Connecting artisans with craft lovers around the globe. Discover the beauty of handmade.</p>
                <div className="pt-4">
                   <p className="text-sm text-gray-500">400 University Drive Suite 200<br />Coral Gables, FL 33134 USA</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-6">Explore</h4>
                <div className="space-y-3">
                  <a href="/" className="block text-sm hover:text-white transition-colors">Home</a>
                  <a href="/shops" className="block text-sm hover:text-white transition-colors">Shops</a>
                  <a href="/items" className="block text-sm hover:text-white transition-colors">Items</a>
                  <a href="/about" className="block text-sm hover:text-white transition-colors">About Us</a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-6">Support</h4>
                <div className="space-y-3">
                  <a href="/contact" className="block text-sm hover:text-white transition-colors">Contact Us</a>
                  <a href="#" className="block text-sm hover:text-white transition-colors">Payment Options</a>
                  <a href="#" className="block text-sm hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="block text-sm hover:text-white transition-colors">Terms of Service</a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-6">Stay Updated</h4>
                <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
                <div className="flex flex-col space-y-3">
                  <input placeholder="Enter your email" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#16533A]" />
                  <button className="w-full px-4 py-2.5 rounded-lg bg-[#16533A] text-white font-medium hover:bg-[#16533A]/90 transition-colors">Subscribe</button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">© 2024 CraftHub. All rights reserved.</p>
            </div>
          </div>
        </footer>
    </div>
  )
}
