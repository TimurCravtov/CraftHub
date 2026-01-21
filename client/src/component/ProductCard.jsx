import { Heart, ShoppingCart, Check } from "lucide-react";
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLikes } from '../context/likesContext.jsx'
import { useCart } from '../context/cartContext.jsx'
import { useToast } from '../context/toastContext.jsx'
import { escapeText, safeUrl } from '../utils/sanitize.js'

export default function ProductCard({ product }) {
    const { id, uuid, title, price, imageLinks, shop, shopId, shopUuid } = product || {}
    const imageUrl = (imageLinks && imageLinks.length > 0) ? imageLinks[0] : '/assets/product-placeholder.svg'
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
            className="group relative block w-full max-w-xs overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-slate-300/50"
        >
            {/* Image */}
            <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                    src={safeUrl(imageUrl)}
                    alt={escapeText(title)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Floating Heart */}
                <div className="absolute top-3 right-3 z-10">
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(product) }} 
                        aria-label="Like"
                        className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-sm ${liked ? 'bg-white/90 text-pink-500' : 'bg-white/70 text-slate-600 hover:bg-white hover:text-pink-500'}`}
                    >
                        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="mb-4">
                    <h2 className="mb-1 truncate text-lg font-bold text-slate-900">{title}</h2>
                    <p className="truncate text-sm font-medium text-slate-500">{sellerName}</p>
                </div>

                {/* Price + Cart */}
                <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-900">{Number(price)} lei</p>
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
                                    if (!wasInCart) {
                                        const evt = new CustomEvent('cart:remove', { detail: { id } })
                                        window.dispatchEvent(evt)
                                    }
                                }
                            })
                            setTimeout(() => setJustAdded(false), 1200)
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 shadow-sm ${inCart || justAdded ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white'}`}
                        aria-label="Add to cart"
                    >
                        {inCart || justAdded ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                    </button>
                </div>
            </div>
        </Link>
    );
}
