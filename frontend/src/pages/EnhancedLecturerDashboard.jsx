import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEye, FiTrash2, FiUsers, FiBarChart2, FiClock, FiEdit, FiCopy, FiLock, FiUnlock, FiSettings, FiTrendingUp, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import StudentManagement from '../components/StudentManagement'
import { 
  getLecturerQuizzes, 
  deleteQuiz as deleteQuizAPI,
  togglePublishQuiz,
  duplicateQuiz as duplicateQuizAPI
} from '../services/quizService'

const EnhancedLecturerDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('quizzes')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const data = await getLecturerQuizzes()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Failed to load quizzes:', error)
      setToast({ message: error.message || 'Failed to load quizzes', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleEditQuiz = (quiz) => {
    navigate(`/edit-quiz/${quiz._id || quiz.id}`)
  }

  const handleDeleteQuiz = async (quizId) => {
    setConfirmModal({
      title: 'Delete Quiz',
      message: 'Are you sure you want to delete this quiz? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteQuizAPI(quizId)
          setToast({ message: 'Quiz deleted successfully!', type: 'success' })
          loadQuizzes()
        } catch (error) {
          console.error('Failed to delete quiz:', error)
          setToast({ message: error.message || 'Failed to delete quiz', type: 'error' })
        } finally {
          setConfirmModal(null)
        }
      },
      onCancel: () => setConfirmModal(null)
    })
  }

  const handleDuplicateQuiz = async (quiz) => {
    try {
      await duplicateQuizAPI(quiz._id || quiz.id)
      setToast({ message: 'Quiz duplicated successfully!', type: 'success' })
      loadQuizzes()
    } catch (error) {
      console.error('Failed to duplicate quiz:', error)
      setToast({ message: error.message || 'Failed to duplicate quiz', type: 'error' })
    }
  }

  const handleTogglePublish = async (quiz) => {
    try {
      await togglePublishQuiz(quiz._id || quiz.id, !quiz.isPublished)
      setToast({ message: `Quiz ${!quiz.isPublished ? 'published' : 'unpublished'} successfully!`, type: 'success' })
      loadQuizzes()
    } catch (error) {
      console.error('Failed to update quiz status:', error)
      setToast({ message: error.message || 'Failed to update quiz status', type: 'error' })
    }
  }

  const publishedQuizzes = quizzes.filter(q => q.isPublished)
  const draftQuizzes = quizzes.filter(q => !q.isPublished)
  
  // Calculate total unique students across all quizzes
  const totalStudents = quizzes.reduce((acc, q) => acc + (q.totalStudents || 0), 0)
  
  // Calculate average score across all quizzes
  const avgScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, q) => acc + (q.averageScore || 0), 0) / quizzes.length) 
    : 0

  // Toast Component
  const Toast = ({ message, type }) => {
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
    const Icon = type === 'error' ? FiAlertCircle : FiCheckCircle

    useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div className="fixed top-20 right-4 z-50 animate-slideUp">
        <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]`}>
          <Icon className="w-5 h-5" />
          <span className="font-medium">{message}</span>
        </div>
      </div>
    )
  }

  // Confirmation Modal Component
  const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <FiAlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600 mt-2">Manage your quizzes, students, and analytics</p>
        </div>
        {activeTab === 'quizzes' && (
          <button
            onClick={() => navigate('/create-quiz')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 transition-colors shadow-sm"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create New Quiz</span>
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Quizzes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{quizzes.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                {publishedQuizzes.length} published, {draftQuizzes.length} drafts
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <FiBarChart2 className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalStudents}</p>
              <p className="text-xs text-gray-400 mt-1">Enrolled across all quizzes</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <FiUsers className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgScore}%</p>
              <p className="text-xs text-gray-400 mt-1">Across all quizzes</p>
            </div>
            <div className={`p-4 rounded-lg ${avgScore >= 75 ? 'bg-green-100' : avgScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <FiBarChart2 className={`w-7 h-7 ${avgScore >= 75 ? 'text-green-600' : avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Questions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {quizzes.reduce((acc, q) => acc + q.questions.length, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">In question bank</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <FiClock className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiBarChart2 className="inline mr-2" />
              My Quizzes
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Students
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiBarChart2 className="inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'quizzes' && (
            <div>
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <FiBarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first quiz</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
                  >
                    <FiPlus />
                    <span>Create Quiz</span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {quizzes.map((quiz) => {
                    const quizId = quiz._id || quiz.id
                    return (
                    <div key={quizId} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                            {quiz.hasPassword && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <FiLock className="w-3 h-3 mr-1" /> Password Protected
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              quiz.isPublished 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {quiz.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{quiz.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <FiClock className="mr-1" /> {quiz.duration} min
                            </span>
                            <span className="flex items-center">
                              <FiBarChart2 className="mr-1" /> {quiz.questions?.length || 0} questions
                            </span>
                            <span className="flex items-center">
                              <FiUsers className="mr-1" /> {quiz.totalStudents || 0} students
                            </span>
                            {quiz.isPublished && quiz.totalStudents > 0 && (
                              <span className="flex items-center">
                                Avg: <span className="ml-1 font-medium text-gray-700">{quiz.averageScore || 0}%</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleEditQuiz(quiz)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm font-medium"
                        >
                          <FiEdit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        
                        <button
                          onClick={() => handleTogglePublish(quiz)}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium ${
                            quiz.isPublished
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {quiz.isPublished ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                          <span>{quiz.isPublished ? 'Unpublish' : 'Publish'}</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateQuiz(quiz)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center space-x-2 text-sm font-medium"
                        >
                          <FiCopy className="w-4 h-4" />
                          <span>Duplicate</span>
                        </button>

                        <button
                          onClick={() => navigate(`/quiz/${quizId}/analytics`)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 text-sm font-medium"
                        >
                          <FiBarChart2 className="w-4 h-4" />
                          <span>Analytics</span>
                        </button>

                        <button
                          onClick={() => handleDeleteQuiz(quizId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 text-sm font-medium ml-auto"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <StudentManagement />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium opacity-90">Completion Rate</h4>
                    <FiTrendingUp className="w-5 h-5 opacity-80" />
                  </div>
                  <p className="text-4xl font-bold mb-2">87.5%</p>
                  <p className="text-sm opacity-80">↑ 12% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium opacity-90">Pass Rate</h4>
                    <FiCheckCircle className="w-5 h-5 opacity-80" />
                  </div>
                  <p className="text-4xl font-bold mb-2">72.3%</p>
                  <p className="text-sm opacity-80">↑ 5% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium opacity-90">Avg. Time</h4>
                    <FiClock className="w-5 h-5 opacity-80" />
                  </div>
                  <p className="text-4xl font-bold mb-2">24m</p>
                  <p className="text-sm opacity-80">↓ 3m from last month</p>
                </div>
              </div>

              {/* Performance Trends Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Trends</h3>
                <div className="relative h-64">
                  {/* Mock Line Chart */}
                  <div className="absolute inset-0 flex items-end justify-between px-4">
                    {[65, 72, 68, 78, 75, 82, 87, 85, 89, 92].map((height, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 mx-1">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer relative group"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {height}%
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">W{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center mt-4 space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Average Score</span>
                  </div>
                </div>
              </div>

              {/* Question Difficulty Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Question Difficulty</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Easy Questions', value: 45, color: 'bg-green-500', percentage: 92 },
                      { label: 'Medium Questions', value: 35, color: 'bg-yellow-500', percentage: 68 },
                      { label: 'Hard Questions', value: 20, color: 'bg-red-500', percentage: 41 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <span className="text-sm text-gray-600">{item.percentage}% correct</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`${item.color} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Students</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Sarah Johnson', score: 98, avatar: 'S', color: 'from-blue-500 to-blue-600' },
                      { name: 'Michael Chen', score: 95, avatar: 'M', color: 'from-green-500 to-green-600' },
                      { name: 'Emily Davis', score: 93, avatar: 'E', color: 'from-purple-500 to-purple-600' },
                      { name: 'James Wilson', score: 91, avatar: 'J', color: 'from-orange-500 to-orange-600' },
                      { name: 'Lisa Anderson', score: 89, avatar: 'L', color: 'from-pink-500 to-pink-600' },
                    ].map((student, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${student.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                            {student.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">Student</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{student.score}%</p>
                          <p className="text-xs text-gray-500">Avg Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Quiz Activity</h3>
                <div className="space-y-4">
                  {[
                    { student: 'Alex Thompson', quiz: 'JavaScript Fundamentals', score: 87, time: '2 hours ago', status: 'passed' },
                    { student: 'Maria Garcia', quiz: 'React Basics', score: 92, time: '4 hours ago', status: 'passed' },
                    { student: 'David Lee', quiz: 'CSS Grid & Flexbox', score: 58, time: '5 hours ago', status: 'failed' },
                    { student: 'Sophie Brown', quiz: 'Node.js Essentials', score: 95, time: '1 day ago', status: 'passed' },
                    { student: 'Chris Martin', quiz: 'Database Design', score: 78, time: '1 day ago', status: 'passed' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                          {activity.student.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{activity.student}</p>
                          <p className="text-sm text-gray-600">Completed: <span className="font-medium">{activity.quiz}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${activity.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                            {activity.score}%
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'passed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {activity.status === 'passed' ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Score Distribution</h3>
                <div className="flex items-end justify-between h-64 px-4">
                  {[
                    { range: '0-20', count: 2, height: 8 },
                    { range: '21-40', count: 5, height: 20 },
                    { range: '41-60', count: 12, height: 48 },
                    { range: '61-80', count: 28, height: 85 },
                    { range: '81-100', count: 35, height: 100 },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 mx-2">
                      <span className="text-sm font-bold text-gray-900 mb-2">{bar.count}</span>
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-700 hover:to-indigo-500 cursor-pointer relative group"
                        style={{ height: `${bar.height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {bar.count} students
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2 font-medium">{bar.range}%</span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">Total Attempts: <span className="font-bold text-gray-900">82</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}
    </div>
  )
}

export default EnhancedLecturerDashboard
