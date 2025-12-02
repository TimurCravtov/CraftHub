import { Heart, ShoppingCart, Check } from "lucide-react";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLikes } from '../likesContext.jsx'
import { useCart } from '../cartContext.jsx'
import { useToast } from '../toastContext.jsx'
import { escapeText, safeUrl } from '../utils/sanitize.js'

export default function ProductCard({ product }) {
    const { id, title, price, imageLinks, shop } = product || {}
    const imageUrl = (imageLinks && imageLinks.length > 0) ? imageLinks[0] : null
    const sellerName = shop?.name || ''

    const { isLiked, toggleLike } = useLikes()
    const liked = isLiked(id)
    const { addToCart, items } = useCart()
    const [justAdded, setJustAdded] = useState(false)
    const inCart = items?.some(p => p.id === id)
    const { showToast } = useToast()
    const navigate = useNavigate()

    const handleCardClick = () => {
        const shopId = shop?.id
        if (shopId) {
            navigate(`/product/${shopId}/${id}`)
        } else {
            // fallback to product page using product id only
            navigate(`/product/unknown/${id}`)
        }
    }

    return (
        <div 
            className="product-card"
            onClick={handleCardClick}
        >
            {/* Image */}
            <div className="product-card-image-wrapper">
                <img
                    src={safeUrl(imageUrl)}
                    alt={escapeText(title)}
                    className="product-card-image"
                />

                {/* Floating Heart */}
                <div className="product-card-like-wrapper">
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(product) }} className={`product-card-like-button ${liked ? 'product-card-like-button--liked' : ''}`}>
                        <Heart className={`product-card-like-icon ${liked ? 'product-card-like-icon--filled' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="product-card-body">
                <h2 className="product-card-title">{title}</h2>
                <p className="product-card-seller">{sellerName}</p>

                {/* Price + Cart */}
                <div className="product-card-footer">
                    <p className="product-card-price">{Number(price)} lei</p>
                    <button
                        onClick={() => {
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
                        className={`product-card-cart-button ${inCart || justAdded ? 'product-card-cart-button--in-cart' : ''}`}
                        aria-label="Add to cart"
                    >
                        {inCart || justAdded ? <Check className="product-card-cart-icon" /> : <ShoppingCart className="product-card-cart-icon" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
