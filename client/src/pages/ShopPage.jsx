import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../component/Header.jsx'
import { Star, Heart, Search, ShoppingCart, User, Facebook, Instagram } from 'lucide-react'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState('description')
  const navigate = useNavigate()
  const { id } = useParams()
  const [shopName, setShopName] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [artisanName, setArtisanName] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])
  const { api } = useAuthApi()

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        // Fetch shop details by shop ID using unified api client
        const shopResp = await api.get(`/api/shops/${id}`, {noAuth: true})
        const shopData = shopResp?.data || {}

        // Normalize and set shop fields
        setShopName(shopData.name || shopData.shopName || '')
        setShopDescription(shopData.description || shopData.shopDescription || '')

        // If shop has user_id or owner id, fetch user details
        const userId = shopData.user_id || shopData.ownerId || shopData.userId
        if (userId) {
          try {
            const userResp = await api.get(`/api/users/${userId}`)
            const userData = userResp?.data || {}
            setArtisanName(userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim())
          } catch (uErr) {
            // not fatal
            console.warn('Failed to fetch user for shop', uErr)
          }
        }

        // Fetch related products for the shop
        try {
          const prodResp = await api.get(`/api/products/by-shop/${id}`, {noAuth: true})
          const prodData = prodResp?.data || []
          // normalize product shape to ensure image/price exist
          const normalized = (Array.isArray(prodData) ? prodData : []).map(p => ({
            id: p.id,
            title: p.title || p.name || 'Untitled',
            description: p.description || p.shortDescription || '',
            price: p.price ?? p.cost ?? 0,
            image: (p.imageLinks && p.imageLinks[0]) || p.image || p.imageUrl || 'https://source.unsplash.com/featured/800x600?craft',
          }))
          setRelatedProducts(normalized)
        } catch (pErr) {
          console.warn('Failed to fetch products for shop', pErr)
        }
      } catch (error) {
        console.error('Error fetching shop details:', error)
      }
    }

    if (id) fetchShopDetails()
  }, [id])

  return (
    <div className="shoppage-page">
      <Header />

      <div className="page-content page-content--no-hero">
        <div className="content-grid">
          <div className="shoppage-image-section">
            <div className="shoppage-image-container">
              <img src="/assets/modern-plant-store-interior.jpg" alt="Product" />
            </div>
          </div>

          <div className="shoppage-info-section">
            <h1 className="shoppage-artisan-name">{artisanName}</h1>
            <p className="shoppage-description">
              Discover the fine, handmade best of craft in this artisan marketplace online where talented makers like you showcase their unique creations. From pottery to jewelry, each piece tells a story of passion and skill.
            </p>
            <div className="shoppage-social-links">
              <Facebook className="shoppage-social-icon" />
              <Instagram className="shoppage-social-icon shoppage-social-icon--instagram" />
            </div>
          </div>
        </div>

        <div className="shoppage-tabs">
          <div className="shoppage-tabs-container">
            {['description', 'additional'].map((tab) => (
              <button
                key={tab}
                className={`shoppage-tab ${activeTab === tab ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' && 'Description'}
                {tab === 'additional' && 'Additional Information'}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="shoppage-tab-content shoppage-tab-content--description">
              <p>
                {shopDescription}
              </p>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="shoppage-tab-content">
              <p>Additional product information and specifications would go here.</p>
            </div>
          )}
        </div>

        <div className="shoppage-gallery">
          <div className="shoppage-gallery-item">
            <img src="/assets/modern-plant-store-interior.jpg" alt="Product detail 1" />
          </div>
          <div className="shoppage-gallery-item">
            <img src="/assets/modern-plant-store-interior.jpg" alt="Product detail 2" />
          </div>
        </div>

        <div className="shoppage-related">
          <h2 className="shoppage-related-title">Related Products</h2>
          <div className="shoppage-related-grid">
            {relatedProducts.map((product) => (
              <div key={product.id} className="shoppage-product-card">
                <div className="shoppage-product-image">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="shoppage-product-body">
                  <h3 className="shoppage-product-title">{product.title}</h3>
                  <p className="shoppage-product-description">{product.description}</p>
                  <div className="shoppage-product-footer">
                    <p className="shoppage-product-price">{product.price}</p>
                    <button className="shoppage-product-cart-btn" type="button">
                      <ShoppingCart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="shoppage-view-all">
            <button
              type="button"
              onClick={() => navigate(`/shops/${id}/Itempage`)}
              className="btn-primary"
            >
              View Shop Items
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}