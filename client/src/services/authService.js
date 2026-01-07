import apiClient from '../utils/apiClient'

export const authService = {
  async login(credentials) {
    const { data } = await apiClient.post('/auth/signin', credentials)
    localStorage.setItem('auth', JSON.stringify(data))
    return data
  },

  async register(userData) {
    const { data } = await apiClient.post('/auth/signup', userData)
    return data
  },

  async getCurrentUser() {
    const { data } = await apiClient.get('/users/me')
    return data
  }
}