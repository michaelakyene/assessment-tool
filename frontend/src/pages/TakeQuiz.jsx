import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiClock, FiAlertCircle, FiX, FiEye, FiEyeOff, FiChevronLeft, FiChevronRight, FiFlag, FiMenu, FiList } from 'react-icons/fi'
import api from '../services/api'

const PasswordModal = ({ isOpen, onSubmit, onCancel, loading }) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(password)
    setPassword('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-amber-100 p-3 rounded-lg">
            <FiAlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Password Protected Quiz</h2>
        </div>
        
        <p className="text-gray-600 mb-6">This quiz requires a password to begin. Please enter it below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quiz Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
        type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
      }`}>
        {type === 'error' ? (
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        ) : (
          <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        )}
        <p className={`text-sm font-medium ${
          type === 'error' ? 'text-red-800' : 'text-green-800'
        }`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Utility function to shuffle array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Apply shuffle settings to quiz
const applyShuffleSettings = (quizData) => {
  const processed = { ...quizData }
  
  // Shuffle questions if enabled
  if (quizData.randomizeQuestions) {
    processed.questions = shuffleArray(quizData.questions)
  }
  
  // Shuffle options for MCQ questions if enabled
  if (quizData.randomizeOptions) {
    processed.questions = processed.questions.map(question => {
      if (question.type === 'mcq' && Array.isArray(question.options) && question.options.length > 0) {
        // Store original correct answer
        const correctAnswer = question.correctAnswer
        
        // Create array of options with their original indices
        const optionsWithIndices = question.options.map((opt, idx) => ({
          text: opt,
          originalIndex: idx
        }))
        
        // Shuffle the options
        const shuffledOptions = shuffleArray(optionsWithIndices)
        
        // Find new position of correct answer
        const correctIndex = shuffledOptions.findIndex(
          opt => opt.originalIndex === parseInt(correctAnswer)
        )
        
        return {
          ...question,
          options: shuffledOptions.map(opt => opt.text),
          correctAnswer: correctIndex.toString()
        }
      }
      return question
    })
  }
  
  return processed
}

const TakeQuiz = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [verifyingPassword, setVerifyingPassword] = useState(false)
  const [toast, setToast] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [isAttemptStarting, setIsAttemptStarting] = useState(false)
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
  const [showSidebar, setShowSidebar] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [quizAccessToken, setQuizAccessToken] = useState(null)
  const hasSubmittedRef = useRef(false)
  const isFinalizingRef = useRef(false)

  useEffect(() => {
    loadQuiz()
  }, [id])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-save answers to localStorage
  useEffect(() => {
    if (quiz && attemptId) {
      const storageKey = `quiz_${id}_attempt_${attemptId}`
      localStorage.setItem(storageKey, JSON.stringify({
        answers,
        flaggedQuestions: Array.from(flaggedQuestions),
        currentPageIndex,
        attemptId,
        timestamp: Date.now()
      }))
    }
  }, [answers, flaggedQuestions, currentPageIndex, quiz, attemptId, id])

  // Load saved progress from localStorage - only restore non-attempt data
  useEffect(() => {
    if (quiz && attemptId) {
      const storageKey = `quiz_${id}_attempt_${attemptId}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          // Only restore if saved within last 24 hours
          if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
            setAnswers(data.answers || {})
            setFlaggedQuestions(new Set(data.flaggedQuestions || []))
            setCurrentPageIndex(data.currentPageIndex || 0)
            // Don't restore attemptId - it's already set from loadQuiz
            setToast({
              message: 'Progress restored from previous session',
              type: 'success'
            })
          }
        } catch (e) {
        }
      }
    }
  }, [quiz, attemptId, id])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFlag = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleContentProtection = (e) => {
    e.preventDefault()
    setToast({
      message: 'Copying is disabled during the quiz.',
      type: 'error'
    })
  }

  const ensureAttemptId = async () => {
    if (attemptId) return attemptId

    try {
      setIsAttemptStarting(true)
      const accessToken = quizAccessToken || localStorage.getItem(`quiz_access_${id}`)
      const attemptResponse = await api.post(
        '/attempts/start',
        { quizId: id },
        {
          headers: {
            ...(accessToken ? { 'X-Quiz-Access-Token': accessToken } : {})
          }
        }
      )

      const newAttemptId = attemptResponse?.attempt?._id || attemptResponse?.attemptId || attemptResponse?._id
      if (!newAttemptId) {
        throw new Error('Attempt ID not returned')
      }

      setAttemptId(newAttemptId)
      return newAttemptId
    } catch (err) {
      if (err?.requiresPassword) {
        setShowPasswordModal(true)
        setError('')
        return null
      }

      const errorMessage = err?.message || err?.error || err || 'Unable to initialize your attempt. Please refresh and try again.'
      setError(errorMessage)
      return null
    } finally {
      setIsAttemptStarting(false)
    }
  }

  const handleReviewClick = async () => {
    setError('')

    const ensuredAttemptId = await ensureAttemptId()
    if (!ensuredAttemptId) return

    navigate(`/quiz/${id}/review`, {
      state: {
        quiz,
        answers,
        flaggedQuestions,
        attemptId: ensuredAttemptId,
        timeLeft,
        quizId: id
      }
    })
  }

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const storedQuizAccessToken = localStorage.getItem(`quiz_access_${id}`)
      if (storedQuizAccessToken) {
        setQuizAccessToken(storedQuizAccessToken)
      }
      const response = await api.get(`/quizzes/${id}`, {
        headers: {
          ...(storedQuizAccessToken ? { 'X-Quiz-Access-Token': storedQuizAccessToken } : {})
        }
      })
      
      // Extract quiz data from response
      const quizData = response.quiz || response
      
      if (!quizData) {
        setError('Quiz not found')
        return
      }
      
      // Check if quiz requires password
      if (quizData.hasPassword && !storedQuizAccessToken) {
        setShowPasswordModal(true)
        setLoading(false)
        return
      }
      
      // Ensure questions array exists
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        setError('Quiz has no questions')
        return
      }
      
      // Apply shuffle settings (questions and/or options)
      const processedQuiz = applyShuffleSettings(quizData)
      
      setQuiz(processedQuiz)
      setTimeLeft(processedQuiz.duration * 60) // Convert minutes to seconds
      
      // Initialize empty answers
      const initialAnswers = {}
      processedQuiz.questions.forEach((q, idx) => {
        initialAnswers[q._id || idx] = ''
      })
      setAnswers(initialAnswers)

      // Start the attempt
      await ensureAttemptId()
      
    } catch (error) {
      if (error?.requiresPassword) {
        setShowPasswordModal(true)
        setError('')
      } else {
        setError(error?.message || error?.error || error || 'Failed to load quiz')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (password) => {
    try {
      setVerifyingPassword(true)
      const response = await api.post(
        `/quizzes/${id}/verify-password`,
        { password }
      )
      
      if (!response.success) {
        setToast({
          message: 'Incorrect password. Please try again.',
          type: 'error'
        })
        return
      }

      if (response.accessToken) {
        setQuizAccessToken(response.accessToken)
        localStorage.setItem(`quiz_access_${id}`, response.accessToken)
      }

      // Password verified, now load the quiz
      const quizResponse = await api.get(`/quizzes/${id}`, {
        headers: {
          ...(response.accessToken ? { 'X-Quiz-Access-Token': response.accessToken } : {})
        }
      })

      const quizData = quizResponse.quiz || quizResponse
      
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        setError('Quiz has no questions')
        return
      }
      
      // Apply shuffle settings (questions and/or options)
      const processedQuiz = applyShuffleSettings(quizData)
      
      setQuiz(processedQuiz)
      setTimeLeft(processedQuiz.duration * 60)
      
      const initialAnswers = {}
      processedQuiz.questions.forEach((q, idx) => {
        initialAnswers[q._id || idx] = ''
      })
      setAnswers(initialAnswers)
      setShowPasswordModal(false)

      await ensureAttemptId()

    } catch (err) {
      setToast({
        message: 'Incorrect password. Please try again.',
        type: 'error'
      })
    } finally {
      setVerifyingPassword(false)
    }
  }

  const handlePasswordCancel = () => {
    setShowPasswordModal(false)
    navigate('/')
  }

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

  const handleAutoSubmit = async () => {
    if (submitting) return
    setToast({
      message: 'Time is up! Submitting your quiz...',
      type: 'warning'
    })

    if (!attemptId) {
      const ensuredAttemptId = await ensureAttemptId()
      if (!ensuredAttemptId) return
    }

    handleSubmit()
  }

  const handleSubmit = async () => {
    if (submitting || !attemptId) return
    
    const unanswered = quiz.questions.filter((q, idx) => {
      const qId = q._id || idx
      return !answers[qId] || answers[qId] === ''
    }).length
    
    if (unanswered > 0) {
      setToast({
        message: `You have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}. Submitting anyway...`,
        type: 'warning'
      })
    }

    setSubmitting(true)

    try {
      // Map answers to match backend expectation
      const answersArray = quiz.questions.map((question, idx) => ({
        questionId: question._id || idx,
        response: answers[question._id || idx] || ''
      }))

      const response = await api.post(
        '/attempts/submit',
        { 
          attemptId: attemptId,
          answers: answersArray
        }
      )

// Debug log removed
      
      const attemptData = response
      hasSubmittedRef.current = true
      
      // Clear saved progress from localStorage
      const storageKey = `quiz_${id}_attempt_${attemptId}`
      localStorage.removeItem(storageKey)
      
      // Navigate to results page
      navigate(`/results/${attemptId}`)
      
    } catch (error) {
      
      const errorMsg = error?.message || error?.error || error || 'Failed to submit quiz. Please try again.'
      
      setToast({
        message: errorMsg,
        type: 'error'
      })
      setSubmitting(false)
    }
  }

  const finalizeAttemptAsTimeout = async () => {
    if (!attemptId || !quiz || hasSubmittedRef.current || isFinalizingRef.current) return
    isFinalizingRef.current = true

    try {
      await api.post('/attempts/timeout', { attemptId })
    } catch (err) {
      // Best-effort; avoid blocking navigation
    }
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!attemptId || !quiz || hasSubmittedRef.current || isFinalizingRef.current) return
      isFinalizingRef.current = true

      const token = localStorage.getItem('token')
      const baseUrl = api.defaults.baseURL || ''
      const url = `${baseUrl}/attempts/timeout`

      try {
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ attemptId }),
          keepalive: true,
          credentials: 'include'
        })
      } catch (e) {
        // Ignore
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      finalizeAttemptAsTimeout()
    }
  }, [attemptId, quiz])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading && !showPasswordModal) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-red-900 mb-2">Error Loading Quiz</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 font-medium">Loading quiz...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  // If showing password modal or no quiz loaded yet, show loading with modal overlay
  if (showPasswordModal || !quiz) {
    return (
      <>
        <PasswordModal 
          isOpen={showPasswordModal}
          onSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
          loading={verifyingPassword}
        />
      </>
    )
  }

  const answeredCount = Object.values(answers).filter(answer => answer && answer !== '').length
  const totalQuestions = quiz.questions.length
  const unansweredQuestions = quiz.questions.filter((q, idx) => {
    const qId = q._id || idx
    return !answers[qId] || answers[qId] === ''
  })
  const questionsPerPage = 5
  const totalPages = Math.ceil(totalQuestions / questionsPerPage)
  const startIndex = currentPageIndex * questionsPerPage
  const endIndex = Math.min(startIndex + questionsPerPage, totalQuestions)
  const currentPageQuestions = quiz.questions.slice(startIndex, endIndex)

  // Navigation Sidebar Component
  const NavigationSidebar = () => (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
      showSidebar ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <FiList className="w-5 h-5 mr-2" />
              Question Navigator
            </h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {answeredCount} of {totalQuestions} answered
          </div>
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-5 gap-3">
            {quiz.questions.map((q, idx) => {
              const qId = q._id || idx
              const isAnswered = answers[qId] && answers[qId] !== ''
              const isFlagged = flaggedQuestions.has(qId)

              return (
                <button
                  key={qId}
                  onClick={() => {
                    setCurrentPageIndex(Math.floor(idx / questionsPerPage))
                    setShowSidebar(false)
                    scrollToTop()
                  }}
                  className={`relative h-12 rounded-lg font-semibold transition-all ${
                    idx >= startIndex && idx < endIndex
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : isAnswered
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <FiFlag className="absolute -top-1 -right-1 w-3 h-3 text-red-600 fill-current" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded"></div>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded"></div>
              <span className="text-gray-600">Not answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiFlag className="w-4 h-4 text-red-600" />
              <span className="text-gray-600">Flagged for review</span>
            </div>
          </div>
        </div>

        {/* Review and Flags info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
          <div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="font-semibold mb-2">About Flags:</div>
              <div>Flag any question to mark it for later review</div>
            </div>
          </div>
          <button
            onClick={() => {
              handleReviewClick()
              setShowSidebar(false)
            }}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiEye className="w-4 h-4" />
            <span>Go to Review</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Navigation Sidebar */}
      <NavigationSidebar />

      {/* Sidebar overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Timer - Desktop */}
      <div className="hidden lg:block fixed top-24 right-6 z-30">
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

      {/* Timer - Mobile */}
      <div className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-30 px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FiClock className={`w-5 h-5 ${
              timeLeft < 300 ? 'text-red-600' : 'text-blue-600'
            }`} />
            <div className={`text-lg font-bold ${
              timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <FiMenu className="w-4 h-4" />
            <span>{answeredCount}/{totalQuestions}</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 mt-4 lg:mt-0">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <FiList className="w-4 h-4" />
            <span>Questions</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-2">{quiz.description}</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-sm text-gray-500">Attempting as</div>
            <div className="font-medium">{user.name}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              Page {currentPageIndex + 1} of {totalPages}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {answeredCount} answered {flaggedQuestions.size > 0 && `• ${flaggedQuestions.size} flagged`}
            </div>
          </div>
          <div className="w-full lg:w-64">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{Math.round((answeredCount / totalQuestions) * 100)}% complete</span>
              <span className="hidden sm:inline">{formatTime(timeLeft)} left</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <button
            onClick={() => setShowSidebar(true)}
            className="hidden sm:flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <FiList className="w-4 h-4" />
            <span>All Questions</span>
          </button>
        </div>
      </div>

      {/* Questions Display - Multiple per page */}
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Page {currentPageIndex + 1} of {totalPages}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Questions {startIndex + 1} - {endIndex} of {totalQuestions}
            </p>
          </div>

          {currentPageQuestions.map((question, pageIdx) => {
            const actualIdx = startIndex + pageIdx
            const questionId = question._id || actualIdx
            const isAnswered = answers[questionId] && answers[questionId] !== ''
            const isFlagged = flaggedQuestions.has(questionId)

            return (
              <div key={questionId} className="mb-8 pb-8 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        Question {actualIdx + 1} of {totalQuestions}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded capitalize">
                        {question.type.replace('_', ' ')}
                      </span>
                      {isFlagged && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded flex items-center space-x-1">
                          <FiFlag className="w-3 h-3" />
                          <span>Flagged</span>
                        </span>
                      )}
                      {isAnswered && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center space-x-1">
                          <FiCheckCircle className="w-3 h-3" />
                          <span>Answered</span>
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-base font-semibold text-gray-900 select-none"
                      onCopy={handleContentProtection}
                      onCut={handleContentProtection}
                      onContextMenu={handleContentProtection}
                    >
                      {question.question || question.text}
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleFlag(questionId)}
                    className={`ml-4 p-2 rounded-lg transition-colors flex-shrink-0 ${
                      isFlagged
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Flag for review"
                  >
                    <FiFlag className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4">
                  {question.type === 'mcq' && (
                    <div
                      className="space-y-3 select-none"
                      onCopy={handleContentProtection}
                      onCut={handleContentProtection}
                      onContextMenu={handleContentProtection}
                    >
                      {question.options.map((option, idx) => (
                        <div key={idx} className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            id={`${questionId}-option-${idx}`}
                            name={questionId}
                            value={option}
                            checked={answers[questionId] === option}
                            onChange={(e) => handleAnswer(questionId, e.target.value)}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`${questionId}-option-${idx}`}
                            className="ml-3 text-gray-700 flex-1 cursor-pointer"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'true_false' && (
                    <div
                      className="space-y-3 select-none"
                      onCopy={handleContentProtection}
                      onCut={handleContentProtection}
                      onContextMenu={handleContentProtection}
                    >
                      {['True', 'False'].map((option) => (
                        <div key={option} className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="radio"
                            id={`${questionId}-${option}`}
                            name={questionId}
                            value={option}
                            checked={answers[questionId] === option}
                            onChange={(e) => handleAnswer(questionId, e.target.value)}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`${questionId}-${option}`}
                            className="ml-3 text-gray-700 flex-1 cursor-pointer font-medium"
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
                        value={answers[questionId] || ''}
                        onChange={(e) => handleAnswer(questionId, e.target.value)}
                        placeholder="Type your answer here..."
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      ></textarea>
                      <div className="mt-2 text-sm text-gray-500">
                        {(answers[questionId] || '').length} characters
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Page Navigation Buttons */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (currentPageIndex > 0) {
                  setCurrentPageIndex(prev => prev - 1)
                  scrollToTop()
                }
              }}
              disabled={currentPageIndex === 0}
              className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous Page</span>
            </button>

            <div className="text-sm text-gray-600">
              Page {currentPageIndex + 1} of {totalPages}
            </div>

            {currentPageIndex < totalPages - 1 ? (
              <button
                onClick={() => {
                  setCurrentPageIndex(prev => prev + 1)
                  scrollToTop()
                }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <span className="hidden sm:inline">Next Page</span>
                <FiChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleReviewClick}
                disabled={isAttemptStarting}
                className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-colors min-w-[160px] ${
                  isAttemptStarting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={isAttemptStarting ? 'Preparing your attempt...' : 'Review and submit your quiz'}
              >
                <FiCheckCircle className="w-5 h-5" />
                <span>Review & Submit</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Password Modal */}
      <PasswordModal 
        isOpen={showPasswordModal}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        loading={verifyingPassword}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default TakeQuiz