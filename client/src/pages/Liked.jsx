import Header from '../component/Header.jsx'
import ProductCard from '../component/ProductCard.jsx'
import { useLikes } from '../likesContext.jsx'
import { safeUrl } from '../utils/sanitize.js'

export default function Liked() {
  const { likes } = useLikes()
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Liked Items</h1>
          <div className="flex items-center space-x-2 text-white/80">
            <a href="/" className="hover:text-white">Home</a>
            <span>&gt;</span>
            <a href="/liked" className="text-blue-600 font-semibold hover:text-white">Liked</a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {likes.length === 0 ? (
          <div className="text-center text-slate-600 py-16">No liked items yet.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {likes.map((p) => {
              const product = {
                id: p.id,
                title: p.title,
                description: p.description || '',
                price: p.price,
                imageLinks: [p.imageUrl ? safeUrl(p.imageUrl) : 'https://source.unsplash.com/featured/800x600?handmade'],
                shop: p.shopId ? { id: p.shopId, name: p.sellerName || '' } : undefined,
              }

              return <ProductCard key={product.id} product={product} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}


