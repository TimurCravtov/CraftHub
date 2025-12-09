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
    const { shopUuid, productUuid } = useParams()
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
                const productData = await productsApi.getById(productUuid)
                
                setProduct(productData)
                if (productData.shop) {
                    setShop(productData.shop)
                } else if (shopUuid && shopUuid !== 'unknown') {
                     // Fallback: try to fetch shop if not in product data
                     try {
                        const shopResponse = await api.get(`/api/shops/${shopUuid}`)
                        setShop(shopResponse.data)
                     } catch (e) {
                        console.warn("Could not fetch shop details", e)
                     }
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                if (error.response && error.response.status === 404) {
                    navigate('/404')
                    return
                }
                showToast("Failed to load product details", "error")
            } finally {
                setLoading(false)
            }
        }

        if (productUuid) {
            fetchProductDetails()
        }
    }, [shopUuid, productUuid, showToast])

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
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                            </div>
                            <div className="space-y-6">
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
                        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Handle images - use the imageUrl directly from backend
    const images = product.imageLinks || (product.imageUrl ? [product.imageUrl] : [])
    const mainImage = images[selectedImage] || images[0] || '/assets/product-placeholder.svg'

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <a href="/" className="hover:text-gray-900">Home</a>
                        <span>&gt;</span>
                        <a href="/shops" className="hover:text-gray-900">Shops</a>
                        {shop && (
                            <>
                                <span>&gt;</span>
                                <a href={`/shops/${shop.uuid || shop.id}`} className="hover:text-gray-900">{shop.name}</a>
                            </>
                        )}
                        <span>&gt;</span>
                        <span className="text-gray-900">{product.title}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                            <img
                                src={safeUrl(mainImage)}
                                alt={sanitizeInput(product.title, 'text')}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Thumbnail Images - only show if multiple images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                                            selectedImage === index 
                                                ? 'border-blue-500' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={safeUrl(image)}
                                            alt={`${sanitizeInput(product.title, 'text')} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        {/* Product Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                        </div>

                        {/* Price */}
                        <div className="text-3xl font-bold text-gray-900">
                            {Number(product.price)} lei
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Shop Info */}
                        {shop && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Sold by</h4>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                                        {shop.logo ? (
                                            <img
                                                src={safeUrl(shop.logo)}
                                                alt={shop.name || 'Shop'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : shop.profilePicture ? (
                                            <img
                                                src={safeUrl(shop.profilePicture)}
                                                alt={shop.name || 'Shop'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src="/assets/shop-placeholder.svg"
                                                alt={shop.name || 'Shop'}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{shop.name || 'Unknown Shop'}</p>
                                        {shop.description && (
                                            <p className="text-sm text-gray-600">{shop.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Quantity</h4>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleAddToCart}
                                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                        inCart || justAdded
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {inCart || justAdded ? (
                                        <>
                                            <Check className="w-5 h-5 mr-2" />
                                            {justAdded ? 'Added!' : 'In Cart'}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={handleLike}
                                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                        liked
                                            ? 'border-pink-500 bg-pink-50 text-pink-600'
                                            : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                                    }`}
                                >
                                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                                </button>
                                
                                <button className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {shop && (
                                <button
                                    onClick={() => navigate(`/shops/${shopUuid || shop.uuid || shop.id}`)}
                                    className="w-full py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
