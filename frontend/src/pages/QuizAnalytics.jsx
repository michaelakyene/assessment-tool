import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUsers, FiClock, FiBarChart2, FiTrendingUp, FiCheckCircle, FiXCircle, FiAward, FiRefreshCw } from 'react-icons/fi'
import api from '../services/api'

const QuizAnalytics = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [id])

  const loadAnalytics = async (retry = 0) => {
    try {
      setLoading(true)
      setRetrying(retry > 0)
      setError('')
      
      // Create abort controller with 15 second timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      
      try {
        // Fetch quiz details with timeout
        const quizResponse = await api.get(`/quizzes/${id}`, {
          signal: controller.signal,
          timeout: 15000
        })
        setQuiz(quizResponse.quiz || quizResponse)

        // Fetch analytics with timeout
        const analyticsResponse = await api.get(`/analytics/quiz/${id}`, {
          signal: controller.signal,
          timeout: 15000
        })
        setAnalytics(analyticsResponse)
        setError('')
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      
      if (error.code === 'ECONNABORTED' || error.message === 'Request timeout') {
        // Timeout error - retry up to 2 times
        if (retry < 2) {
// Debug log removed
          await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)))
          return loadAnalytics(retry + 1)
        }
        setError('Request timeout - server is taking too long. Please try again or check back later.')
      } else {
        setError(error?.message || error?.error || error || 'Failed to load analytics')
      }
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  const handleRetry = () => {
    loadAnalytics(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Analytics</h3>
            <p className="text-red-700 mb-4">{error || 'Quiz not found'}</p>
            <button
              onClick={handleRetry}
              disabled={loading || retrying}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {retrying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasAttempts = analytics?.attempts && analytics.attempts.length > 0
  const totalAttempts = analytics?.totalAttempts || 0
  const averageScore = analytics?.averageScore || 0
  const passRate = analytics?.passRate || 0
  const completionRate = analytics?.completionRate || 100

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Quiz Title */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <FiClock className="mr-1" /> {quiz.duration} minutes
                </span>
                <span className="flex items-center">
                  <FiBarChart2 className="mr-1" /> {quiz.questions?.length || 0} questions
                </span>
                <span className="flex items-center">
                  <FiUsers className="mr-1" /> {totalAttempts} attempts
                </span>
              </div>
            </div>
          </div>
        </div>

        {!hasAttempts ? (
          // Empty State - No Attempts Yet
          <div className="bg-white rounded-xl shadow-sm p-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBarChart2 className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Student Attempts Yet</h2>
              <p className="text-gray-600 mb-8">
                This quiz hasn't been attempted by any students yet. Once students start taking this quiz, 
                you'll see detailed analytics including performance trends, question difficulty analysis, 
                and individual student results.
              </p>
              
              {/* Preview of what analytics will show */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <FiTrendingUp className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Performance Trends</h3>
                  <p className="text-sm text-gray-600">Track average scores and completion rates over time</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <FiCheckCircle className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Question Analysis</h3>
                  <p className="text-sm text-gray-600">Identify which questions students find most challenging</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <FiAward className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Student Insights</h3>
                  <p className="text-sm text-gray-600">View individual performance and identify top performers</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Tip:</strong> Share this quiz with students to start collecting data. 
                  {quiz.isPublished 
                    ? " Your quiz is already published and ready for students!" 
                    : " Make sure to publish your quiz first so students can access it."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Analytics with Data
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium opacity-90">Total Attempts</h4>
                  <FiUsers className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-4xl font-bold">{totalAttempts}</p>
                <p className="text-sm opacity-80 mt-2">Students participated</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium opacity-90">Average Score</h4>
                  <FiBarChart2 className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-4xl font-bold">{averageScore.toFixed(1)}%</p>
                <p className="text-sm opacity-80 mt-2">Class average</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium opacity-90">Pass Rate</h4>
                  <FiCheckCircle className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-4xl font-bold">{passRate.toFixed(1)}%</p>
                <p className="text-sm opacity-80 mt-2">Students passed</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium opacity-90">Completion</h4>
                  <FiTrendingUp className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-4xl font-bold">{completionRate.toFixed(0)}%</p>
                <p className="text-sm opacity-80 mt-2">Completion rate</p>
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Attempts</h2>
              <div className="space-y-4">
                {analytics.attempts?.slice(0, 10).map((attempt) => (
                  <div 
                    key={attempt._id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all gap-3"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                        {attempt.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {attempt.student?.name || 'Anonymous Student'}
                        </p>
                        <div className="flex items-center flex-wrap gap-x-2 text-xs text-gray-600">
                          <span className="font-medium">Index: {attempt.student?.studentId || 'N/A'}</span>
                          <span>•</span>
                          <span>{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                          {attempt.timeTaken && (
                            <>
                              <span>•</span>
                              <span>{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-4 flex-shrink-0">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          attempt.percentage >= (quiz.passingScore || 50) 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {attempt.percentage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {attempt.score}/{attempt.totalMarks} points
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        attempt.percentage >= (quiz.passingScore || 50)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {attempt.percentage >= (quiz.passingScore || 50) ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default QuizAnalytics
