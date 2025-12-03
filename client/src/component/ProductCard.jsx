import { Heart, ShoppingCart, Check } from "lucide-react";
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLikes } from '../likesContext.jsx'
import { useCart } from '../cartContext.jsx'
import { useToast } from '../toastContext.jsx'
import { escapeText, safeUrl } from '../utils/sanitize.js'

export default function ProductCard({ product }) {
    const { id, uuid, title, price, imageLinks, shop, shopId, shopUuid } = product || {}
    const imageUrl = (imageLinks && imageLinks.length > 0) ? imageLinks[0] : null
    const sellerName = shop?.name || ''

    const { isLiked, toggleLike } = useLikes()
    const liked = isLiked(id)
    const { addToCart, items } = useCart()
    const [justAdded, setJustAdded] = useState(false)
    const inCart = items?.some(p => p.id === id)
    const { showToast } = useToast()
    const navigate = useNavigate()

    const finalShopId = shop?.uuid || shopUuid || shop?.id || shopId
    const finalProductId = uuid || id
    
    const productLink = (finalShopId !== undefined && finalShopId !== null) 
        ? `/product/${finalShopId}/${finalProductId}`
        : `/product/unknown/${finalProductId}`

    return (
        <Link 
            to={productLink}
            className="block relative max-w-xs bg-white rounded-2xl overflow-hidden shadow transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
        >
            {/* Image */}
            <div className="relative h-48">
                <img
                    src={safeUrl(imageUrl)}
                    alt={escapeText(title)}
                    className="w-full h-full object-cover"
                />

                {/* Floating Heart */}
                <div className="absolute top-2 right-2">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(product) }} className={`flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm transition-all duration-300 shadow opacity-70 hover:scale-110 ${liked ? 'text-pink-600' : 'text-pink-500 hover:text-pink-700 hover:bg-white/90'}`}>
                        <Heart className={`w-4 h-4 ${liked ? 'fill-pink-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h2 className="text-sm font-semibold text-gray-900 truncate">{title}</h2>
                <p className="text-xs text-gray-500 truncate">{sellerName}</p>

                {/* Price + Cart */}
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{Number(price)} lei</p>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const wasInCart = inCart
                            addToCart(product, 1, { allowIncrement: false })
                            setJustAdded(true)
                            showToast(wasInCart ? 'Item already in cart' : 'Added to cart', 'success', 5000, {
                                actionLabel: wasInCart ? undefined : 'Undo',
                                onAction: () => {
                                    // Remove if it was just added now
                                    if (!wasInCart) {
                                        // Use direct cart API to remove
                                        const evt = new CustomEvent('cart:remove', { detail: { id } })
                                        window.dispatchEvent(evt)
                                    }
                                }
                            })
                            setTimeout(() => setJustAdded(false), 1200)
                        }}
                        className={`flex items-center justify-center w-8 h-8 border rounded-lg transition-all duration-200 hover:scale-110 ${inCart || justAdded ? 'bg-green-600 border-green-600 text-white hover:bg-green-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700'}`}
                        aria-label="Add to cart"
                    >
                        {inCart || justAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </Link>
    );
}
