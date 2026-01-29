import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Create a new quiz
export const createQuiz = async (quizData) => {
  try {
    const response = await axios.post(`${API_URL}/quizzes`, quizData, {
      headers: getAuthHeader()
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create quiz' }
  }
}

// Get all quizzes for lecturer
export const getLecturerQuizzes = async () => {
  try {
    const response = await axios.get(`${API_URL}/quizzes/lecturer`, {
      headers: getAuthHeader()
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch quizzes' }
  }
}

// Get quiz by ID
export const getQuizById = async (quizId) => {
  try {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}`, {
      headers: getAuthHeader()
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch quiz' }
  }
}

// Update quiz
export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await axios.put(`${API_URL}/quizzes/${quizId}`, quizData, {
      headers: getAuthHeader()
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update quiz' }
  }
}

// Delete quiz
export const deleteQuiz = async (quizId) => {
  try {
    const response = await axios.delete(`${API_URL}/quizzes/${quizId}`, {
      headers: getAuthHeader()
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete quiz' }
  }
}

// Toggle publish status
export const togglePublishQuiz = async (quizId, isPublished) => {
  try {
    const response = await axios.patch(
      `${API_URL}/quizzes/${quizId}/publish`,
      { isPublished },
      { headers: getAuthHeader() }
    )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update quiz status' }
  }
}

// Duplicate quiz
export const duplicateQuiz = async (quizId) => {
  try {
    const response = await axios.post(
      `${API_URL}/quizzes/${quizId}/duplicate`,
      {},
      { headers: getAuthHeader() }
    )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to duplicate quiz' }
  }
}

// Verify quiz password
export const verifyQuizPassword = async (quizId, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/quizzes/${quizId}/verify-password`,
      { password },
      { headers: getAuthHeader() }
    )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to verify password' }
  }
}

// Get quiz results (for lecturers)
export const getQuizResults = async (quizId) => {
  try {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}/results`, {
      headers: getAuthHeader()
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch quiz results' }
  }
}

// Get available quizzes (for students)
export const getAvailableQuizzes = async () => {
  try {
    const response = await axios.get(`${API_URL}/quizzes/available`, {
      headers: getAuthHeader()
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch available quizzes' }
  }
}

export default {
  createQuiz,
  getLecturerQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
  duplicateQuiz,
  verifyQuizPassword,
  getQuizResults,
  getAvailableQuizzes
}
