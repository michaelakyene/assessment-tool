import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiCheckCircle, FiPlayCircle, FiBarChart2, FiCalendar, FiAlertCircle, FiAward, FiTrendingUp, FiRefreshCw } from 'react-icons/fi'
import { format } from 'date-fns'
import api from '../services/api'

const StudentDashboard = ({ user }) => {
  const [quizzes, setQuizzes] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch available quizzes
      const quizzesResponse = await api.get('/quizzes/available')
      
      // Set quizzes (already filtered as published on backend)
      setQuizzes(quizzesResponse.quizzes || [])
      
      // Fetch my attempts
      try {
        const attemptsResponse = await api.get('/attempts/user')
        setAttempts(attemptsResponse.attempts || [])
      } catch (attemptError) {
        setAttempts([])
      }
      
    } catch (error) {
      setError(error?.message || error?.error || error || 'Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
  }

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-red-900">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalQuizzes = quizzes.length
  const completedQuizzes = attempts.length
  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length) 
    : 0

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
            <p className="text-blue-100">Ready to ace your quizzes today?</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 backdrop-blur-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Available Quizzes</p>
              <p className="text-3xl font-bold text-gray-900">{totalQuizzes}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiPlayCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedQuizzes}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{averageScore}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiTrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Quizzes */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <FiPlayCircle className="w-7 h-7 text-blue-600" />
            <span>Available Quizzes</span>
          </h2>
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold">
            <span>{quizzes.length}</span>
            <span className="text-sm">available</span>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPlayCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No quizzes available yet</h3>
            <p className="text-gray-600 mb-6">Check back later for new quizzes from your instructors</p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const quizId = quiz._id || quiz.id
              const hasDeadline = quiz.deadline && new Date(quiz.deadline) < new Date()
              const canAttempt = !hasDeadline
              const attemptCount = quiz.attemptCount || 0
              const maxAttempts = quiz.maxAttempts || 3
              
              return (
              <div key={quizId} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{quiz.title}</h3>
                      {quiz.hasPassword && (
                        <span className="inline-block px-2 py-1 bg-white bg-opacity-20 text-white text-xs font-medium rounded">
                          🔒 Password Protected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-white bg-white bg-opacity-20 px-2 py-1 rounded">
                      <FiCalendar className="w-3 h-3" />
                      <span className="text-xs">{format(new Date(quiz.createdAt), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">{quiz.description || 'No description available'}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <FiClock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Duration</span>
                      </div>
                      <span className="font-bold text-gray-900">{quiz.duration} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Questions</span>
                      </div>
                      <span className="font-bold text-gray-900">{quiz.questions?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <FiBarChart2 className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Attempts</span>
                      </div>
                      <span className="font-bold text-gray-900">{attemptCount} / {maxAttempts}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(quizId)}
                    disabled={!canAttempt}
                    className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                      canAttempt
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FiPlayCircle className="w-5 h-5" />
                    <span>{hasDeadline ? 'Deadline Passed' : 'Start Quiz'}</span>
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Previous Attempts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <FiBarChart2 className="w-7 h-7 text-green-600" />
            <span>Your Attempts</span>
          </h2>
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-semibold">
            <span>{attempts.length}</span>
            <span className="text-sm">attempts</span>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiBarChart2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No attempts yet</h3>
            <p className="text-gray-600 mb-6">Start taking quizzes to see your performance here</p>
            {quizzes.length > 0 && (
              <button
                onClick={() => handleStartQuiz(quizzes[0]._id || quizzes[0].id)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center space-x-2"
              >
                <FiPlayCircle className="w-4 h-4" />
                <span>Start Your First Quiz</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Attempt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts.map((attempt) => (
                    <tr key={attempt._id || attempt.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {attempt.quiz?.title || 'Unknown Quiz'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full">
                          #{attempt.attemptNumber || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {attempt.score} / {attempt.totalMarks}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {attempt.percentage}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          attempt.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attempt.status || 'completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {format(new Date(attempt.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/results/${attempt._id || attempt.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard