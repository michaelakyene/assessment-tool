import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiUsers, FiBarChart2 } from 'react-icons/fi'
import { format } from 'date-fns'

const LecturerDashboard = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    duration: 30,
    maxAttempts: 1,
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
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const data = await api.get('/quizzes/lecturer')
      setQuizzes(data.quizzes)
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuiz = async () => {
    try {
      await api.post('/quizzes', newQuiz)
      setShowCreateModal(false)
      setNewQuiz({
        title: '',
        description: '',
        duration: 30,
        maxAttempts: 1,
        questions: []
      })
      fetchQuizzes()
    } catch (error) {
      console.error('Failed to create quiz:', error)
    }
  }

  const handlePublishToggle = async (quizId, isPublished) => {
    try {
      await api.patch(`/quizzes/${quizId}/publish`, { isPublished })
      fetchQuizzes()
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return
    
    try {
      await api.delete(`/quizzes/${quizId}`)
      fetchQuizzes()
    } catch (error) {
      console.error('Failed to delete quiz:', error)
    }
  }

  const addQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.correctAnswer) {
      alert('Please fill all required fields')
      return
    }

    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { ...currentQuestion }]
    })
    
    setCurrentQuestion({
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading quizzes...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
          <p className="text-gray-600 mt-2">Create and manage quizzes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Create Quiz</span>
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="card text-center py-12">
          <FiBarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
          <p className="text-gray-600 mb-4">Create your first quiz to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{quiz.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  quiz.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{quiz.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Attempts allowed:</span>
                  <span className="font-medium">{quiz.maxAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-medium">{quiz.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">
                    {format(new Date(quiz.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => navigate(`/quiz/${quiz._id}/results`)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <FiEye />
                  <span>Results</span>
                </button>
                <button
                  onClick={() => handlePublishToggle(quiz._id, !quiz.isPublished)}
                  className={`px-3 py-1 rounded text-sm ${
                    quiz.isPublished
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {quiz.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz._id)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Quiz</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Quiz Title</label>
                  <input
                    type="text"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                    className="input"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                    className="input"
                    rows={3}
                    placeholder="Enter quiz description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={newQuiz.duration}
                      onChange={(e) => setNewQuiz({...newQuiz, duration: parseInt(e.target.value)})}
                      className="input"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      value={newQuiz.maxAttempts}
                      onChange={(e) => setNewQuiz({...newQuiz, maxAttempts: parseInt(e.target.value)})}
                      className="input"
                      min="1"
                    />
                  </div>
                </div>

                {/* Questions Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Questions</h3>
                  
                  <div className="card mb-6">
                    <h4 className="font-medium mb-4">Add New Question</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Question Text</label>
                        <textarea
                          value={currentQuestion.text}
                          onChange={(e) => setCurrentQuestion({
                            ...currentQuestion, 
                            text: e.target.value
                          })}
                          className="input"
                          rows={3}
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Type</label>
                          <select
                            value={currentQuestion.type}
                            onChange={(e) => setCurrentQuestion({
                              ...currentQuestion,
                              type: e.target.value,
                              options: e.target.value === 'mcq' ? ['', '', '', ''] : []
                            })}
                            className="input"
                          >
                            <option value="mcq">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="short_answer">Short Answer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Marks</label>
                          <input
                            type="number"
                            value={currentQuestion.marks}
                            onChange={(e) => setCurrentQuestion({
                              ...currentQuestion,
                              marks: parseInt(e.target.value)
                            })}
                            className="input"
                            min="1"
                          />
                        </div>
                      </div>

                      {currentQuestion.type === 'mcq' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Options</label>
                          {currentQuestion.options.map((option, idx) => (
                            <div key={idx} className="flex items-center mb-2">
                              <input
                                type="radio"
                                name="correctOption"
                                checked={currentQuestion.correctAnswer === option}
                                onChange={() => setCurrentQuestion({
                                  ...currentQuestion,
                                  correctAnswer: option
                                })}
                                className="mr-2"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...currentQuestion.options]
                                  newOptions[idx] = e.target.value
                                  setCurrentQuestion({
                                    ...currentQuestion,
                                    options: newOptions
                                  })
                                }}
                                className="input flex-1"
                                placeholder={`Option ${idx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {(currentQuestion.type === 'true_false' || 
                        currentQuestion.type === 'short_answer') && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Correct Answer
                          </label>
                          {currentQuestion.type === 'true_false' ? (
                            <select
                              value={currentQuestion.correctAnswer}
                              onChange={(e) => setCurrentQuestion({
                                ...currentQuestion,
                                correctAnswer: e.target.value
                              })}
                              className="input"
                            >
                              <option value="">Select answer</option>
                              <option value="True">True</option>
                              <option value="False">False</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={currentQuestion.correctAnswer}
                              onChange={(e) => setCurrentQuestion({
                                ...currentQuestion,
                                correctAnswer: e.target.value
                              })}
                              className="input"
                              placeholder="Enter correct answer"
                            />
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Explanation (Optional)
                        </label>
                        <textarea
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion({
                            ...currentQuestion,
                            explanation: e.target.value
                          })}
                          className="input"
                          rows={2}
                          placeholder="Enter explanation for the answer"
                        />
                      </div>

                      <button
                        onClick={addQuestion}
                        className="btn btn-primary"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>

                  {/* Added Questions List */}
                  {newQuiz.questions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Added Questions ({newQuiz.questions.length})</h4>
                      <div className="space-y-3">
                        {newQuiz.questions.map((q, idx) => (
                          <div key={idx} className="card p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Q{idx + 1}: {q.text}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Type: {q.type} | Marks: {q.marks} | Answer: {q.correctAnswer}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  const updatedQuestions = newQuiz.questions.filter((_, i) => i !== idx)
                                  setNewQuiz({...newQuiz, questions: updatedQuestions})
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateQuiz}
                    disabled={!newQuiz.title || newQuiz.questions.length === 0}
                    className="btn btn-primary"
                  >
                    Create Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LecturerDashboard