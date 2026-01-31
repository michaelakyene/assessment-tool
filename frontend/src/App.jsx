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
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingRole, setOnboardingRole] = useState(null)

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

  useEffect(() => {
    if (!user) {
      setShowOnboarding(false)
      setOnboardingRole(null)
      return
    }

    const role = user.role || 'student'
    const onboardingKey = `qm_onboarding_seen_v1_${role}`
    const hasSeen = localStorage.getItem(onboardingKey)

    if (!hasSeen) {
      setOnboardingRole(role)
      setShowOnboarding(true)
    }
  }, [user])

  const login = (userData) => {
    setUser(userData)
  }

  const dismissOnboarding = () => {
    if (!onboardingRole) {
      setShowOnboarding(false)
      return
    }
    const onboardingKey = `qm_onboarding_seen_v1_${onboardingRole}`
    localStorage.setItem(onboardingKey, '1')
    setShowOnboarding(false)
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
        {user && showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome to QuizMaster
                </h2>
                <p className="text-sm text-gray-600">
                  Quick tips to help you get started.
                </p>
              </div>
              <div className="px-6 py-5 space-y-4">
                {onboardingRole === 'lecturer' ? (
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                      Create your first quiz using the top “Create New Quiz” button.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                      Add at least one question and keep marks simple (default is 1).
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                      Use the Students tab to monitor student progress and attempts.
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      Open a quiz from your dashboard and read the instructions carefully.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      Your attempts are limited — submit only when you are ready.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      Review your results and feedback after finishing a quiz.
                    </li>
                  </ul>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={dismissOnboarding}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
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