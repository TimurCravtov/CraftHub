import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../component/Header.jsx'
import { Star, Heart, Search, ShoppingCart, User, Facebook, Instagram } from 'lucide-react'

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState('description')
  const navigate = useNavigate()

  const relatedProducts = [
    { id: 1, name: 'Product name', description: 'Stylish ceramic', price: '20 lei', image: '/assets/modern-plant-store-interior.jpg' },
    { id: 2, name: 'Leviosa', description: 'Stylish cafe chair', price: '15 lei', image: '/assets/modern-plant-store-interior.jpg' },
    { id: 3, name: 'Lolito', description: 'Luxury big sofa', price: '30 lei', image: '/assets/modern-plant-store-interior.jpg' },
    { id: 4, name: 'Respira', description: 'Outdoor bar table and stool', price: '100 lei', image: '/assets/modern-plant-store-interior.jpg' }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Shop name</h1>
          <div className="flex items-center space-x-2 text-white/80">
            <a href="/" className="hover:text-white">Home</a>
            <span>&gt;</span>
            <a href="/shops" className="hover:text-white">Shops</a>
            <span>&gt;</span>
            <span>Shop name</span>
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
            <h1 className="text-4xl font-bold text-gray-900">Person name</h1>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600">5 Customer Reviews</span>
            </div>
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
          <div className="grid w-full grid-cols-3 max-w-md mx-auto border rounded-lg overflow-hidden">
            {['description', 'additional', 'reviews'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm ${activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' && 'Description'}
                {tab === 'additional' && 'Additional Information'}
                {tab === 'reviews' && 'Reviews (5)'}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="mt-8 max-w-4xl mx-auto text-gray-600 leading-relaxed space-y-4">
              <p>
                Embodying the raw, temperate spirit of craft in this artisan marketplace online where talented makers like you showcase their unique creations and sell their handmade products.
              </p>
              <p>
                Weighing in under 7 pounds, the Kilburn is a lightweight piece of vintage styled engineering. Setting the bar as one of the loudest speakers in its class, the Kilburn is a compact, stout-hearted hero with a well-balanced audio which boasts a clear midrange and extended highs for a sound that is both articulate and pronounced.
              </p>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="mt-8 max-w-4xl mx-auto text-gray-600">
              <p>Additional product information and specifications would go here.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="mt-8 max-w-4xl mx-auto text-gray-600">
              <p>Customer reviews and ratings would be displayed here.</p>
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
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
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
              onClick={() => navigate('/items')}
              className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Show More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


