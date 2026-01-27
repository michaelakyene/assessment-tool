import { useState } from 'react'

const QuestionCard = ({ question, index, onAnswer, initialAnswer }) => {
  const [answer, setAnswer] = useState(initialAnswer || '')

  const handleAnswerChange = (value) => {
    setAnswer(value)
    onAnswer(question._id, value)
  }

  const renderQuestionType = () => {
    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center">
                <input
                  type="radio"
                  id={`q${index}-opt${idx}`}
                  name={`question-${index}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <label
                  htmlFor={`q${index}-opt${idx}`}
                  className="ml-2 text-gray-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )

      case 'true_false':
        return (
          <div className="space-y-2">
            {['True', 'False'].map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`q${index}-${option}`}
                  name={`question-${index}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <label
                  htmlFor={`q${index}-${option}`}
                  className="ml-2 text-gray-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )

      case 'short_answer':
        return (
          <div>
            <textarea
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Type your answer here..."
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="card mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">
          Question {index + 1} ({question.marks} marks)
        </h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
          {question.type.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4">{question.text}</p>
      
      <div className="mt-4">
        {renderQuestionType()}
      </div>
    </div>
  )
}

export default QuestionCard