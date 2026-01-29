import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiX, FiPlus, FiTrash2, FiLock, FiClock, FiSettings, FiSave, FiArrowLeft } from 'react-icons/fi'
import { format } from 'date-fns'
import { createQuiz, updateQuiz, getQuizById } from '../services/quizService'

const CreateQuizPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    maxAttempts: 3,
    passingScore: 50,
    scheduledPublish: '',
    deadline: '',
    password: '',
    hasPassword: false,
    allowReview: true,
    showCorrectAnswers: false,
    randomizeQuestions: false,
    randomizeOptions: false,
    isPublished: false,
    questions: []
  })

  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 10,
    explanation: ''
  })

  useEffect(() => {
    if (isEditing) {
      loadQuiz()
    }
  }, [id])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const data = await getQuizById(id)
      setFormData({
        ...data.quiz,
        scheduledPublish: data.quiz.scheduledPublish ? format(new Date(data.quiz.scheduledPublish), "yyyy-MM-dd'T'HH:mm") : '',
        deadline: data.quiz.deadline ? format(new Date(data.quiz.deadline), "yyyy-MM-dd'T'HH:mm") : ''
      })
    } catch (error) {
      alert('Failed to load quiz: ' + error.message)
      navigate('/lecturer-dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleQuestionChange = (e) => {
    const { name, value } = e.target
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index] = value
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index)
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions
      }))
    }
  }

  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      alert('Please enter question text')
      return
    }

    if (currentQuestion.type === 'mcq' && currentQuestion.options.some(opt => !opt.trim())) {
      alert('Please fill all options')
      return
    }

    if (!currentQuestion.correctAnswer) {
      alert('Please select the correct answer')
      return
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }))

    setCurrentQuestion({
      type: 'mcq',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 10,
      explanation: ''
    })
  }

  const deleteQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Please enter quiz title')
      setActiveTab('basic')
      return
    }

    if (formData.questions.length === 0) {
      alert('Please add at least one question')
      setActiveTab('questions')
      return
    }

    try {
      setLoading(true)
      const quizData = {
        ...formData,
        scheduledPublish: formData.scheduledPublish || null,
        deadline: formData.deadline || null
      }

      if (isEditing) {
        await updateQuiz(id, quizData)
        alert('Quiz updated successfully!')
      } else {
        await createQuiz(quizData)
        alert('Quiz created successfully!')
      }

      navigate('/')
    } catch (error) {
      alert('Failed to save quiz: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditing ? 'Update your quiz details' : 'Fill in the details to create a new quiz'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <FiSave className="w-5 h-5" />
              <span>{loading ? 'Saving...' : isEditing ? 'Update Quiz' : 'Save Quiz'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'basic'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiClock className="inline mr-2" />
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiSettings className="inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'questions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiPlus className="inline mr-2" />
                Questions ({formData.questions.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quiz title"
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
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quiz description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      name="maxAttempts"
                      value={formData.maxAttempts}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Publish
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduledPublish"
                      value={formData.scheduledPublish}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Password Protection</h3>
                      <p className="text-sm text-gray-600">Require a password to access this quiz</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasPassword"
                        checked={formData.hasPassword}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {formData.hasPassword && (
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter quiz password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowReview"
                      checked={formData.allowReview}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Allow Review</span>
                      <p className="text-xs text-gray-500">Students can review their answers after submission</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="showCorrectAnswers"
                      checked={formData.showCorrectAnswers}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Show Correct Answers</span>
                      <p className="text-xs text-gray-500">Display correct answers when reviewing</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="randomizeQuestions"
                      checked={formData.randomizeQuestions}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Randomize Questions</span>
                      <p className="text-xs text-gray-500">Show questions in random order</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="randomizeOptions"
                      checked={formData.randomizeOptions}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Randomize Options</span>
                      <p className="text-xs text-gray-500">Shuffle answer options for MCQ questions</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Publish Quiz</span>
                      <p className="text-xs text-gray-500">Make quiz available to students</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                {/* Question List */}
                {formData.questions.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Questions ({formData.questions.length})</h3>
                    {formData.questions.map((q, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">Q{index + 1}. </span>
                          <span className="text-gray-700">{q.text}</span>
                          <span className="ml-3 text-sm text-gray-500">({q.marks} marks)</span>
                        </div>
                        <button
                          onClick={() => deleteQuestion(index)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Question */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Question</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        name="type"
                        value={currentQuestion.type}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="short-answer">Short Answer</option>
                      </select>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your question"
                      />
                    </div>

                    {currentQuestion.type === 'mcq' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="correctAnswer"
                                value={option}
                                checked={currentQuestion.correctAnswer === option}
                                onChange={handleQuestionChange}
                                className="w-4 h-4 text-blue-600"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Option ${index + 1}`}
                              />
                              {currentQuestion.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(index)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={addOption}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    {currentQuestion.type === 'true-false' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              value="true"
                              checked={currentQuestion.correctAnswer === 'true'}
                              onChange={handleQuestionChange}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span>True</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              value="false"
                              checked={currentQuestion.correctAnswer === 'false'}
                              onChange={handleQuestionChange}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span>False</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {currentQuestion.type === 'short-answer' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          name="correctAnswer"
                          value={currentQuestion.correctAnswer}
                          onChange={handleQuestionChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter the correct answer"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Explain the correct answer"
                      />
                    </div>

                    <button
                      onClick={addQuestion}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <FiPlus className="w-5 h-5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <FiSave className="w-5 h-5" />
              <span>{loading ? 'Saving...' : isEditing ? 'Update Quiz' : 'Save Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateQuizPage
