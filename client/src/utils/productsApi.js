import { apiRequest } from './apiClient.js'

export const productsApi = {
    async getAll() {
        // GET /api/products/findall
        return apiRequest('/api/products/findall', { method: 'GET' })
    },

    async searchByTitle(title) {
        // GET /api/products/{title}
        const safeTitle = encodeURIComponent(title)
        return apiRequest(`/api/products/${safeTitle}`, { method: 'GET' })
    },

    async getBySeller(sellerId) {
        // Placeholder for a future endpoint like /api/products/by-seller/{sellerId}
        // For now, this tries to search by title if you pass a seller name instead.
        const safeId = encodeURIComponent(String(sellerId))
        return apiRequest(`/api/products/by-seller/${safeId}`, { method: 'GET' })
    }
}


