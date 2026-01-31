import { useEffect, useState } from 'react'
import api from '../services/api'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiAlertCircle, FiList, FiChevronRight, FiChevronLeft, FiFlag, FiArrowLeft, FiClock } from 'react-icons/fi'

const ReviewQuiz = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { quiz, answers, flaggedQuestions, attemptId, timeLeft: initialTimeLeft, quizId } = location.state || {}
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [reviewTimeLeft, setReviewTimeLeft] = useState(
    typeof initialTimeLeft === 'number' ? initialTimeLeft : 0
  )

  if (!quiz || !answers) {
    navigate('/')
    return null
  }

  const answeredCount = Object.values(answers).filter(answer => answer && answer !== '').length
  const totalQuestions = quiz.questions.length
  const unansweredQuestions = quiz.questions.filter((q, idx) => {
    const qId = q._id || idx
    return !answers[qId] || answers[qId] === ''
  })

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoToQuestion = () => {
    navigate(-1)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (submitting) return
    
    if (!attemptId) {
      setError('Missing attempt ID. Please return to the quiz and try again.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Ensure all answers are properly formatted with string IDs
      const answersArray = quiz.questions.map((question) => {
        const qId = String(question._id || '');
        const response = String(answers[qId] || answers[question._id] || '').trim();
        return {
          questionId: qId,
          response: response
        };
      });

      // Validate we have at least the attemptId
      if (!attemptId || !attemptId.match(/^[0-9a-f]{24}$/i)) {
        throw new Error('Invalid attempt ID format');
      }

      setSubmitting(true);
      await api.post('/attempts/submit', {
        attemptId: attemptId,
        answers: answersArray
      });

      // Clear saved progress
      if (quizId) {
        const storageKey = `quiz_${quizId}_attempt_${attemptId}`;
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(storageKey);
      }

      // Navigate to results
      navigate(`/results/${attemptId}`);
    } catch (err) {
      console.error('Submit error:', err)
      const errorMsg = err?.message || err?.error || err || 'Failed to submit quiz. Please try again.'
      setError(errorMsg)
      setSubmitting(false)
    }
  }

  const handleAutoSubmit = () => {
    if (!submitting) {
      handleSubmit()
    }
  }

  useEffect(() => {
    if (reviewTimeLeft <= 0 || !quiz) return

    const timer = setInterval(() => {
      setReviewTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [reviewTimeLeft, quiz])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-0 z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Review Your Answers</h1>
              </div>
              <p className="text-gray-600 ml-9">Check your answers before submitting the quiz</p>
            </div>
            {reviewTimeLeft > 0 && (
              <div className={`px-4 py-2 rounded-lg ${
                reviewTimeLeft < 300 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <FiClock className={`w-5 h-5 ${
                    reviewTimeLeft < 300 ? 'text-red-600' : 'text-blue-600'
                  }`} />
                  <div>
                    <div className={`text-xl font-bold ${
                      reviewTimeLeft < 300 ? 'text-red-600' : 'text-blue-900'
                    }`}>
                      {formatTime(reviewTimeLeft)}
                    </div>
                    <div className="text-xs text-gray-600">Time remaining</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {reviewTimeLeft > 0 && reviewTimeLeft < 60 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm font-medium">
                Quiz will auto-submit in {reviewTimeLeft} seconds!
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalQuestions}</div>
                <div className="text-sm text-gray-600 mt-1">Total Questions</div>
              </div>
              <FiList className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{answeredCount}</div>
                <div className="text-sm text-gray-600 mt-1">Answered</div>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{unansweredQuestions.length}</div>
                <div className="text-sm text-gray-600 mt-1">Unanswered</div>
              </div>
              <FiAlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Unanswered Warning */}
        {unansweredQuestions.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 mb-6">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-bold text-amber-900 mb-2">
                  {unansweredQuestions.length} Question{unansweredQuestions.length !== 1 ? 's' : ''} Need{unansweredQuestions.length === 1 ? 's' : ''} Your Attention
                </div>
                <p className="text-amber-800 text-sm mb-3">Jump to unanswered questions:</p>
                <div className="flex flex-wrap gap-2">
                  {unansweredQuestions.map((q, idx) => {
                    const qIdx = quiz.questions.indexOf(q)
                    return (
                      <button
                        key={qIdx}
                        onClick={handleGoToQuestion}
                        className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded text-sm font-medium"
                      >
                        Question {qIdx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Questions Review */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-5 text-xl flex items-center">
            <FiList className="w-5 h-5 mr-2 text-blue-600" />
            All Questions Overview
          </h2>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const qId = q._id || idx
              const answer = answers[qId]
              const isAnswered = answer && answer !== ''
              const isFlagged = flaggedQuestions && flaggedQuestions.has && flaggedQuestions.has(qId)

              return (
                <div
                  key={qId}
                  className={`border rounded-lg p-4 ${
                    isAnswered 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        isAnswered ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {isFlagged && <FiFlag className="w-4 h-4 text-red-600 fill-current" />}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isAnswered ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                          }`}>
                            {isAnswered ? '✓ Answered' : '✗ Not answered'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleGoToQuestion}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded flex items-center space-x-1"
                    >
                      <span>Go to</span>
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-gray-800 mb-2 font-medium ml-13">{q.question || q.text}</div>
                  {isAnswered && (
                    <div className="mt-3 ml-13 p-3 bg-white rounded border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1 font-medium">Your answer:</div>
                      <div className="text-gray-900">{answer}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="bg-white rounded-lg shadow-sm p-5 sticky bottom-0">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span>Continue Editing</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiCheckCircle className="w-5 h-5" />
              <span>{submitting ? 'Submitting...' : 'Submit Quiz Now'}</span>
            </button>
          </div>
          {unansweredQuestions.length > 0 && (
            <div className="mt-3 text-center text-sm text-amber-700 font-medium bg-amber-50 py-2 rounded">
              ⚠️ You have {unansweredQuestions.length} unanswered question{unansweredQuestions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewQuiz
