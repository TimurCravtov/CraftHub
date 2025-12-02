import ProductCard from "../component/ProductCard.jsx";
import Header from "../component/Header.jsx";
import { Filter, Grid3X3, List } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { safeUrl } from '../utils/sanitize.js'
import { productsApi } from '../utils/productsApi.js'
import {useAuthApi} from "../context/apiAuthContext.jsx";

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
    const {api} = useAuthApi()
    // Prepare fetching by seller or title when backend is ready
    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                let data = []
                if (shopId) {

                    const res = api.get(`api/products/by-shop/${shopId}`)
                    if (!res.ok) throw new Error('Failed to fetch products by shop ID')
                data = await res.data
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
        <div className="itempage-page futuristic-page-base">
            <Header />

            <div className="page-content itempage-content page-content--no-hero">
                <div className="page-toolbar itempage-toolbar">
                    <div className="page-toolbar-left itempage-toolbar-left">
                        <button className="btn-primary" style={{ gap: '0.5rem' }}>
                            <Filter className="itempage-filter-icon" />
                            <span>Filter</span>
                        </button>
                        <div className="itempage-view-toggle">
                            <button className="itempage-view-button"><Grid3X3 className="itempage-view-icon" /></button>
                            <button className="itempage-view-button"><List className="itempage-view-icon" /></button>
                        </div>
                        <span className="itempage-summary-text">{`Showing 1-${Math.min(itemsToShow, products.length)} of ${products.length} items`}</span>
                    </div>

                    <div className="page-toolbar-right itempage-toolbar-right">
                        <div className="itempage-show-per-page">
                            <span className="itempage-summary-text">Show</span>
                            <select
                                className="toolbar-select itempage-select"
                                value={itemsToShow}
                                onChange={(e) => setItemsToShow(Number(e.target.value))}
                            >
                                <option value={8}>8</option>
                                <option value={16}>16</option>
                                <option value={32}>32</option>
                            </select>
                        </div>

                        <div className="itempage-sort-by">
                            <span className="itempage-summary-text">Sort by</span>
                            <select
                                className="toolbar-select itempage-select"
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
                    <div className="itempage-warning">
                        No shop id detected. Navigate via a shop page (e.g., /shops/5/items) to see that shop's items.
                    </div>
                )}

                <div className="responsive-grid itempage-grid">
                    {visibleProducts.map((p) => {
                        const product = {
                            id: p.id,
                            title: p.title,
                            description: p.description || '',
                            price: p.price,
                            imageLinks: [p.imageUrl ? safeUrl(p.imageUrl) : 'https://source.unsplash.com/featured/800x600?craft'],
                            shop: p.shopId ? { id: p.shopId, name: shopName || '' } : undefined,
                        }
                        return <ProductCard key={product.id} product={product} />
                    })}
                </div>
            </div>
        </div>
    );
}
