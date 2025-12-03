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
        <div className="min-h-screen bg-white">
            <Header />

            <div
                className="relative h-64 bg-cover bg-center"
                style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Items</h1>
                    <div className="flex items-center space-x-2 text-white/80">
                        <a href="/" className="text-blue-400 hover:text-white">Home</a>
                        <span>&gt;</span>
                        {fromShops && (
                            <>
                                <a href="/shops" className="text-blue-400 hover:text-white">Shops</a>
                                <span>&gt;</span>
                            </>
                        )}
                        <span>Items</span>
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
                        <span className="text-sm text-slate-600">{`Showing 1-${Math.min(itemsToShow, products.length)} of ${products.length} items`}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-600">Show</span>
                            <select
                                className="border rounded px-2 py-1 bg-white"
                                value={itemsToShow}
                                onChange={(e) => setItemsToShow(Number(e.target.value))}
                            >
                                <option value={8}>8</option>
                                <option value={16}>16</option>
                                <option value={32}>32</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-600">Sort by</span>
                            <select
                                className="border rounded px-2 py-1 bg-white"
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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
        </div>
    );
}


