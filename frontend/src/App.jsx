import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import EnhancedLecturerDashboard from './pages/EnhancedLecturerDashboard'
import CreateQuizPage from './pages/CreateQuizPage'
import StudentDashboard from './pages/StudentDashboard'
import TakeQuiz from './pages/TakeQuiz'
import ReviewQuiz from './pages/ReviewQuiz'
import Results from './pages/Results'
import Profile from './pages/Profile'
import QuizAnalytics from './pages/QuizAnalytics'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import useAuthStore from './store/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const { user, logout, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } catch (error) {
          console.error('Auth init error:', error)
          logout()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [logout, setUser])

  const login = (userData) => {
    setUser(userData)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="spinner h-12 w-12 border-4 border-primary-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
        {user && <Navbar user={user} logout={logout} />}
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login login={login} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={
                user ? (
                  user.role === 'lecturer' ? 
                    <EnhancedLecturerDashboard user={user} /> : 
                    <StudentDashboard user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/create-quiz" 
              element={user && user.role === 'lecturer' ? <CreateQuizPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/edit-quiz/:id" 
              element={user && user.role === 'lecturer' ? <CreateQuizPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/quiz/:id" 
              element={user ? <TakeQuiz user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/quiz/:id/review" 
              element={user ? <ReviewQuiz /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/quiz/:id/analytics" 
              element={user && user.role === 'lecturer' ? <QuizAnalytics /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/results/:attemptId" 
              element={user ? <Results user={user} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      
      {/* Footer */}
      {user && (
        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-600 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} QuizMaster - Student Assessment System
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                  Help Center
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
      </div>
    </ErrorBoundary>
  )
}

export default App