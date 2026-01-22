import { apiRequest } from './apiClient'

export const getProducts = () => 
  apiRequest({ url: '/products/findall' })

export const getProduct = (id) => 
  apiRequest({ url: `/products/findById/${id}` })

export const createProduct = (productData) => 
  apiRequest({ 
    url: '/products/', 
    method: 'POST', 
    data: productData 
  })

export const productsApi = {
    async getAll() {
        // GET /api/products/findall
        return apiRequest({ url: '/products/findall', method: 'GET' })
    },

    async getById(productId) {
        // GET /api/products/findById/{id}
        const safeId = encodeURIComponent(String(productId))
        return apiRequest({ url: `/products/findById/${safeId}`, method: 'GET' })
    },

    async searchByTitle(title) {
        // GET /api/products/{title}
        const safeTitle = encodeURIComponent(title)
        return apiRequest({ url: `/products/${safeTitle}`, method: 'GET' })
    },

    async getBySeller(sellerId) {
        // GET /api/shops/{id}/products
        const safeId = encodeURIComponent(String(sellerId))
        return apiRequest({ url: `/shops/${safeId}/products`, method: 'GET' })
    }
}


