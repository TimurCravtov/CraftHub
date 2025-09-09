import { Heart, ShoppingCart } from "lucide-react";
import { useLikes } from '../likesContext.jsx'

export default function ProductCard({ id, productName, sellerName, price, imageUrl }) {
    const { isLiked, toggleLike } = useLikes()
    const liked = isLiked(id)
    return (
        <div className="relative max-w-xs bg-white rounded-2xl overflow-hidden shadow transition-transform duration-300 hover:-translate-y-1 cursor-pointer">
            {/* Image */}
            <div className="relative h-48">
                <img
                    src={imageUrl}
                    alt={productName}
                    className="w-full h-full object-cover"
                />

                {/* Floating Heart */}
                <div className="absolute top-2 right-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleLike({ id, productName, sellerName, price, imageUrl }) }} className={`flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 shadow opacity-70 hover:scale-110 ${liked ? 'text-pink-600' : 'text-pink-500 hover:text-pink-700 hover:bg-white/90'}`}>
                        <Heart className={`w-4 h-4 ${liked ? 'fill-pink-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h2 className="text-sm font-semibold text-gray-900 truncate">{productName}</h2>
                <p className="text-xs text-gray-500 truncate">{sellerName}</p>

                {/* Price + Cart */}
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{price} lei</p>
                    <button className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 text-gray-500 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 hover:scale-110">
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
