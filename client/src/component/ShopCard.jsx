import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ShopCard({ shop }) {
  const navigate = useNavigate()
  
  const shopId = shop.uuid || shop.id
  const shopName = shop.shopName || shop.name
  const bannerImage = shop.shopBannerImageUrl || shop.image || '/assets/handmade_stuff.png'
  const logoImage = shop.shopImageUrl || shop.logo || '/assets/shop-placeholder.svg'
  const artisanName = shop.artisan || 'Unknown Artisan'
  const description = shop.description || shop.shopDescription || ''

  return (
    <div
      onClick={() => navigate(`/shops/${shopId}`)}
      className="relative max-w-xs w-full bg-white rounded-2xl overflow-hidden shadow transition-transform duration-300 hover:-translate-y-1 cursor-pointer group"
    >
      <div className="relative h-48">
        <img 
          src={bannerImage} 
          alt={shopName} 
          className="w-full h-full object-cover" 
        />

        <div className="absolute top-2 right-2">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              // Add like logic here if needed
            }}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm text-pink-500 hover:text-pink-700 hover:bg-white/90 transition-all duration-300 shadow opacity-70 hover:scale-110"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3">
          <img
            src={logoImage}
            alt={`${shopName} logo`}
            className="w-16 h-16 rounded-full bg-white/90 p-1 shadow border object-cover"
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{shopName}</h3>
        <p className="text-sm text-gray-500 truncate mb-2">by {artisanName}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}
