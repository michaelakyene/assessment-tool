import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiClock } from 'react-icons/fi'

const TakeQuiz = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Load quiz data
    setTimeout(() => {
      setQuiz({
        id: id,
        title: 'Introduction to React',
        description: 'Test your knowledge of React fundamentals',
        duration: 30, // minutes
        questions: [
          {
            id: 'q1',
            text: 'What is React primarily used for?',
            type: 'mcq',
            options: [
              'Backend development',
              'Building user interfaces',
              'Database management',
              'Mobile app development (only)'
            ],
            correctAnswer: 'Building user interfaces',
            marks: 2
          },
          {
            id: 'q2',
            text: 'React components must return a single JSX element',
            type: 'true_false',
            correctAnswer: 'True',
            marks: 1
          },
          {
            id: 'q3',
            text: 'What does JSX stand for?',
            type: 'short_answer',
            correctAnswer: 'JavaScript XML',
            marks: 2
          },
          {
            id: 'q4',
            text: 'Which of these are React hooks? (Select all that apply)',
            type: 'mcq',
            options: [
              'useState',
              'useEffect',
              'useContext',
              'All of the above'
            ],
            correctAnswer: 'All of the above',
            marks: 3
          }
        ]
      })
      setTimeLeft(30 * 60) // Convert minutes to seconds
      setLoading(false)
    }, 800)
  }, [id])

  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, quiz])

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleAutoSubmit = () => {
    if (!submitting) {
      alert('Time is up! Submitting your quiz...')
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (submitting) return
    
    const unanswered = quiz.questions.length - Object.keys(answers).length
    if (unanswered > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}. Submit anyway?`
      )
      if (!confirmSubmit) return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/attempts/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          answers: Object.entries(answers).map(([questionId, response]) => ({
            questionId,
            response
          }))
        })
      })

      const data = await response.json()
      
      if (data.showResults) {
        navigate(`/results/${data.attempt._id}`)
      } else {
        alert('Quiz submitted successfully!')
        navigate('/')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading || !quiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = quiz.questions.length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Timer */}
      <div className="fixed top-24 right-6 z-40">
        <div className={`bg-white rounded-lg shadow-lg p-4 border-2 ${
          timeLeft < 300 ? 'border-red-200' : 'border-blue-200'
        }`}>
          <div className="flex items-center space-x-3">
            <FiClock className={`w-6 h-6 ${
              timeLeft < 300 ? 'text-red-600' : 'text-blue-600'
            }`} />
            <div>
              <div className={`text-2xl font-bold ${
                timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">Time remaining</div>
            </div>
          </div>
          {timeLeft < 300 && (
            <div className="mt-2 text-xs text-red-500 font-medium">
              Hurry up! Less than 5 minutes left
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-2">{quiz.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Attempting as</div>
            <div className="font-medium">{user.name}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-2xl font-bold text-gray-900">
              {answeredCount} / {totalQuestions} questions
            </div>
          </div>
          <div className="w-64">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{Math.round((answeredCount / totalQuestions) * 100)}% complete</span>
              <span>{formatTime(timeLeft)} left</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Questions answered: {answeredCount}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiCheckCircle className="w-5 h-5" />
            <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const userAnswer = answers[question.id]
          
          return (
            <div key={question.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        {question.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {question.text}
                    </h3>
                  </div>
                </div>

                <div className="mt-6">
                  {question.type === 'mcq' && (
                    <div className="space-y-3">
                      {question.options.map((option, idx) => (
                        <div key={idx} className="flex items-center">
                          <input
                            type="radio"
                            id={`${question.id}-option-${idx}`}
                            name={question.id}
                            value={option}
                            checked={userAnswer === option}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`${question.id}-option-${idx}`}
                            className="ml-3 text-gray-700"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'true_false' && (
                    <div className="space-y-3">
                      {['True', 'False'].map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="radio"
                            id={`${question.id}-${option}`}
                            name={question.id}
                            value={option}
                            checked={userAnswer === option}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`${question.id}-${option}`}
                            className="ml-3 text-gray-700"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'short_answer' && (
                    <div>
                      <textarea
                        value={userAnswer || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Type your answer here..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit Section */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-gray-600">
            {totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} remaining
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiCheckCircle className="w-5 h-5" />
              <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz