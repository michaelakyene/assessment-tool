import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { FiClock, FiCheckCircle, FiPlayCircle, FiBarChart2 } from 'react-icons/fi'
import { format } from 'date-fns'

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [quizzesData, attemptsData] = await Promise.all([
        api.get('/quizzes/available'),
        api.get('/attempts/user')
      ])
      setQuizzes(quizzesData.quizzes)
      setAttempts(attemptsData.attempts)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async (quizId) => {
    try {
      const response = await api.post('/attempts/start', { quizId })
      navigate(`/quiz/${quizId}`, { state: { attempt: response.attempt } })
    } catch (error) {
      alert(error.message || 'Failed to start quiz')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">Take quizzes and view your results</p>
      </div>

      {/* Available Quizzes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Available Quizzes</h2>
          <FiPlayCircle className="w-6 h-6 text-blue-600" />
        </div>

        {quizzes.length === 0 ? (
          <div className="card text-center py-12">
            <FiPlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No quizzes available</h3>
            <p className="text-gray-600">Check back later for new quizzes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="card">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 text-sm">{quiz.description}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FiClock className="w-4 h-4 mr-2" />
                    <span>{quiz.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="w-4 h-4 mr-2" />
                    <span>
                      Attempts: {quiz.attemptCount} / {quiz.maxAttempts}
                    </span>
                  </div>
                  <div className="text-xs">
                    Created: {format(new Date(quiz.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>

                <button
                  onClick={() => startQuiz(quiz._id)}
                  disabled={!quiz.canAttempt}
                  className={`w-full btn ${
                    quiz.canAttempt ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {quiz.canAttempt ? 'Start Quiz' : 'Maximum Attempts Reached'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Attempts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Previous Attempts</h2>
          <FiBarChart2 className="w-6 h-6 text-green-600" />
        </div>

        {attempts.length === 0 ? (
          <div className="card text-center py-12">
            <FiBarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No attempts yet</h3>
            <p className="text-gray-600">Start a quiz to see your attempts here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempt #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {attempt.quiz?.title || 'Quiz Deleted'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        #{attempt.attemptNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">
                        {attempt.score} / {attempt.totalMarks}
                      </div>
                      <div className="text-sm text-gray-500">
                        {attempt.percentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        attempt.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : attempt.status === 'timeout'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attempt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(attempt.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/results/${attempt._id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard