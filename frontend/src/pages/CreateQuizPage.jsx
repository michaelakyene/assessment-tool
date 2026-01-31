import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiX, FiPlus, FiTrash2, FiLock, FiClock, FiSettings, FiSave, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiEdit } from 'react-icons/fi'
import { format } from 'date-fns'
import { createQuiz, updateQuiz, getQuizById } from '../services/quizService'

const CreateQuizPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    maxAttempts: 1,
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
    type: 'multiple_choice',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
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
      console.log(`📚 Loading quiz: ${id}`)
      const data = await getQuizById(id)
      console.log(`✅ Quiz loaded successfully`)
      setFormData({
        ...data.quiz,
        scheduledPublish: data.quiz.scheduledPublish ? format(new Date(data.quiz.scheduledPublish), "yyyy-MM-dd'T'HH:mm") : '',
        deadline: data.quiz.deadline ? format(new Date(data.quiz.deadline), "yyyy-MM-dd'T'HH:mm") : ''
      })
    } catch (error) {
      console.error(`❌ Failed to load quiz: ${error.message}`)
      const message = error.response?.status === 404 
        ? 'Quiz not found - it may have been deleted'
        : 'Failed to load quiz: ' + error.message
      setToast({ message, type: 'error' })
      setTimeout(() => navigate('/'), 2000)
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
    if (!currentQuestion.questionText.trim()) {
      setToast({ message: 'Please enter question text', type: 'warning' })
      return
    }

    if (currentQuestion.type === 'multiple_choice' && currentQuestion.options.some(opt => !opt.trim())) {
      setToast({ message: 'Please fill all options', type: 'warning' })
      return
    }

    if (!currentQuestion.correctAnswer) {
      setToast({ message: 'Please select the correct answer', type: 'warning' })
      return
    }

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...formData.questions]
      updatedQuestions[editingQuestionIndex] = { ...currentQuestion }
      setFormData(prev => ({
        ...prev,
        questions: updatedQuestions
      }))
      setToast({ message: 'Question updated successfully!', type: 'success' })
      setEditingQuestionIndex(null)
    } else {
      // Add new question
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }))
      setToast({ message: 'Question added successfully!', type: 'success' })
    }

    setCurrentQuestion({
      type: 'multiple_choice',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    })
  }

  // Toast Component
  const Toast = ({ message, type }) => {
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
    const icon = type === 'error' ? <FiAlertCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />

    useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div className="fixed top-20 right-4 z-50 animate-slideUp">
        <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]`}>
          {icon}
          <span className="font-medium">{message}</span>
        </div>
      </div>
    )
  }

  const editQuestion = (index) => {
    const question = formData.questions[index]
    setCurrentQuestion({ ...question })
    setEditingQuestionIndex(index)
    setToast({ message: 'Editing question. Make changes and click Update.', type: 'warning' })
    // Scroll to the question form
    setTimeout(() => {
      document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const cancelEdit = () => {
    setEditingQuestionIndex(null)
    setCurrentQuestion({
      type: 'multiple_choice',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    })
    setToast({ message: 'Edit cancelled', type: 'warning' })
  }

  const deleteQuestion = (index) => {
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null)
      setCurrentQuestion({
        type: 'multiple_choice',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1,
        explanation: ''
      })
    }
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
    setToast({ message: 'Question deleted successfully!', type: 'success' })
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setToast({ message: 'Please enter a quiz title', type: 'warning' })
      setActiveTab('basic')
      return
    }

    if (!formData.duration || formData.duration < 1) {
      setToast({ message: 'Duration must be at least 1 minute', type: 'warning' })
      setActiveTab('basic')
      return
    }

    if (formData.questions.length === 0) {
      setToast({ message: 'Please add at least one question', type: 'warning' })
      setActiveTab('questions')
      return
    }

    // Validate all questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i]
      if (!q.questionText || !q.questionText.trim()) {
        setToast({ message: `Question ${i + 1}: Question text is required`, type: 'warning' })
        setActiveTab('questions')
        return
      }
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        setToast({ message: `Question ${i + 1}: Correct answer is required`, type: 'warning' })
        setActiveTab('questions')
        return
      }
      if (!q.marks || q.marks < 1) {
        setToast({ message: `Question ${i + 1}: Marks must be at least 1`, type: 'warning' })
        setActiveTab('questions')
        return
      }
      if (q.type === 'multiple_choice' && (!q.options || q.options.filter(o => o.trim()).length < 2)) {
        setToast({ message: `Question ${i + 1}: MCQ requires at least 2 options`, type: 'warning' })
        setActiveTab('questions')
        return
      }
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
        setToast({ message: 'Quiz updated successfully!', type: 'success' })
      } else {
        await createQuiz(quizData)
        setToast({ message: 'Quiz created successfully!', type: 'success' })
      }

      setTimeout(() => navigate('/'), 1500)
    } catch (error) {
      console.error('Error saving quiz:', error)
      setToast({ message: 'Failed to save quiz: ' + (error.message || 'Unknown error'), type: 'error' })
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
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Questions ({formData.questions.length})
                      </h3>
                      <div className="text-sm text-gray-600">
                        Total Marks: <span className="font-bold text-blue-600">{formData.questions.reduce((sum, q) => sum + (q.marks || 0), 0)}</span>
                      </div>
                    </div>
                    {formData.questions.map((q, index) => (
                      <div key={index} className={`rounded-lg p-5 transition-all ${
                        editingQuestionIndex === index
                          ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-500 shadow-lg ring-2 ring-blue-300 ring-opacity-50'
                          : 'bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:shadow-md'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                                Q{index + 1}
                              </span>
                              {editingQuestionIndex === index && (
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold animate-pulse flex items-center space-x-1">
                                  <FiEdit className="w-3 h-3" />
                                  <span>EDITING</span>
                                </span>
                              )}
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                q.type === 'multiple_choice' ? 'bg-purple-100 text-purple-800' :
                                q.type === 'true_false' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {q.type === 'multiple_choice' ? 'Multiple Choice' : 
                                 q.type === 'true_false' ? 'True/False' : 'Short Answer'}
                              </span>
                              <span className="text-sm font-semibold text-blue-600">
                                {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                              </span>
                            </div>
                            <p className="text-gray-900 font-medium text-base leading-relaxed">{q.questionText}</p>
                            {q.type === 'multiple_choice' && q.options && (
                              <div className="mt-3 ml-4 space-y-2">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center space-x-2 text-sm">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                      q.correctAnswer === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className={q.correctAnswer === opt ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                                      {opt}
                                    </span>
                                    {q.correctAnswer === opt && (
                                      <FiCheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.type !== 'mcq' && (
                              <div className="mt-3 flex items-center space-x-2 text-sm">
                                <span className="text-gray-600">Correct Answer:</span>
                                <span className="font-medium text-green-600">{q.correctAnswer}</span>
                              </div>
                            )}
                            {q.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-xs font-semibold text-blue-800 uppercase">Explanation:</span>
                                <p className="text-sm text-gray-700 mt-1">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => editQuestion(index)}
                              className={`p-2 rounded-lg transition-colors ${
                                editingQuestionIndex === index
                                  ? 'bg-blue-600 text-white cursor-default'
                                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                              }`}
                              title={editingQuestionIndex === index ? 'Currently editing' : 'Edit question'}
                              disabled={editingQuestionIndex === index}
                            >
                              <FiEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteQuestion(index)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete question"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add/Edit Question Form */}
                <div id="question-form" className={`border-2 rounded-lg p-6 transition-all ${
                  editingQuestionIndex !== null 
                    ? 'border-blue-500 bg-blue-50/50 shadow-lg' 
                    : 'border-dashed border-gray-300'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingQuestionIndex !== null ? (
                        <span className="flex items-center space-x-2">
                          <FiEdit className="w-5 h-5 text-blue-600" />
                          <span>Editing Question {editingQuestionIndex + 1}</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <FiPlus className="w-5 h-5 text-gray-600" />
                          <span>Add New Question</span>
                        </span>
                      )}
                    </h3>
                    {editingQuestionIndex !== null && (
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-white transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Cancel Edit</span>
                      </button>
                    )}
                  </div>
                  
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
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        name="questionText"
                        value={currentQuestion.questionText}
                        onChange={handleQuestionChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your question"
                      />
                    </div>

                    {currentQuestion.type === 'multiple_choice' && (
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
                      className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                        editingQuestionIndex !== null
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {editingQuestionIndex !== null ? (
                        <>
                          <FiCheckCircle className="w-5 h-5" />
                          <span>Update Question</span>
                        </>
                      ) : (
                        <>
                          <FiPlus className="w-5 h-5" />
                          <span>Add Question</span>
                        </>
                      )}
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
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default CreateQuizPage
