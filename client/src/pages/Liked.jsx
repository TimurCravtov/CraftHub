import Header from '../component/Header.jsx'
import ProductCard from '../component/ProductCard.jsx'
import { useLikes } from '../likesContext.jsx'
import { safeUrl } from '../utils/sanitize.js'

export default function Liked() {
  const { likes } = useLikes()
  return (
    <div className="liked-page futuristic-page-base">
      <Header />

      <div className="page-content page-content--no-hero">
        {likes.length === 0 ? (
          <div className="empty-state">No liked items yet.</div>
        ) : (
          <div className="responsive-grid">
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


