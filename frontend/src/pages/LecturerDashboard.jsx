import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEye, FiTrash2, FiUsers, FiBarChart2, FiClock, FiEdit } from 'react-icons/fi'
import { format } from 'date-fns'

const LecturerDashboard = ({ user }) => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Load sample quizzes
    setTimeout(() => {
      setQuizzes([
        {
          id: '1',
          title: 'Introduction to React',
          description: 'Basic React concepts and components',
          duration: 30,
          maxAttempts: 2,
          questions: 10,
          isPublished: true,
          totalStudents: 25,
          averageScore: 78,
          createdAt: new Date('2023-10-15').toISOString()
        },
        {
          id: '2',
          title: 'JavaScript Fundamentals',
          description: 'Core JavaScript concepts',
          duration: 45,
          maxAttempts: 1,
          questions: 15,
          isPublished: false,
          totalStudents: 18,
          averageScore: 82,
          createdAt: new Date('2023-10-20').toISOString()
        },
        {
          id: '3',
          title: 'Web Development Basics',
          description: 'HTML, CSS, and basic web concepts',
          duration: 60,
          maxAttempts: 3,
          questions: 20,
          isPublished: true,
          totalStudents: 32,
          averageScore: 85,
          createdAt: new Date('2023-10-25').toISOString()
        }
      ])
      setLoading(false)
    }, 800)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600 mt-2">Manage your quizzes and view student results</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <FiPlus />
          <span>Create Quiz</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiBarChart2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.filter(q => q.isPublished).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiEye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.reduce((sum, quiz) => sum + quiz.totalStudents, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-90">
                {Math.round(quizzes.reduce((sum, quiz) => sum + quiz.averageScore, 0) / quizzes.length)}%
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Quizzes</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      quiz.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{quiz.description}</p>
                  
                  <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>{quiz.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>•</span>
                      <span>{quiz.questions} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>•</span>
                      <span>{quiz.maxAttempts} attempt{quiz.maxAttempts !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>•</span>
                      <span>Created {format(new Date(quiz.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}/results`)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>Results</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this quiz?')) {
                        setQuizzes(quizzes.filter(q => q.id !== quiz.id))
                      }
                    }}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Quiz</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter quiz description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Quiz created successfully!')
                      setShowCreateModal(false)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LecturerDashboard