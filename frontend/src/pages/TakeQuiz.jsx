import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import QuizTimer from '../components/QuizTimer'
import QuestionCard from '../components/QuestionCard'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

const TakeQuiz = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(location.state?.attempt || null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    initializeQuiz()
  }, [id])

  useEffect(() => {
    // Save answers to localStorage for recovery
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz_${id}_answers`, JSON.stringify(answers))
    }
  }, [answers, id])

  const initializeQuiz = async () => {
    try {
      // If no attempt exists in state, start a new one
      if (!attempt) {
        const response = await api.post('/attempts/start', { quizId: id })
        setAttempt(response.attempt)
      }

      // Load quiz data
      const quizData = await api.get(`/quizzes/${id}`)
      setQuiz(quizData.quiz)

      // Load saved answers
      const savedAnswers = localStorage.getItem(`quiz_${id}_answers`)
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers))
      }
    } catch (error) {
      console.error('Failed to initialize quiz:', error)
      alert(error.message || 'Failed to start quiz')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit the quiz?')) return

    setSubmitting(true)
    try {
      const answersArray = Object.entries(answers).map(([questionId, response]) => ({
        questionId,
        response
      }))

      const response = await api.post('/attempts/submit', {
        attemptId: attempt._id,
        answers: answersArray
      })

      // Clear saved answers
      localStorage.removeItem(`quiz_${id}_answers`)

      if (response.showResults) {
        navigate(`/results/${response.attempt._id}`)
      } else {
        alert('Quiz submitted successfully! Results will be available later.')
        navigate('/')
      }
    } catch (error) {
      alert(error.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTimeout = () => {
    alert('Time is up! The quiz will be submitted automatically.')
    handleSubmit()
  }

  if (loading || !quiz || !attempt) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading quiz...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {attempt.status === 'in_progress' && (
        <QuizTimer
          duration={quiz.duration}
          attemptId={attempt._id}
          onTimeout={handleTimeout}
        />
      )}

      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
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
            <div className="text-sm text-gray-500">Attempt #{attempt.attemptNumber}</div>
            <div className="text-lg font-semibold">
              {quiz.questions.length} Questions
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className="text-lg font-semibold">{quiz.duration} minutes</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold">
                {Object.keys(answers).length} / {quiz.questions.length} answered
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FiCheckCircle />
            <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <QuestionCard
            key={question._id}
            question={question}
            index={index}
            onAnswer={handleAnswer}
            initialAnswer={answers[question._id]}
          />
        ))}
      </div>

      <div className="mt-8 pt-8 border-t">
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FiCheckCircle />
            <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz