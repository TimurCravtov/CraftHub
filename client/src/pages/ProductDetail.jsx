import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../component/Header.jsx'
import { Heart, ShoppingCart, Check, ArrowLeft, Share2, Minus, Plus } from 'lucide-react'
import { useLikes } from '../likesContext.jsx'
import { useCart } from '../cartContext.jsx'
import { useToast } from '../toastContext.jsx'
import { safeUrl, escapeText } from '../utils/sanitize.js'
import { productsApi } from '../utils/productsApi.js'
import { useSecurity } from '../hooks/useSecurity.js'
import { useAuthApi } from '../context/apiAuthContext.jsx'


export default function ProductDetail() {
    const { shopId, productId } = useParams()
    const navigate = useNavigate()
    const { isLiked, toggleLike } = useLikes()
    const { addToCart, items } = useCart()
    const { showToast } = useToast()
    const { sanitizeInput } = useSecurity()
    const { api } = useAuthApi()
    
    const [product, setProduct] = useState(null)
    const [shop, setShop] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(0)
    const [justAdded, setJustAdded] = useState(false)
    
    const liked = product ? isLiked(product.id) : false
    const inCart = product ? items?.some(p => p.id === product.id) : false

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true)
                
                // Fetch product details using productsApi
                const productData = await productsApi.getById(productId)
                
                // Fetch shop details
                const shopResponse = await api.get(`/api/shops/${shopId}`)
                const shopData = shopResponse.data
                
                setProduct(productData)
                setShop(shopData)
            } catch (error) {
                console.error("Error fetching data:", error)
                showToast("Failed to load product details", "error")
            } finally {
                setLoading(false)
            }
        }

        if (shopId && productId) {
            fetchProductDetails()
        }
    }, [shopId, productId, showToast])

    const handleAddToCart = () => {
        if (!product) return
        
        const wasInCart = inCart
        addToCart(product, quantity, { allowIncrement: false })
        setJustAdded(true)
        showToast(wasInCart ? 'Item already in cart' : 'Added to cart', 'success', 5000, {
            actionLabel: wasInCart ? undefined : 'Undo',
            onAction: () => {
                if (!wasInCart) {
                    const evt = new CustomEvent('cart:remove', { detail: { id: product.id } })
                    window.dispatchEvent(evt)
                }
            }
        })
        setTimeout(() => setJustAdded(false), 1200)
    }

    const handleLike = () => {
        if (!product) return
        toggleLike({
            id: product.id,
            title: product.title,
            sellerName: shop?.name || 'Unknown',
            price: product.price,
            imageUrl: product.imageUrl
        })
    }

    if (loading) {
        return (
            <div className="product-page futuristic-page-base">
                <Header />
                <div className="container-2xl product-container">
                    <div className="product-skeleton">
                        <div className="product-grid">
                            <div>
                                <div className="product-image-placeholder" />
                            </div>
                            <div>
                                <div className="product-skeleton-line product-skeleton-line--lg" />
                                <div className="product-skeleton-line product-skeleton-line--md" />
                                <div className="product-skeleton-line product-skeleton-line--sm" />
                                <div className="product-skeleton-line product-skeleton-line--sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product || !shop) {
        return (
            <div className="product-page futuristic-page-base">
                <Header />
                <div className="container-2xl product-container">
                    <div className="empty-state">
                        <h1 className="empty-state-title">Product not found</h1>
                        <p className="empty-state-text">The product you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                        >
                            <ArrowLeft size={16} />
                            Go back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Handle images - use the imageUrl directly from backend
    const images = product.imageUrl ? [product.imageUrl] : []
    const mainImage = images[selectedImage] || product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'

    return (
        <div className="product-page futuristic-page-base">
            <Header />

            <div className="product-breadcrumb-bar">
                <div className="product-breadcrumb-inner">
                    <nav className="product-breadcrumb">
                        <a href="/">Home</a>
                        <span>&gt;</span>
                        <a href="/shops">Shops</a>
                        <span>&gt;</span>
                        <a href={`/shops/${shopId}`}>{shop?.name || 'Shop'}</a>
                        <span>&gt;</span>
                        <span className="product-breadcrumb-current">{product.title}</span>
                    </nav>
                </div>
            </div>

            <div className="product-container">
                <div className="product-grid">
                    {/* Product Images */}
                    <div className="product-gallery">
                        <div className="product-image-main">
                            <img
                                src={safeUrl(mainImage)}
                                alt={sanitizeInput(product.title, 'text')}
                            />
                        </div>
                        
                        {/* Thumbnail Images - only show if multiple images */}
                        {images.length > 1 && (
                            <div className="product-thumbnails">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`product-thumbnail ${selectedImage === index ? 'is-active' : ''}`}
                                    >
                                        <img
                                            src={safeUrl(image)}
                                            alt={`${sanitizeInput(product.title, 'text')} ${index + 1}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="product-details">
                        <div>
                            <h1 className="product-title">{product.title}</h1>
                        </div>

                        <div className="product-price">
                            {Number(product.price)} lei
                        </div>

                        {product.description && (
                            <div>
                                <h3 className="product-section-title">Description</h3>
                                <p className="product-description-text">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {shop && (
                            <div className="product-shop-card">
                                <h4 className="product-section-title">Sold by</h4>
                                <div className="product-shop-info">
                                    <div className="product-shop-avatar">
                                        {shop.logo || shop.profilePicture ? (
                                            <img
                                                src={safeUrl(shop.logo || shop.profilePicture)}
                                                alt={shop.name || 'Shop'}
                                            />
                                        ) : (
                                            <span>{shop.name ? shop.name.charAt(0).toUpperCase() : 'S'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="product-shop-name">{shop.name || 'Unknown Shop'}</p>
                                        {shop.description && (
                                            <p className="product-shop-description">{shop.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="product-section-title">Quantity</h4>
                            <div className="product-quantity-controls">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="product-quantity-button"
                                    type="button"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="product-quantity-value">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="product-quantity-button"
                                    type="button"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="product-actions">
                            <div className="product-actions-row">
                                <button
                                    onClick={handleAddToCart}
                                    className={`btn-primary product-primary-button ${inCart || justAdded ? 'product-primary-button--in-cart' : ''}`}
                                >
                                    {inCart || justAdded ? (
                                        <>
                                            <Check size={20} />
                                            {justAdded ? 'Added!' : 'In Cart'}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={handleLike}
                                    className={`product-like-button ${liked ? 'is-liked' : ''}`}
                                    type="button"
                                >
                                    <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                                </button>
                                
                                <button className="product-share-button" type="button">
                                    <Share2 size={20} />
                                </button>
                            </div>
                            
                            {shop && (
                                <button
                                    onClick={() => navigate(`/shops/${shopId}`)}
                                    className="btn-secondary btn-secondary--full btn-secondary--large"
                                >
                                    View Shop
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
