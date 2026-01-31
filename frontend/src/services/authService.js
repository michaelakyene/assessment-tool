import api from './api'

// Register new user
export const register = async (userData) => {
  try {
    const data = await api.post('/auth/register', userData)
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  } catch (error) {
    throw error || { message: 'Registration failed' }
  }
}

// Login user
export const login = async (credentials) => {
  try {
    const data = await api.post('/auth/login', credentials)
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  } catch (error) {
    throw error || { message: 'Login failed' }
  }
}

// Logout user
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated
}
