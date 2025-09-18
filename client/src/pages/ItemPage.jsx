import ProductCard from "../component/ProductCard.jsx";
import Header from "../component/Header.jsx";
import { Filter, Grid3X3, List } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { safeUrl } from '../utils/sanitize.js'
import { productsApi } from '../utils/productsApi.js'

export default function ItemPage() {
    const [products, setProducts] = useState([])

    const [itemsToShow, setItemsToShow] = useState(8)
    const [sortBy, setSortBy] = useState('Default')
    const location = useLocation()
    const { id: routeShopId } = useParams()
    const params = useMemo(() => new URLSearchParams(location.search), [location.search])
    const shopId = routeShopId || params.get('shopId')
    const shopName = params.get('shopName')
    const titleParam = params.get('title')

    // Prepare fetching by seller or title when backend is ready
    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                let data = []
                if (shopId) {
                    const res = await fetch(`http://localhost:8080/api/products/by-shop/${shopId}`)
                if (!res.ok) throw new Error('Failed to fetch products by shop ID')
                data = await res.json()
                } else if (titleParam) {
                    data = await productsApi.searchByTitle(titleParam)
                } else {
                    data = []
                }

                const normalized = (Array.isArray(data) ? data : []).map((p, idx) => ({
                    id: p.id ?? idx + 1,
                    title: p.title ?? 'Untitled',
                    price: p.price ?? 0,
                    imageUrl: p.imageUrl ?? 'https://source.unsplash.com/featured/800x600?craft',
                    shopId: shopId,
                }))
                if (mounted) setProducts(normalized)
            } catch (_) {
                if (mounted) setProducts([])
            }
        })()
        return () => { mounted = false }
    }, [shopId, titleParam])

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
                    <h1 className="text-4xl font-bold text-white mb-2">Shop Items</h1>
                    {shopId ? (
                        <div className="flex items-center space-x-2 text-white/80">
                            <a href="/" className="hover:text-white">Home</a>
                            <span>&gt;</span>
                            <a href="/shops" className="hover:text-white">Shops</a>
                            <span>&gt;</span>
                            <span>{shopName ? shopName : `Shop ${shopId}`}</span>
                            <span>&gt;</span>
                            <span>Items</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 text-white/80">
                            <a href="/" className="hover:text-white">Home</a>
                            <span>&gt;</span>
                            <a href="/shops" className="hover:text-white">Shops</a>
                            <span>&gt;</span>
                            <span>Items</span>
                        </div>
                    )}
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

                {!shopId && (
                    <div className="mt-6 p-4 rounded-md bg-yellow-50 text-yellow-800 text-sm">
                        No shop id detected. Navigate via a shop page (e.g., /shops/5/items) to see that shop's items.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {visibleProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            price={product.price}
                            imageUrl={safeUrl(product.imageUrl)}
                            shopId={product.shopId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
