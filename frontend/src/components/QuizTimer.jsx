import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { FiClock } from 'react-icons/fi'

const QuizTimer = ({ duration, attemptId, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60) // Convert minutes to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimeout()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleTimeout = async () => {
    try {
      await api.post('/attempts/timeout', { attemptId })
      onTimeout()
    } catch (error) {
      console.error('Failed to timeout:', error)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeLeft < 60) return 'text-red-600'
    if (timeLeft < 300) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="fixed top-20 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2">
          <FiClock className={`w-5 h-5 ${getTimerColor()}`} />
          <div className={`text-xl font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Time remaining
        </div>
        {timeLeft < 300 && (
          <div className="mt-2 text-xs text-red-500">
            Hurry up! Time is running out
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizTimer