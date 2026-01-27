import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { FiArrowLeft, FiCheck, FiX, FiBarChart2, FiClock } from 'react-icons/fi'
import { format } from 'date-fns'

const Results = () => {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchAttempt()
  }, [attemptId])

  const fetchAttempt = async () => {
    try {
      const data = await api.get(`/attempts/${attemptId}`)
      setAttempt(data.attempt)
    } catch (error) {
      console.error('Failed to fetch attempt:', error)
      alert('Failed to load results')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  if (loading || !attempt) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading results...</div>
      </div>
    )
  }

  const quiz = attempt.quiz
  const letterGrade = getLetterGrade(attempt.percentage)

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        <FiArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-2">Attempt #{attempt.attemptNumber}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Submitted</div>
            <div className="font-medium">
              {format(new Date(attempt.endTime), 'MMM d, yyyy HH:mm')}
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {attempt.score} / {attempt.totalMarks}
            </div>
            <div className="text-sm text-blue-600">Total Score</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {attempt.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-green-600">Percentage</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {letterGrade}
            </div>
            <div className="text-sm text-purple-600">Grade</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-700 mb-2">
              {attempt.timeTaken ? Math.floor(attempt.timeTaken / 60) : '--'}m
            </div>
            <div className="text-sm text-yellow-600">Time Taken</div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FiBarChart2 className="w-5 h-5 text-gray-400 mr-2" />
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                  attempt.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {attempt.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center">
                <FiClock className="w-5 h-5 text-gray-400 mr-2" />
                <span>Started: {format(new Date(attempt.startTime), 'HH:mm')}</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Question Details */}
      {showDetails && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Question Details</h2>
          
          {quiz.questions.map((question, index) => {
            const userAnswer = attempt.answers.find(
              a => a.questionId.toString() === question._id.toString()
            )
            
            return (
              <div key={question._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Question {index + 1} ({question.marks} marks)
                    </h3>
                    <p className="text-gray-700 mt-2">{question.text}</p>
                  </div>
                  <div className={`flex items-center ${
                    userAnswer?.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {userAnswer?.isCorrect ? (
                      <FiCheck className="w-5 h-5 mr-1" />
                    ) : (
                      <FiX className="w-5 h-5 mr-1" />
                    )}
                    <span className="font-semibold">
                      {userAnswer?.marksObtained || 0} / {question.marks}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {question.type === 'mcq' && question.options && (
                    <div className="space-y-2">
                      <div className="font-medium text-sm text-gray-600">Options:</div>
                      {question.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            option === question.correctAnswer
                              ? 'bg-green-50 border-green-200'
                              : option === userAnswer?.response
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            {option === question.correctAnswer && (
                              <FiCheck className="w-4 h-4 text-green-600 mr-2" />
                            )}
                            {option === userAnswer?.response && option !== question.correctAnswer && (
                              <FiX className="w-4 h-4 text-red-600 mr-2" />
                            )}
                            <span>{option}</span>
                            {option === question.correctAnswer && (
                              <span className="ml-auto text-sm text-green-600 font-medium">
                                Correct Answer
                              </span>
                            )}
                            {option === userAnswer?.response && option !== question.correctAnswer && (
                              <span className="ml-auto text-sm text-red-600 font-medium">
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(question.type === 'true_false' || question.type === 'short_answer') && (
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium text-sm text-gray-600">Correct Answer:</div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          {question.correctAnswer}
                        </div>
                      </div>
                      {userAnswer?.response && (
                        <div>
                          <div className="font-medium text-sm text-gray-600">Your Answer:</div>
                          <div className={`p-3 rounded-lg border ${
                            userAnswer.isCorrect
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}>
                            {userAnswer.response}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-sm text-blue-700 mb-1">Explanation:</div>
                      <div className="text-blue-800">{question.explanation}</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Results