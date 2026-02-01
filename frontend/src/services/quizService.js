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
    if (!quizId) {
      throw new Error('Quiz ID is required')
    }
    
    console.log(`📥 Fetching quiz with ID: ${quizId}`)
    
    const response = await Promise.race([
      api.get(`/quizzes/${quizId}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - taking longer than 15 seconds')), 15000)
      )
    ])
    
    console.log(`✅ Quiz fetched successfully:`, response)
    return response
  } catch (error) {
    console.error(`❌ Failed to fetch quiz ${quizId}:`, error)
    
    if (error.message?.includes('timeout')) {
      throw new Error('Request timeout - please check your internet connection and try again')
    }
    
    if (error.response?.status === 404) {
      throw new Error('Quiz not found - it may have been deleted')
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to access this quiz')
    }
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired - please log in again')
    }
    
    throw error || { message: 'Failed to fetch quiz' }
  }
}

// Update quiz
export const updateQuiz = async (quizId, quizData) => {
  try {
    console.log(`📝 Updating quiz ${quizId}`)
    const response = await Promise.race([
      api.put(`/quizzes/${quizId}`, quizData),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )
    ])
    console.log(`✅ Quiz updated successfully`)
    return response
  } catch (error) {
    console.error(`❌ Failed to update quiz:`, error)
    throw error || { message: 'Failed to update quiz' }
  }
}

// Delete quiz
export const deleteQuiz = async (quizId) => {
  try {
    console.log(`🗑️ Deleting quiz ${quizId}`)
    const response = await Promise.race([
      api.delete(`/quizzes/${quizId}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      )
    ])
    console.log(`✅ Quiz deleted successfully`)
    return response
  } catch (error) {
    console.error(`❌ Failed to delete quiz:`, error)
    throw error || { message: 'Failed to delete quiz' }
  }
}

// Toggle publish status
export const togglePublishQuiz = async (quizId, isPublished) => {
  try {
    console.log(`📢 ${isPublished ? 'Publishing' : 'Unpublishing'} quiz ${quizId}`)
    const response = await Promise.race([
      api.patch(`/quizzes/${quizId}/publish`, { isPublished }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      )
    ])
    console.log(`✅ Quiz ${isPublished ? 'published' : 'unpublished'} successfully`)
    return response
  } catch (error) {
    console.error(`❌ Failed to update quiz status:`, error)
    throw error || { message: 'Failed to update quiz status' }
  }
}

// Duplicate quiz
export const duplicateQuiz = async (quizId) => {
  try {
    console.log(`📋 Duplicating quiz ${quizId}`)
    const response = await Promise.race([
      api.post(`/quizzes/${quizId}/duplicate`, {}),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 20000)
      )
    ])
    console.log(`✅ Quiz duplicated successfully`)
    return response
  } catch (error) {
    console.error(`❌ Failed to duplicate quiz:`, error)
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
