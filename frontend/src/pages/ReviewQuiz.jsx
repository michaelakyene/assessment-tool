import { useLocation, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiAlertCircle, FiList, FiChevronRight, FiChevronLeft, FiFlag, FiArrowLeft } from 'react-icons/fi'

const ReviewQuiz = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { quiz, answers, flaggedQuestions, onSubmit, currentQuestionIndex, onEdit } = location.state || {}

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

  const handleGoToQuestion = (idx) => {
    navigate(-1)
    setTimeout(() => {
      if (onEdit) onEdit(idx)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Review Your Answers</h1>
              </div>
              <p className="text-gray-600 ml-9">Check your answers before submitting the quiz</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-blue-900">{totalQuestions}</div>
                <div className="text-sm text-blue-700 font-medium mt-1">Total Questions</div>
              </div>
              <FiList className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-green-900">{answeredCount}</div>
                <div className="text-sm text-green-700 font-medium mt-1">Answered</div>
              </div>
              <FiCheckCircle className="w-12 h-12 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-red-900">{unansweredQuestions.length}</div>
                <div className="text-sm text-red-700 font-medium mt-1">Unanswered</div>
              </div>
              <FiAlertCircle className="w-12 h-12 text-red-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Unanswered Warning */}
        {unansweredQuestions.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-6 mb-6 shadow-md">
            <div className="flex items-start space-x-4">
              <FiAlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-bold text-amber-900 mb-3 text-xl">
                  {unansweredQuestions.length} Question{unansweredQuestions.length !== 1 ? 's' : ''} Need{unansweredQuestions.length === 1 ? 's' : ''} Your Attention
                </div>
                <p className="text-amber-800 mb-4">Jump to unanswered questions:</p>
                <div className="flex flex-wrap gap-3">
                  {unansweredQuestions.map((q, idx) => {
                    const qIdx = quiz.questions.indexOf(q)
                    return (
                      <button
                        key={qIdx}
                        onClick={() => handleGoToQuestion(qIdx)}
                        className="px-5 py-2.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-sm font-semibold transition-all hover:shadow-md transform hover:-translate-y-0.5"
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-6 text-2xl flex items-center">
            <FiList className="w-6 h-6 mr-3 text-blue-600" />
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
                  className={`border-2 rounded-xl p-5 transition-all hover:shadow-lg ${
                    isAnswered 
                      ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                      : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <span className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                        isAnswered ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {isFlagged && <FiFlag className="w-5 h-5 text-red-600 fill-current" />}
                          <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                            isAnswered ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                          }`}>
                            {isAnswered ? '✓ Answered' : '✗ Not answered'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGoToQuestion(idx)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <span>Go to</span>
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-gray-800 mb-3 font-medium text-lg ml-16">{q.question || q.text}</div>
                  {isAnswered && (
                    <div className="mt-4 ml-16 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-xs text-gray-500 mb-2 font-semibold uppercase">Your answer:</div>
                      <div className="text-gray-900 font-medium">{answer}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky bottom-0">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-lg"
            >
              <FiChevronLeft className="w-6 h-6" />
              <span>Continue Editing</span>
            </button>
            <button
              onClick={onSubmit}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              <FiCheckCircle className="w-6 h-6" />
              <span>Submit Quiz Now</span>
            </button>
          </div>
          {unansweredQuestions.length > 0 && (
            <div className="mt-4 text-center text-sm text-amber-700 font-medium bg-amber-50 py-2 rounded-lg">
              ⚠️ You have {unansweredQuestions.length} unanswered question{unansweredQuestions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewQuiz
