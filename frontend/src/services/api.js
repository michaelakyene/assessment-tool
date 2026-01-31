import axios from 'axios'

// Get API base URL from environment or use relative path for development
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // In development with vite proxy, use /api
  // In production, this will be relative to the domain
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})
const refreshClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const errorCode = error.response?.data?.code

    // Handle token expiry with refresh
    if (status === 401 && errorCode === 'TOKEN_EXPIRED' && !originalRequest?._retry) {
      originalRequest._retry = true
      try {
        const refreshResponse = await refreshClient.post('/auth/refresh')
        const newToken = refreshResponse?.data?.token
        if (newToken) {
          localStorage.setItem('token', newToken)
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError.message)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('auth-storage')
        
        // Only redirect if not already on login page to prevent infinite loops
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError.response?.data || refreshError.message)
      }
    }

    // Handle permanent auth failures
    if (status === 401) {
      console.warn('Authentication failed:', error.response?.data?.message)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth-storage')
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error.response?.data || error.message)
  }
)

export default api