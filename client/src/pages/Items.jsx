import ProductCard from "../component/ProductCard.jsx";
import Header from "../component/Header.jsx";
import { Filter, Grid3X3, List } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { safeUrl } from '../utils/sanitize.js'
import { productsApi } from '../utils/productsApi.js'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function Items() {
    const [products, setProducts] = useState([])
    const [itemsToShow, setItemsToShow] = useState(8)
    const [sortBy, setSortBy] = useState('Default')
    const location = useLocation()
    const fromShops = useMemo(() => new URLSearchParams(location.search).get('from') === 'shops', [location.search])
    const { api } = useAuthApi()

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const productsResponse = await api.get("/api/products/findall")
                const data = productsResponse.data

                const normalized = (Array.isArray(data) ? data : []).map((p, idx) => ({
                    id: p.id ?? idx + 1,
                    uuid: p.uuid,
                    title: p.title ?? 'Untitled',
                    sellerName: p.shop?.name ?? 'Unknown seller',
                    price: p.price ?? 0,
                    imageUrl: p.imageUrl ?? (p.imageLinks && p.imageLinks[0]) ?? 'https://source.unsplash.com/featured/800x600?handmade',
                    shopId: p.shopId ?? p.shop_id,
                    shopUuid: p.shopUuid,
                    shop: p.shop,
                    imageLinks: p.imageLinks
                }))
                // shuffle
                for (let i = normalized.length - 1; i > 0; i -= 1) {
                    const j = Math.floor(Math.random() * (i + 1))
                    const tmp = normalized[i]
                    normalized[i] = normalized[j]
                    normalized[j] = tmp
                }
                if (mounted) setProducts(normalized)
            } catch (_) {
                // fallback to empty list silently; UI still renders
                if (mounted) setProducts([])
            }
        })()
        return () => { mounted = false }
    }, [])

    const searchQuery = useMemo(() => new URLSearchParams(location.search).get('q')?.toLowerCase() || '', [location.search])

    const sortedProducts = useMemo(() => {
        const copy = [...products]
        if (sortBy === 'Name A-Z') {
            return copy.sort((a, b) => a.title.localeCompare(b.title))
        }
        if (sortBy === 'Price: Low to High') {
            return copy.sort((a, b) => a.price - b.price)
        }
        if (sortBy === 'Price: High to Low') {
            return copy.sort((a, b) => b.price - a.price)
        }
        return copy
    }, [products, sortBy])

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return sortedProducts
        return sortedProducts.filter(p =>
            p.title.toLowerCase().includes(searchQuery)
        )
    }, [sortedProducts, searchQuery])

    const visibleProducts = useMemo(() => filteredProducts.slice(0, itemsToShow), [filteredProducts, itemsToShow])

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <div className="relative h-[300px] overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="/assets/handmade_stuff.png" 
                        alt="Items Hero" 
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Discover Items</h1>
                    <p className="text-gray-200 mb-8 text-lg max-w-2xl font-light">
                        Explore our curated collection of unique handmade treasures
                    </p>
                    <div className="flex items-center space-x-2 text-gray-300 text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <a href="/" className="hover:text-white transition-colors">Home</a>
                        <span>/</span>
                        {fromShops && (
                            <>
                                <a href="/shops" className="hover:text-white transition-colors">Shops</a>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-white">Items</span>
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
                        <span className="text-sm text-gray-500 hidden sm:inline-block">{`Showing 1-${Math.min(itemsToShow, products.length)} of ${products.length} items`}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Show</span>
                            <select
                                className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A]"
                                value={itemsToShow}
                                onChange={(e) => setItemsToShow(Number(e.target.value))}
                            >
                                <option value={8}>8</option>
                                <option value={16}>16</option>
                                <option value={32}>32</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Sort by</span>
                            <select
                                className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A]"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option>Default</option>
                                <option>Name A-Z</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {visibleProducts.map((p) => {
                        const product = {
                            id: p.id,
                            title: p.title,
                            description: p.description || '',
                            price: p.price,
                            imageLinks: [p.imageUrl ? safeUrl(p.imageUrl) : 'https://source.unsplash.com/featured/800x600?handmade'],
                            shop: p.shopId ? { id: p.shopId, name: p.sellerName || '' } : undefined,
                        }

                        return (
                            <ProductCard key={product.id} product={product} />
                        )
                    })}
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
    );
}


