import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheck, FiX, FiBarChart2, FiClock, FiAward, FiPercent } from 'react-icons/fi'
import { format } from 'date-fns'

const Results = ({ user }) => {
  const { attemptId } = useParams()
  const navigate = useNavigate()

  // Sample data - in real app, fetch from API
  const attempt = {
    id: attemptId,
    quiz: {
      title: 'Introduction to React',
      showResults: true,
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
          marks: 2,
          explanation: 'React is a JavaScript library for building user interfaces, particularly single-page applications.'
        },
        {
          id: 'q2',
          text: 'React components must return a single JSX element',
          type: 'true_false',
          correctAnswer: 'True',
          marks: 1,
          explanation: 'React components must return a single JSX element, which can wrap multiple elements.'
        },
        {
          id: 'q3',
          text: 'What does JSX stand for?',
          type: 'short_answer',
          correctAnswer: 'JavaScript XML',
          marks: 2,
          explanation: 'JSX stands for JavaScript XML. It allows writing HTML-like code in JavaScript.'
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
          marks: 3,
          explanation: 'All are React hooks. useState, useEffect, and useContext are commonly used hooks.'
        }
      ]
    },
    answers: [
      {
        questionId: 'q1',
        response: 'Building user interfaces',
        isCorrect: true,
        marksObtained: 2
      },
      {
        questionId: 'q2',
        response: 'True',
        isCorrect: true,
        marksObtained: 1
      },
      {
        questionId: 'q3',
        response: 'JavaScript XML',
        isCorrect: true,
        marksObtained: 2
      },
      {
        questionId: 'q4',
        response: 'useState',
        isCorrect: false,
        marksObtained: 0
      }
    ],
    score: 5,
    totalMarks: 8,
    percentage: 62.5,
    status: 'completed',
    startTime: new Date('2023-10-28T10:00:00').toISOString(),
    endTime: new Date('2023-10-28T10:25:30').toISOString(),
    timeTaken: 1530 // seconds
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

  const quiz = attempt.quiz
  const letterGrade = getLetterGrade(attempt.percentage)

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

      {/* Detailed Results */}
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