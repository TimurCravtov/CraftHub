import axios from 'axios'

const API_BASE_URL = '/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // 'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

export const apiRequest = async ({ url, method = 'GET', data = null }) => {
  try {
    const response = await axiosInstance({ url, method, data })
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    throw error
  }
}

export default axiosInstance


