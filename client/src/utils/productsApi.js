import { apiRequest } from './apiClient'

export const getProducts = () => 
  apiRequest({ url: '/api/products/findall' })

export const getProduct = (id) => 
  apiRequest({ url: `/api/products/findById/${id}` })

export const createProduct = (productData) => 
  apiRequest({ 
    url: '/api/products/', 
    method: 'POST', 
    data: productData 
  })

export const productsApi = {
    async getAll() {
        // GET /api/products/findall
        return apiRequest({ url: '/api/products/findall', method: 'GET' })
    },

    async getById(productId) {
        // GET /api/products/findById/{id}
        const safeId = encodeURIComponent(String(productId))
        return apiRequest({ url: `/api/products/findById/${safeId}`, method: 'GET' })
    },

    async searchByTitle(title) {
        // GET /api/products/{title}
        const safeTitle = encodeURIComponent(title)
        return apiRequest({ url: `/api/products/${safeTitle}`, method: 'GET' })
    },

    async getBySeller(sellerId) {
        // GET /api/products/by-shop/{id}
        const safeId = encodeURIComponent(String(sellerId))
        return apiRequest({ url: `/api/products/by-shop/${safeId}`, method: 'GET' })
    }
}


