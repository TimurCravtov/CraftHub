import ProductCard from "../component/ProductCard.jsx";
import Header from "../component/Header.jsx";
import { Filter, Grid3X3, List } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function ItemPage() {
    const products = [
        {
            id: 1,
            productName: "Minimalist Table",
            sellerName: "Andrei's Shop",
            price: 20,
            imageUrl: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
        },
        {
            id: 2,
            productName: "Handmade Vase",
            sellerName: "Maria Handmade",
            price: 35,
            imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
        },
        {
            id: 3,
            productName: "Wooden Chair",
            sellerName: "Crafts by Ion",
            price: 50,
            imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        },
    ];

    const [itemsToShow, setItemsToShow] = useState(8)
    const [sortBy, setSortBy] = useState('Default')

    const sortedProducts = useMemo(() => {
        const copy = [...products]
        if (sortBy === 'Name A-Z') {
            return copy.sort((a, b) => a.productName.localeCompare(b.productName))
        }
        if (sortBy === 'Price: Low to High') {
            return copy.sort((a, b) => a.price - b.price)
        }
        if (sortBy === 'Price: High to Low') {
            return copy.sort((a, b) => b.price - a.price)
        }
        return copy
    }, [products, sortBy])

    const visibleProducts = useMemo(() => sortedProducts.slice(0, itemsToShow), [sortedProducts, itemsToShow])

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
                        <a href="/" className="hover:text-white">Home</a>
                        <span>&gt;</span>
                        <a href="/shops" className="hover:text-white">Shops</a>
                        <span>&gt;</span>
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
                    {visibleProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            productName={product.productName}
                            sellerName={product.sellerName}
                            price={product.price}
                            imageUrl={product.imageUrl}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
