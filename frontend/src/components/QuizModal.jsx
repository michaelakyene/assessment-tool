import { useState, useEffect } from 'react'
import { FiX, FiPlus, FiTrash2, FiLock, FiEye, FiEyeOff, FiClock, FiSettings } from 'react-icons/fi'

const QuizModal = ({ isOpen, onClose, onSave, quiz = null }) => {
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    maxAttempts: 1,
    hasPassword: false,
    password: '',
    allowReview: true,
    showCorrectAnswers: false,
    randomizeQuestions: false,
    randomizeOptions: false,
    passingScore: 50,
    isPublished: false,
    scheduledPublish: '',
    deadline: '',
    questions: []
  })

  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    explanation: ''
  })

  useEffect(() => {
    if (quiz) {
      setFormData({
        ...quiz,
        password: '',
        scheduledPublish: quiz.scheduledPublish ? new Date(quiz.scheduledPublish).toISOString().slice(0, 16) : '',
        deadline: quiz.deadline ? new Date(quiz.deadline).toISOString().slice(0, 16) : ''
      })
    }
  }, [quiz])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleQuestionChange = (e) => {
    const { name, value } = e.target
    setCurrentQuestion(prev => ({ ...prev, [name]: value }))
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index] = value
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const removeOption = (index) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index)
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }))
  }

  const addQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.correctAnswer) {
      alert('Please fill in question text and correct answer')
      return
    }

    if (currentQuestion.type === 'mcq' && currentQuestion.options.filter(o => o.trim()).length < 2) {
      alert('MCQ questions need at least 2 options')
      return
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: Date.now() }]
    }))

    setCurrentQuestion({
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    })
  }

  const removeQuestion = (id) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title || formData.questions.length === 0) {
      alert('Please provide title and at least one question')
      return
    }

    if (formData.hasPassword && !formData.password) {
      alert('Please set a password or disable password protection')
      return
    }

    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {quiz ? 'Edit Quiz' : 'Create New Quiz'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'basic'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'questions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Questions ({formData.questions.length})
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quiz description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts *
                  </label>
                  <input
                    type="number"
                    name="maxAttempts"
                    value={formData.maxAttempts}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  name="passingScore"
                  value={formData.passingScore}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="inline mr-1" /> Scheduled Publish
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledPublish"
                    value={formData.scheduledPublish}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="inline mr-1" /> Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Password Protection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FiLock className="text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Password Protection
                    </label>
                  </div>
                  <input
                    type="checkbox"
                    name="hasPassword"
                    checked={formData.hasPassword}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                {formData.hasPassword && (
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter quiz password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>

              {/* Review Settings */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-gray-900 mb-3">Review Settings</h3>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow students to review answers</span>
                  <input
                    type="checkbox"
                    name="allowReview"
                    checked={formData.allowReview}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Show correct answers in review</span>
                  <input
                    type="checkbox"
                    name="showCorrectAnswers"
                    checked={formData.showCorrectAnswers}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* Randomization */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-gray-900 mb-3">Randomization</h3>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Randomize question order</span>
                  <input
                    type="checkbox"
                    name="randomizeQuestions"
                    checked={formData.randomizeQuestions}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Randomize answer options</span>
                  <input
                    type="checkbox"
                    name="randomizeOptions"
                    checked={formData.randomizeOptions}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* Publish */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Existing Questions */}
              {formData.questions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Questions ({formData.questions.length})</h3>
                  {formData.questions.map((q, index) => (
                    <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">Q{index + 1}.</span>
                            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {q.type === 'mcq' ? 'MCQ' : q.type === 'true_false' ? 'True/False' : 'Short Answer'}
                            </span>
                            <span className="text-sm text-gray-600">({q.marks} marks)</span>
                          </div>
                          <p className="text-gray-700">{q.text}</p>
                          {q.type === 'mcq' && (
                            <ul className="mt-2 space-y-1">
                              {q.options.filter(o => o.trim()).map((opt, i) => (
                                <li key={i} className={`text-sm ${opt === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                  {opt === q.correctAnswer && '✓ '}{opt}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Question */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Add New Question</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        name="type"
                        value={currentQuestion.type}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marks
                      </label>
                      <input
                        type="number"
                        name="marks"
                        value={currentQuestion.marks}
                        onChange={handleQuestionChange}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      name="text"
                      value={currentQuestion.text}
                      onChange={handleQuestionChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter question text"
                    />
                  </div>

                  {currentQuestion.type === 'mcq' && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options
                        </label>
                        <button
                          type="button"
                          onClick={addOption}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                        >
                          <FiPlus /> <span>Add Option</span>
                        </button>
                      </div>
                      {currentQuestion.options.map((opt, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {currentQuestion.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer *
                    </label>
                    {currentQuestion.type === 'mcq' ? (
                      <select
                        name="correctAnswer"
                        value={currentQuestion.correctAnswer}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select correct answer</option>
                        {currentQuestion.options.filter(o => o.trim()).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : currentQuestion.type === 'true_false' ? (
                      <select
                        name="correctAnswer"
                        value={currentQuestion.correctAnswer}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select answer</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="correctAnswer"
                        value={currentQuestion.correctAnswer}
                        onChange={handleQuestionChange}
                        placeholder="Enter correct answer"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      name="explanation"
                      value={currentQuestion.explanation}
                      onChange={handleQuestionChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Explain the correct answer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <FiPlus />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>{quiz ? 'Update Quiz' : 'Create Quiz'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizModal
