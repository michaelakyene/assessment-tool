import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiCheckCircle, FiPlayCircle, FiBarChart2, FiCalendar } from 'react-icons/fi'
import { format } from 'date-fns'

const StudentDashboard = ({ user }) => {
  const [quizzes, setQuizzes] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Load sample data
    setTimeout(() => {
      setQuizzes([
        {
          id: '1',
          title: 'Introduction to React',
          description: 'Basic React concepts and components',
          duration: 30,
          maxAttempts: 2,
          attemptCount: 1,
          canAttempt: true,
          createdAt: new Date('2023-10-15').toISOString()
        },
        {
          id: '2',
          title: 'JavaScript Fundamentals',
          description: 'Core JavaScript concepts',
          duration: 45,
          maxAttempts: 1,
          attemptCount: 1,
          canAttempt: false,
          createdAt: new Date('2023-10-20').toISOString()
        },
        {
          id: '3',
          title: 'Web Development Basics',
          description: 'HTML, CSS, and basic web concepts',
          duration: 60,
          maxAttempts: 3,
          attemptCount: 0,
          canAttempt: true,
          createdAt: new Date('2023-10-25').toISOString()
        }
      ])

      setAttempts([
        {
          id: '101',
          quiz: { title: 'Introduction to React' },
          attemptNumber: 1,
          score: 8,
          totalMarks: 10,
          percentage: 80,
          status: 'completed',
          timeTaken: 1200,
          createdAt: new Date('2023-10-28').toISOString()
        },
        {
          id: '102',
          quiz: { title: 'JavaScript Fundamentals' },
          attemptNumber: 1,
          score: 12,
          totalMarks: 15,
          percentage: 80,
          status: 'completed',
          timeTaken: 1800,
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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-600 mt-2">Take quizzes and track your progress</p>
      </div>

      {/* Available Quizzes */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Quizzes</h2>
          <div className="flex items-center space-x-2 text-blue-600">
            <FiPlayCircle className="w-6 h-6" />
            <span className="font-medium">{quizzes.length} available</span>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiPlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No quizzes available</h3>
            <p className="text-gray-600">Check back later for new quizzes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm">{quiz.description}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <FiCalendar className="w-4 h-4" />
                      <span>{format(new Date(quiz.createdAt), 'MMM d')}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <FiClock className="w-4 h-4" />
                        <span>Duration</span>
                      </div>
                      <span className="font-medium">{quiz.duration} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Attempts</span>
                      </div>
                      <span className="font-medium">
                        {quiz.attemptCount} / {quiz.maxAttempts}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    disabled={!quiz.canAttempt}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
                      quiz.canAttempt
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {quiz.canAttempt ? 'Start Quiz' : 'Attempts Used'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Attempts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Attempts</h2>
          <div className="flex items-center space-x-2 text-green-600">
            <FiBarChart2 className="w-6 h-6" />
            <span className="font-medium">{attempts.length} attempts</span>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiBarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No attempts yet</h3>
            <p className="text-gray-600">Start a quiz to see your attempts here</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempt
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
                    <tr key={attempt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {attempt.quiz.title}
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
                          {attempt.percentage}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          attempt.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attempt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(attempt.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/results/${attempt.id}`)}
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
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard