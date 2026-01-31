import api from './api'

// Create a new quiz
export const createQuiz = async (quizData) => {
  try {
    return await api.post('/quizzes', quizData)
  } catch (error) {
    throw error || { message: 'Failed to create quiz' }
  }
}

// Get all quizzes for lecturer
export const getLecturerQuizzes = async () => {
  try {
    return await api.get('/quizzes/lecturer')
  } catch (error) {
    throw error || { message: 'Failed to fetch quizzes' }
  }
}

// Get quiz by ID
export const getQuizById = async (quizId) => {
  try {
    return await api.get(`/quizzes/${quizId}`)
  } catch (error) {
    throw error || { message: 'Failed to fetch quiz' }
  }
}

// Update quiz
export const updateQuiz = async (quizId, quizData) => {
  try {
    return await api.put(`/quizzes/${quizId}`, quizData)
  } catch (error) {
    throw error || { message: 'Failed to update quiz' }
  }
}

// Delete quiz
export const deleteQuiz = async (quizId) => {
  try {
    return await api.delete(`/quizzes/${quizId}`)
  } catch (error) {
    throw error || { message: 'Failed to delete quiz' }
  }
}

// Toggle publish status
export const togglePublishQuiz = async (quizId, isPublished) => {
  try {
    return await api.patch(`/quizzes/${quizId}/publish`, { isPublished })
  } catch (error) {
    throw error || { message: 'Failed to update quiz status' }
  }
}

// Duplicate quiz
export const duplicateQuiz = async (quizId) => {
  try {
    return await api.post(`/quizzes/${quizId}/duplicate`, {})
  } catch (error) {
    throw error || { message: 'Failed to duplicate quiz' }
  }
}

// Verify quiz password
export const verifyQuizPassword = async (quizId, password) => {
  try {
    return await api.post(`/quizzes/${quizId}/verify-password`, { password })
  } catch (error) {
    throw error || { message: 'Failed to verify password' }
  }
}

// Get quiz results (for lecturers)
export const getQuizResults = async (quizId) => {
  try {
    return await api.get(`/quizzes/${quizId}/results`)
  } catch (error) {
    throw error || { message: 'Failed to fetch quiz results' }
  }
}

// Get available quizzes (for students)
export const getAvailableQuizzes = async () => {
  try {
    return await api.get('/quizzes/available')
  } catch (error) {
    throw error || { message: 'Failed to fetch available quizzes' }
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
