import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheck, FiX, FiBarChart2, FiClock, FiAward, FiPercent, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Results = ({ user }) => {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResults()
  }, [attemptId])

  const loadResults = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/attempts/${attemptId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      setAttempt(response.data.attempt)
    } catch (error) {
      console.error('Failed to load results:', error)
      setError(error.response?.data?.message || 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  const formatTimeTaken = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiAlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Error Loading Results</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!attempt) return null

  const quiz = attempt.quiz || attempt.quizId
  const letterGrade = getLetterGrade(attempt.percentage)
  const isPassed = attempt.percentage >= (quiz.passingScore || 50)
  const correctAnswers = attempt.answers?.filter(a => a.isCorrect).length || 0
  const totalQuestions = quiz.questions?.length || 0
  const shouldShowResults = quiz.showResults !== false // Default to true if not specified

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-2">Attempt #{attempt.id} • {format(new Date(attempt.endTime), 'MMM d, yyyy h:mm a')}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Submitted by</div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-500 mt-1">({user.role})</div>
          </div>
        </div>

        {/* Show Results Not Available Message */}
        {!shouldShowResults && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-8 flex items-center space-x-3">
            <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Results Not Available</p>
              <p className="text-sm text-amber-800">The instructor has hidden detailed results for this quiz. Only your score is shown.</p>
            </div>
          </div>
        )}

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
              <FiPercent className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700 mb-1">{attempt.percentage}%</div>
            <div className="text-sm text-blue-600">Score</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
              <FiBarChart2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700 mb-1">
              {attempt.score}/{attempt.totalMarks}
            </div>
            <div className="text-sm text-green-600">Marks Obtained</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
              <FiAward className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700 mb-1">{letterGrade}</div>
            <div className="text-sm text-purple-600">Grade</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mb-3">
              <FiClock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-700 mb-1">{formatTimeTaken(attempt.timeTaken)}</div>
            <div className="text-sm text-amber-600">Time Taken</div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {attempt.answers.filter(a => a.isCorrect).length}/{quiz.questions.length}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {attempt.answers.filter(a => !a.isCorrect).length}
              </div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((attempt.answers.filter(a => a.isCorrect).length / quiz.questions.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {format(new Date(attempt.endTime), 'h:mm a')}
              </div>
              <div className="text-sm text-gray-600">Completion Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results - Only show if shouldShowResults */}
      {shouldShowResults && (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Results</h2>
        
        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const userAnswer = attempt.answers.find(a => a.questionId === question.id)
            const isCorrect = userAnswer?.isCorrect || false
            
            return (
              <div key={question.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          Question {index + 1}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded flex items-center space-x-1 ${
                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? (
                            <>
                              <FiCheck className="w-3 h-3" />
                              <span>Correct</span>
                            </>
                          ) : (
                            <>
                              <FiX className="w-3 h-3" />
                              <span>Incorrect</span>
                            </>
                          )}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                          {question.marks} mark{question.marks !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {question.text}
                      </h3>
                    </div>
                    <div className={`text-lg font-bold ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {userAnswer?.marksObtained || 0}/{question.marks}
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    {question.type === 'mcq' && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-700">Options:</div>
                        {question.options.map((option, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border ${
                              option === question.correctAnswer
                                ? 'border-green-300 bg-green-50'
                                : option === userAnswer?.response && option !== question.correctAnswer
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              {option === question.correctAnswer && (
                                <FiCheck className="w-5 h-5 text-green-600 mr-2" />
                              )}
                              {option === userAnswer?.response && option !== question.correctAnswer && (
                                <FiX className="w-5 h-5 text-red-600 mr-2" />
                              )}
                              <span className="flex-1">{option}</span>
                              {option === question.correctAnswer && (
                                <span className="text-sm font-medium text-green-600">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {option === userAnswer?.response && option !== question.correctAnswer && (
                                <span className="text-sm font-medium text-red-600">
                                  ✗ Your Answer
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(question.type === 'true_false' || question.type === 'short_answer') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Correct Answer:</div>
                          <div className="p-4 border border-green-300 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                              <FiCheck className="w-5 h-5 text-green-600 mr-2" />
                              <span>{question.correctAnswer}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Your Answer:</div>
                          <div className={`p-4 rounded-lg border ${
                            isCorrect
                              ? 'border-green-300 bg-green-50'
                              : 'border-red-300 bg-red-50'
                          }`}>
                            <div className="flex items-center">
                              {isCorrect ? (
                                <FiCheck className="w-5 h-5 text-green-600 mr-2" />
                              ) : (
                                <FiX className="w-5 h-5 text-red-600 mr-2" />
                              )}
                              <span>{userAnswer?.response || 'No answer provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm font-medium text-blue-700 mb-1">Explanation:</div>
                        <div className="text-blue-800">{question.explanation}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </button>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/quiz/${quiz.id}`)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  )
}

export default Results