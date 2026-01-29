import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEye, FiTrash2, FiUsers, FiBarChart2, FiClock, FiEdit, FiCopy, FiLock, FiUnlock, FiSettings } from 'react-icons/fi'
import { format } from 'date-fns'
import StudentManagement from '../components/StudentManagement'
import { 
  getLecturerQuizzes, 
  deleteQuiz as deleteQuizAPI,
  togglePublishQuiz,
  duplicateQuiz as duplicateQuizAPI
} from '../services/quizService'

const EnhancedLecturerDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('quizzes')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const data = await getLecturerQuizzes()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Failed to load quizzes:', error)
      alert(error.message || 'Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleEditQuiz = (quiz) => {
    navigate(`/edit-quiz/${quiz._id || quiz.id}`)
  }

  const handleDeleteQuiz = async (quizId) => {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteQuizAPI(quizId)
        alert('Quiz deleted successfully!')
        loadQuizzes()
      } catch (error) {
        console.error('Failed to delete quiz:', error)
        alert(error.message || 'Failed to delete quiz')
      }
    }
  }

  const handleDuplicateQuiz = async (quiz) => {
    try {
      await duplicateQuizAPI(quiz._id || quiz.id)
      alert('Quiz duplicated successfully!')
      loadQuizzes()
    } catch (error) {
      console.error('Failed to duplicate quiz:', error)
      alert(error.message || 'Failed to duplicate quiz')
    }
  }

  const handleTogglePublish = async (quiz) => {
    try {
      await togglePublishQuiz(quiz._id || quiz.id, !quiz.isPublished)
      alert(`Quiz ${!quiz.isPublished ? 'published' : 'unpublished'} successfully!`)
      loadQuizzes()
    } catch (error) {
      console.error('Failed to update quiz status:', error)
      alert(error.message || 'Failed to update quiz status')
    }
  }

  const publishedQuizzes = quizzes.filter(q => q.isPublished)
  const draftQuizzes = quizzes.filter(q => !q.isPublished)
  
  // Calculate total unique students across all quizzes
  const totalStudents = quizzes.reduce((acc, q) => acc + (q.totalStudents || 0), 0)
  
  // Calculate average score across all quizzes
  const avgScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, q) => acc + (q.averageScore || 0), 0) / quizzes.length) 
    : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600 mt-2">Manage your quizzes, students, and analytics</p>
        </div>
        {activeTab === 'quizzes' && (
          <button
            onClick={() => navigate('/create-quiz')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 transition-colors shadow-sm"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create New Quiz</span>
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Quizzes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{quizzes.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                {publishedQuizzes.length} published, {draftQuizzes.length} drafts
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <FiBarChart2 className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalStudents}</p>
              <p className="text-xs text-gray-400 mt-1">Enrolled across all quizzes</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <FiUsers className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgScore}%</p>
              <p className="text-xs text-gray-400 mt-1">Across all quizzes</p>
            </div>
            <div className={`p-4 rounded-lg ${avgScore >= 75 ? 'bg-green-100' : avgScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <FiBarChart2 className={`w-7 h-7 ${avgScore >= 75 ? 'text-green-600' : avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Questions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {quizzes.reduce((acc, q) => acc + q.questions.length, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">In question bank</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <FiClock className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiBarChart2 className="inline mr-2" />
              My Quizzes
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Students
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiBarChart2 className="inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'quizzes' && (
            <div>
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <FiBarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first quiz</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
                  >
                    <FiPlus />
                    <span>Create Quiz</span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {quizzes.map((quiz) => {
                    const quizId = quiz._id || quiz.id
                    return (
                    <div key={quizId} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                            {quiz.hasPassword && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <FiLock className="w-3 h-3 mr-1" /> Password Protected
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              quiz.isPublished 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {quiz.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{quiz.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <FiClock className="mr-1" /> {quiz.duration} min
                            </span>
                            <span className="flex items-center">
                              <FiBarChart2 className="mr-1" /> {quiz.questions?.length || 0} questions
                            </span>
                            <span className="flex items-center">
                              <FiUsers className="mr-1" /> {quiz.totalStudents || 0} students
                            </span>
                            {quiz.isPublished && quiz.totalStudents > 0 && (
                              <span className="flex items-center">
                                Avg: <span className="ml-1 font-medium text-gray-700">{quiz.averageScore || 0}%</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleEditQuiz(quiz)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm font-medium"
                        >
                          <FiEdit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        
                        <button
                          onClick={() => handleTogglePublish(quiz)}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium ${
                            quiz.isPublished
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {quiz.isPublished ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                          <span>{quiz.isPublished ? 'Unpublish' : 'Publish'}</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateQuiz(quiz)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center space-x-2 text-sm font-medium"
                        >
                          <FiCopy className="w-4 h-4" />
                          <span>Duplicate</span>
                        </button>

                        <button
                          onClick={() => navigate(`/quiz/${quizId}/analytics`)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 text-sm font-medium"
                        >
                          <FiBarChart2 className="w-4 h-4" />
                          <span>Analytics</span>
                        </button>

                        <button
                          onClick={() => handleDeleteQuiz(quizId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 text-sm font-medium ml-auto"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <StudentManagement />
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <FiBarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard Coming Soon</h3>
              <p className="text-gray-500">Detailed analytics and insights will be available here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedLecturerDashboard
