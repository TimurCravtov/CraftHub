import { Filter, Grid3X3, List, Star, Heart } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../component/Header.jsx'

const shops = [
  {
    id: 1,
    name: "Luna's Ceramics",
    image: "/assets/modern-plant-store-interior.jpg",
    logo: "/assets/react.svg",
    rating: 4.9,
    reviews: 87,
    description: 'Handcrafted pottery & ceramic art pieces',
    artisan: 'Luna Martinez',
  },
  {
    id: 2,
    name: 'Silversmith Studio',
    image: '/assets/modern-plant-store-interior.jpg',
    logo: '/assets/react.svg',
    rating: 4.8,
    reviews: 124,
    description: 'Custom jewelry & metalwork creations',
    artisan: 'Alex Chen',
  },
  {
    id: 3,
    name: 'Woven Dreams',
    image: '/assets/modern-plant-store-interior.jpg',
    logo: '/assets/react.svg',
    rating: 4.7,
    reviews: 156,
    description: 'Hand-woven textiles & fiber art',
    artisan: 'Maya Patel',
  },
  {
    id: 4,
    name: 'Woodcraft Atelier',
    image: '/assets/modern-plant-store-interior.jpg',
    logo: '/assets/react.svg',
    rating: 4.9,
    reviews: 92,
    description: 'Artisan furniture & wooden sculptures',
    artisan: 'David Kim',
  },
  {
    id: 5,
    name: 'Glass & Light',
    image: '/assets/modern-plant-store-interior.jpg',
    logo: '/assets/react.svg',
    rating: 4.6,
    reviews: 78,
    description: 'Blown glass art & lighting fixtures',
    artisan: 'Sofia Rodriguez',
  },
  {
    id: 6,
    name: 'Leather & Stitch',
    image: '/assets/modern-plant-store-interior.jpg',
    logo: '/assets/react.svg',
    rating: 4.8,
    reviews: 134,
    description: 'Handcrafted leather goods & accessories',
    artisan: 'James Wilson',
  },
]

export default function Shops() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const q = (params.get('q') || '').toLowerCase()
  const filtered = q
    ? shops.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.artisan.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      )
    : shops
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Artisan Shops</h1>
          <p className="text-white/90 mb-4 text-lg">Discover unique handmade creations from talented artisans</p>
          <div className="flex items-center space-x-2 text-white/80">
            <a href="/" className="hover:text-white">Home</a>
            <span>&gt;</span>
            <span>Shops</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center space-x-2 border rounded px-3 py-1.5 bg-white hover:bg-slate-50">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded hover:bg-slate-100"><Grid3X3 className="h-4 w-4" /></button>
              <button className="p-2 rounded hover:bg-slate-100"><List className="h-4 w-4" /></button>
            </div>
            <span className="text-sm text-slate-600">Showing 1-6 of 32 artisan shops</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Show</span>
              <select className="border rounded px-2 py-1 bg-white">
                <option>8</option>
                <option>16</option>
                <option>32</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Sort by</span>
              <select className="border rounded px-2 py-1 bg-white">
                <option>Default</option>
                <option>Name A-Z</option>
                <option>Rating</option>
                <option>Reviews</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filtered.map((shop) => (
            <div onClick={() => navigate(`/shops/${shop.id}`)} key={shop.id} className="relative max-w-xs bg-white rounded-2xl overflow-hidden shadow transition-transform duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="relative h-48">
                <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />

                <div className="absolute top-2 right-2">
                  <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm text-pink-500 hover:text-pink-700 hover:bg-white/90 transition-all duration-300 shadow opacity-70 hover:scale-110">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3">
                  <img src={shop.logo} alt={`${shop.name} logo`} className="w-10 h-10 rounded-full bg-white/90 p-1 shadow border" />
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{shop.name}</h3>
                <p className="text-xs text-gray-500 truncate">by {shop.artisan}</p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(shop.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm font-medium text-gray-900">{shop.rating}</span>
                    <span className="text-xs text-gray-500">({shop.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-slate-50 mt-16 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CraftHub.
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Connecting artisans with craft lovers
                <br />
                400 University Drive Suite 200
                <br />
                Coral Gables, FL 33134 USA
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-slate-600">Links</h4>
              <div className="space-y-2">
                <a href="/" className="block text-sm hover:text-slate-900">Home</a>
                <a href="/shop" className="block text-sm hover:text-slate-900">Shop</a>
                <a href="/about" className="block text-sm hover:text-slate-900">About</a>
                <a href="/contact" className="block text-sm hover:text-slate-900">Contact</a>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-slate-600">Help</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm hover:text-slate-900">Payment Options</a>
                <a href="#" className="block text-sm hover:text-slate-900">Privacy Policies</a>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-slate-600">Newsletter</h4>
              <div className="flex space-x-2">
                <input placeholder="Enter your Email Address" className="flex-1 border rounded px-3 py-2" />
                <button className="px-4 py-2 rounded bg-blue-600 text-white">SUBSCRIBE</button>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8">
            <p className="text-sm text-slate-600">All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


