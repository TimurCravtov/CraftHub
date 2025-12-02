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

                const validProducts = data.filter(product => product.shop_id !== null)
                const productsWithShops = await Promise.all(
                    
                validProducts.map(async (product) => {
                const id = BigInt(product.shop_id)
                const shopResponse = await api.get(`/api/shops/${id}`)
                const shopData = shopResponse.data
                product.sellerName = shopData.name  
                product.shopId = product.shop_id
                return product
          })
        )

        setProducts(productsWithShops)


                const normalized = (Array.isArray(data) ? data : []).map((p, idx) => ({
                    id: p.id ?? idx + 1,
                    title: p.title ?? 'Untitled',
                    sellerName: p.sellerName ?? 'Unknown seller',
                    price: p.price ?? 0,
                    imageUrl: p.imageUrl ?? 'https://source.unsplash.com/featured/800x600?handmade',
                    shopId: p.shopId ?? p.shop_id,
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
        <div className="items-page futuristic-page-base">
            <Header />

            <div className="page-content page-content--no-hero">
                <div className="page-toolbar">
                    <div className="page-toolbar-left">
                        <button className="btn-primary" style={{ gap: '0.5rem' }}>
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </button>
                        <div className="items-view-toggle">
                            <button><Grid3X3 className="h-4 w-4" /></button>
                            <button><List className="h-4 w-4" /></button>
                        </div>
                        <span className="items-summary">{`Showing 1-${Math.min(itemsToShow, products.length)} of ${products.length} items`}</span>
                    </div>

                    <div className="page-toolbar-right">
                        <div className="page-toolbar-left">
                            <span className="items-summary">Show</span>
                            <select
                                className="toolbar-select"
                                value={itemsToShow}
                                onChange={(e) => setItemsToShow(Number(e.target.value))}
                            >
                                <option value={8}>8</option>
                                <option value={16}>16</option>
                                <option value={32}>32</option>
                            </select>
                        </div>

                        <div className="page-toolbar-left">
                            <span className="items-summary">Sort by</span>
                            <select
                                className="toolbar-select"
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

                <div className="responsive-grid">
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


